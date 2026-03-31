import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import ApiService from '../services/api';

export default function ApplicationDetail() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchApplicationDetail();
  }, [applicationId, user]);

  const fetchApplicationDetail = async () => {
    try {
      setLoading(true);
      const response = await ApiService.request(`/applications/${applicationId}`);
      setApplication(response);
    } catch (error) {
      console.error('Error fetching application:', error);
      setError(error.message);
      showToast('Failed to load application details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'interview':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The application you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={() => navigate('/dashboard/applications')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => navigate('/dashboard/applications')}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Applied on {formatDate(application.appliedDate)}</span>
                <span>•</span>
                <span>Application ID: #{application.id}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                {application.status || 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Job Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{application.jobTitle}</h3>
              <p className="text-gray-600 mb-2">{application.companyName}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{application.jobLocation}</span>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => navigate(`/jobs/${application.jobId}`)}
                className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Job Posting
              </button>
            </div>
          </div>
        </div>

        {/* Application Documents */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Documents</h2>
          <div className="space-y-4">
            {application.resumeUrl && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Resume</p>
                    <p className="text-sm text-gray-500">PDF Document</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(application.resumeUrl, '_blank')}
                    className="text-blue-600 hover:text-blue-700 px-3 py-1 text-sm font-medium"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = application.resumeUrl;
                      link.download = 'resume.pdf';
                      link.click();
                    }}
                    className="text-gray-600 hover:text-gray-700 px-3 py-1 text-sm font-medium"
                  >
                    Download
                  </button>
                </div>
              </div>
            )}

            {application.coverLetter && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Cover Letter</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{application.coverLetter}</p>
              </div>
            )}
          </div>
        </div>

        {/* Messages from Recruiter */}
        {application.recruiterMessages && application.recruiterMessages.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Messages from Recruiter</h2>
            <div className="space-y-4">
              {application.recruiterMessages.map((message, index) => (
                <div key={index} className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{message.senderName}</span>
                    <span className="text-sm text-gray-500">{formatDate(message.timestamp)}</span>
                  </div>
                  <p className="text-gray-700">{message.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interview Schedule */}
        {application.interviewSchedule && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Interview Schedule</h2>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium text-green-900">Interview Scheduled</span>
              </div>
              <p className="text-green-800 mb-1">
                <strong>Date:</strong> {formatDate(application.interviewSchedule.date)}
              </p>
              <p className="text-green-800 mb-1">
                <strong>Time:</strong> {application.interviewSchedule.time}
              </p>
              {application.interviewSchedule.location && (
                <p className="text-green-800 mb-1">
                  <strong>Location:</strong> {application.interviewSchedule.location}
                </p>
              )}
              {application.interviewSchedule.notes && (
                <p className="text-green-800">
                  <strong>Notes:</strong> {application.interviewSchedule.notes}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Application Timeline */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Timeline</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Application Submitted</p>
                <p className="text-sm text-gray-500">{formatDate(application.appliedDate)}</p>
              </div>
            </div>
            
            {application.status === 'interview' && (
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Interview Scheduled</p>
                  <p className="text-sm text-gray-500">Interview arranged with the hiring team</p>
                </div>
              </div>
            )}
            
            {(application.status === 'accepted' || application.status === 'rejected') && (
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${application.status === 'accepted' ? 'bg-green-600' : 'bg-red-600'}`}></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    Application {application.status === 'accepted' ? 'Accepted' : 'Rejected'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {application.status === 'accepted' 
                      ? 'Congratulations! You have been selected for this position.'
                      : 'Thank you for your interest. We have decided to move forward with other candidates.'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}