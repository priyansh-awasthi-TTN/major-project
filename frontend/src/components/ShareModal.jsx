import { useState, useEffect } from 'react';
import ApiService from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ShareModal({ isOpen, onClose, job, url }) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const { user } = useAuth();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Handle escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Clear feedback when modal opens
  useEffect(() => {
    if (isOpen) {
      setFeedback({ message: '', type: '' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const shareUrl = url || window.location.href;
  const shareTitle = job ? `${job.title} at ${job.company}` : 'Check out this job opportunity';
  const shareText = job ? `Found this amazing ${job.title} position at ${job.company} in ${job.location}. ${job.type} role with great benefits!` : 'Check out this job opportunity on JobHuntly';

  const showFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveJob = async () => {
    if (!user) {
      showFeedback('Please log in to save jobs', 'error');
      return;
    }

    if (!job?.id) {
      showFeedback('Job information not available', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.saveJob(job.id);
      if (response.success) {
        showFeedback(response.message, 'success');
      } else {
        showFeedback(response.message, 'warning');
      }
    } catch (error) {
      console.error('Save job error:', error);
      if (error.message.includes('Unauthorized') || error.message.includes('401')) {
        showFeedback('Please log in to save jobs', 'error');
      } else if (error.message.includes('404')) {
        showFeedback('Job not found', 'error');
      } else {
        showFeedback(error.message || 'Failed to save job', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToReadingList = async () => {
    if (!user) {
      showFeedback('Please log in to add to reading list', 'error');
      return;
    }

    if (!job?.id) {
      showFeedback('Job information not available', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.addToReadingList(job.id);
      if (response.success) {
        showFeedback(response.message, 'success');
      } else {
        showFeedback(response.message, 'warning');
      }
    } catch (error) {
      console.error('Add to reading list error:', error);
      if (error.message.includes('Unauthorized') || error.message.includes('401')) {
        showFeedback('Please log in to add to reading list', 'error');
      } else if (error.message.includes('404')) {
        showFeedback('Job not found', 'error');
      } else {
        showFeedback(error.message || 'Failed to add to reading list', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReportJob = async (reason, description) => {
    if (!user) {
      showFeedback('Please log in to report jobs', 'error');
      return;
    }

    if (!job?.id) {
      showFeedback('Job information not available', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.reportJob(job.id, reason, description);
      if (response.success) {
        showFeedback(response.message, 'success');
      } else {
        showFeedback(response.message, 'warning');
      }
    } catch (error) {
      console.error('Report job error:', error);
      if (error.message.includes('Unauthorized') || error.message.includes('401')) {
        showFeedback('Please log in to report jobs', 'error');
      } else if (error.message.includes('404')) {
        showFeedback('Job not found', 'error');
      } else {
        showFeedback(error.message || 'Failed to report job', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-green-500',
      action: () => {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
        window.open(whatsappUrl, '_blank');
        onClose();
      }
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      color: 'bg-blue-600',
      action: () => {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        window.open(linkedinUrl, '_blank');
        onClose();
      }
    },
    {
      name: 'Twitter',
      icon: '🐦',
      color: 'bg-blue-400',
      action: () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, '_blank');
        onClose();
      }
    },
    {
      name: 'Facebook',
      icon: '📘',
      color: 'bg-blue-700',
      action: () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(facebookUrl, '_blank');
        onClose();
      }
    },
    {
      name: 'Telegram',
      icon: '✈️',
      color: 'bg-blue-500',
      action: () => {
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        window.open(telegramUrl, '_blank');
        onClose();
      }
    },
    {
      name: 'Email',
      icon: '📧',
      color: 'bg-gray-600',
      action: () => {
        const emailUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
        window.location.href = emailUrl;
        onClose();
      }
    }
  ];

  const quickActions = [
    {
      name: 'Copy Link',
      icon: '📋',
      color: 'bg-gray-100',
      textColor: 'text-gray-700',
      action: handleCopyLink
    },
    {
      name: 'Save Job',
      icon: '🔖',
      color: user ? 'bg-yellow-100' : 'bg-gray-100',
      textColor: user ? 'text-yellow-700' : 'text-gray-500',
      action: handleSaveJob,
      disabled: !user
    },
    {
      name: 'Report Job',
      icon: '⚠️',
      color: user ? 'bg-red-100' : 'bg-gray-100',
      textColor: user ? 'text-red-700' : 'text-gray-500',
      action: () => setShowReportModal(true),
      disabled: !user
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-md max-h-[70vh] overflow-hidden shadow-2xl transform transition-all duration-300 ease-out flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: isOpen ? 'modalSlideIn 0.3s ease-out' : 'modalSlideOut 0.3s ease-in'
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Share Job</h3>
                <p className="text-sm text-gray-500 truncate max-w-48">
                  {job ? `${job.title} at ${job.company}` : 'Job Opportunity'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Feedback Message */}
          {feedback.message && (
            <div className={`mt-3 p-3 rounded-lg text-sm ${
              feedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
              feedback.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
              feedback.type === 'warning' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
              'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              <div className="flex items-center gap-2">
                {feedback.type === 'success' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {feedback.type === 'error' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {feedback.type === 'warning' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )}
                <span>{feedback.message}</span>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Share Options */}
          <div className="p-6">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Share via</h4>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={option.action}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                >
                  <div className={`w-12 h-12 ${option.color} rounded-full flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                    {option.icon}
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{option.name}</span>
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <h4 className="text-sm font-medium text-gray-700 mb-4">Quick Actions</h4>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <button
                  key={action.name}
                  onClick={action.disabled ? () => showFeedback('Please log in to use this feature', 'error') : action.action}
                  disabled={loading}
                  className={`w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${action.disabled ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <div className={`w-10 h-10 ${action.color} rounded-full flex items-center justify-center text-lg`}>
                    {loading && (action.name === 'Save Job' || action.name === 'Report Job') && !action.disabled ? (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    ) : (
                      action.icon
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-medium ${action.textColor || 'text-gray-900'}`}>
                      {action.name === 'Copy Link' && copied ? 'Copied!' : action.name}
                      {action.disabled && ' (Login Required)'}
                    </p>
                    {action.name === 'Copy Link' && (
                      <p className="text-xs text-gray-500 truncate">{shareUrl}</p>
                    )}
                  </div>
                  {action.name === 'Copy Link' && copied && (
                    <div className="text-green-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Additional Options */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="space-y-3">
                <button className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    window.open(shareUrl, '_blank');
                    onClose();
                  }}>
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">Open in Browser</p>
                    <p className="text-xs text-gray-500">View in new tab</p>
                  </div>
                </button>

                <button className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    if (!user) {
                      showFeedback('Please log in to add to reading list', 'error');
                      return;
                    }
                    handleAddToReadingList();
                  }}>
                  <div className={`w-10 h-10 ${user ? 'bg-purple-50' : 'bg-gray-100'} rounded-full flex items-center justify-center`}>
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                    ) : (
                      <svg className={`w-5 h-5 ${user ? 'text-purple-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-medium ${user ? 'text-gray-900' : 'text-gray-500'}`}>
                      Add to Reading List{!user && ' (Login Required)'}
                    </p>
                    <p className="text-xs text-gray-500">Save for later</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Cancel Button */}
        <div className="p-6 pt-0 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Report Job Modal */}
      {showReportModal && (
        <ReportJobModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          job={job}
          onReport={(reason, description) => {
            handleReportJob(reason, description);
            setShowReportModal(false);
          }}
        />
      )}

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes modalSlideOut {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
        }
      `}</style>
    </div>
  );
}

// Report Job Modal Component
function ReportJobModal({ isOpen, onClose, job, onReport }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const reportReasons = [
    'Spam or Fake Job',
    'Inappropriate Content',
    'Misleading Information',
    'Duplicate Posting',
    'Discriminatory Content',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) return;

    setLoading(true);
    try {
      await onReport(reason, description);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-60 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Report Job</h3>
                <p className="text-sm text-gray-500">Help us keep the platform safe</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Why are you reporting this job?
            </label>
            <div className="space-y-2">
              {reportReasons.map((reasonOption) => (
                <label key={reasonOption} className="flex items-center">
                  <input
                    type="radio"
                    name="reason"
                    value={reasonOption}
                    checked={reason === reasonOption}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">{reasonOption}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Details (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide more details about the issue..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!reason || loading}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium py-3 rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Reporting...
                </>
              ) : (
                'Submit Report'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
