const API_BASE_URL = 'http://localhost:8081/api';

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
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
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

  async updateCompanyApplicationStatus(id, status) {
    return this.request(`/company/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
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
}

export default new ApiService();