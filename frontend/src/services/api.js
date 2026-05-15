const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const API_ORIGIN = new URL(API_BASE_URL).origin;

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      console.log('Making API request to:', url, 'with config:', config);
      const response = await fetch(url, config);

      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error('Failed to parse JSON response:', e);
        throw new Error('Invalid response from server');
      }

      console.log('API response:', { status: response.status, data });

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          throw new Error('Unauthorized - Please log in again');
        } else if (response.status === 403) {
          throw new Error('Access denied');
        } else if (response.status === 404) {
          throw new Error('Resource not found');
        } else if (response.status === 500) {
          throw new Error('Server error - Please try again later');
        } else {
          throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
        }
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async refreshToken(refreshToken) {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async verifyToken() {
    return this.request('/auth/verify');
  }

  async getMyProfile() {
    return this.request('/profile/me');
  }

  async updateMyProfile(profileData) {
    return this.request('/profile/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async updateMyLoginDetails(loginDetails) {
    return this.request('/profile/me/login-details', {
      method: 'PUT',
      body: JSON.stringify(loginDetails),
    });
  }

  async updateMyNotificationPreferences(preferences) {
    return this.request('/profile/me/notifications', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', { method: 'POST' });
  }

  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    const token = sessionStorage.getItem('accessToken');
    const response = await fetch(`${this.baseURL}/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Upload failed');
    return data;
  }

  resolveFileUrl(url) {
    if (!url) return '';
    return /^https?:\/\//i.test(url) ? url : `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  // Application endpoints
  async getApplications() {
    return this.request('/applications');
  }

  async getDashboardStats() {
    return this.request('/applications/stats');
  }

  async checkApplicationStatus(jobId) {
    return this.request(`/applications/check/${jobId}`);
  }

  async requestFollowup(id) {
    return this.request(`/applications/${id}/follow-up`, { method: 'POST' });
  }

  async submitAssessment(id) {
    return this.request(`/applications/${id}/submit-assessment`, { method: 'POST' });
  }

  async createApplication(data) {
    return this.request('/applications', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateApplicationStatus(id, status) {
    return this.request(`/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  }

  async deleteApplication(id) {
    return this.request(`/applications/${id}`, { method: 'DELETE' });
  }

  // Company endpoints
  async getCompanyApplications() {
    return this.request('/company/applications');
  }

  async getCompanyJobs() {
    return this.request('/company/applications/jobs');
  }

  async updateCompanyApplicationStatus(id, payload) {
    const body = typeof payload === 'string' ? { status: payload } : payload;
    return this.request(`/company/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) });
  }

  async getCompanyCalendar(startDate, endDate) {
    return this.request(`/company/calendar?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`);
  }

  async createCompanyCalendarCategory(data) {
    return this.request('/company/calendar/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCompanyCalendarCategory(id, data) {
    return this.request(`/company/calendar/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async createCompanyCalendarEvent(data) {
    return this.request('/company/calendar/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCompanyCalendarEvent(id, data) {
    return this.request(`/company/calendar/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCompanyCalendarEvent(id) {
    return this.request(`/company/calendar/events/${id}`, {
      method: 'DELETE',
    });
  }

  // Google Meet integration
  async createGoogleMeetLink(eventDetails) {
    return this.request('/company/calendar/create-meet-link', {
      method: 'POST',
      body: JSON.stringify(eventDetails),
    });
  }

  // Job endpoints
  async getJobs() {
    return this.request('/jobs');
  }

  async getJob(id) {
    return this.request(`/jobs/${id}`);
  }

  async createJob(data) {
    return this.request('/jobs', { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteJob(id) {
    return this.request(`/jobs/${id}`, { method: 'DELETE' });
  }

  // Job Action endpoints
  async saveJob(jobId, notes = '') {
    return this.request('/job-actions/save', {
      method: 'POST',
      body: JSON.stringify({ jobId, notes }),
    });
  }

  async unsaveJob(jobId) {
    return this.request(`/job-actions/save/${jobId}`, { method: 'DELETE' });
  }

  async getSavedJobs() {
    return this.request('/job-actions/saved');
  }

  async isJobSaved(jobId) {
    return this.request(`/job-actions/saved/${jobId}`);
  }

  async reportJob(jobId, reason, description = '') {
    return this.request('/job-actions/report', {
      method: 'POST',
      body: JSON.stringify({ jobId, reason, description }),
    });
  }

  async getUserReports() {
    return this.request('/job-actions/reports');
  }

  async addToReadingList(jobId) {
    return this.request(`/job-actions/reading-list/${jobId}`, { method: 'POST' });
  }

  async removeFromReadingList(jobId) {
    return this.request(`/job-actions/reading-list/${jobId}`, { method: 'DELETE' });
  }

  async markAsRead(jobId) {
    return this.request(`/job-actions/reading-list/${jobId}/read`, { method: 'PATCH' });
  }

  async getReadingList() {
    return this.request('/job-actions/reading-list');
  }

  async getUnreadItems() {
    return this.request('/job-actions/reading-list/unread');
  }

  async isInReadingList(jobId) {
    return this.request(`/job-actions/reading-list/${jobId}`);
  }

  // New unified job action methods
  async shareJob(jobId, shareMethod) {
    return this.request(`/job-actions/share/${jobId}`, {
      method: 'POST',
      body: JSON.stringify({ shareMethod }),
    });
  }

  async getAllUserActions() {
    return this.request('/job-actions/all');
  }

  async getSharedJobs() {
    return this.request('/job-actions/shared');
  }

  // Chat endpoints
  async getChatConversations() {
    return this.request('/chat/conversations');
  }

  async getChatMessages(otherUserId) {
    return this.request(`/chat/messages/${otherUserId}`);
  }

  async getUnreadMessageCount() {
    return this.request('/chat/unread-count');
  }

  async getUnreadMessageCountBetweenUsers(otherUserId) {
    return this.request(`/chat/unread-count/${otherUserId}`);
  }

  async markMessagesAsRead(otherUserId) {
    return this.request(`/chat/mark-read/${otherUserId}`, { method: 'POST' });
  }

  // Network endpoints
  async getNetworkUsers() {
    return this.request('/network/users');
  }

  async getNetworkUser(userId) {
    return this.request(`/network/users/${userId}`);
  }

  // Help center endpoints
  async getHelpCenterArticles() {
    return this.request('/help-center/articles');
  }

  async submitHelpArticleFeedback(articleId, helpful) {
    return this.request(`/help-center/articles/${articleId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ helpful }),
    });
  }

  async reportHelpArticle(articleId) {
    return this.request(`/help-center/articles/${articleId}/report`, {
      method: 'POST',
    });
  }

  async createHelpSupportTicket(data) {
    return this.request('/help-center/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getHelpSupportTickets() {
    return this.request('/help-center/tickets');
  }
}

export default new ApiService();
