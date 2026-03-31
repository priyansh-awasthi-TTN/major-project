import { useState, useEffect } from 'react';
import ApiService from '../services/api';

export default function JobActionsManager() {
  const [activeTab, setActiveTab] = useState('saved');
  const [savedJobs, setSavedJobs] = useState([]);
  const [readingList, setReadingList] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'saved':
          const savedResponse = await ApiService.getSavedJobs();
          setSavedJobs(savedResponse);
          break;
        case 'reading':
          const readingResponse = await ApiService.getReadingList();
          setReadingList(readingResponse);
          break;
        case 'reports':
          const reportsResponse = await ApiService.getUserReports();
          setReports(reportsResponse);
          break;
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveJob = async (jobId) => {
    try {
      await ApiService.unsaveJob(jobId);
      setSavedJobs(prev => prev.filter(item => item.job.id !== jobId));
    } catch (error) {
      console.error('Failed to unsave job:', error);
    }
  };

  const handleRemoveFromReadingList = async (jobId) => {
    try {
      await ApiService.removeFromReadingList(jobId);
      setReadingList(prev => prev.filter(item => item.job.id !== jobId));
    } catch (error) {
      console.error('Failed to remove from reading list:', error);
    }
  };

  const handleMarkAsRead = async (jobId) => {
    try {
      await ApiService.markAsRead(jobId);
      setReadingList(prev => prev.map(item => 
        item.job.id === jobId ? { ...item, isRead: true } : item
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const tabs = [
    { id: 'saved', name: 'Saved Jobs', icon: '🔖' },
    { id: 'reading', name: 'Reading List', icon: '📚' },
    { id: 'reports', name: 'Reports', icon: '⚠️' }
  ];

  const renderJobItem = (item, type) => {
    const job = item.job || item;
    
    return (
      <div key={`${type}-${job.id}`} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>
            <p className="text-sm text-gray-600 mb-1">{job.company}</p>
            <p className="text-xs text-gray-500">{job.location} • {job.type}</p>
          </div>
          <div className="flex gap-2 ml-4">
            {type === 'saved' && (
              <button
                onClick={() => handleUnsaveJob(job.id)}
                className="text-red-500 hover:text-red-700 text-sm"
                title="Remove from saved"
              >
                Remove
              </button>
            )}
            {type === 'reading' && (
              <>
                {!item.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(job.id)}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                    title="Mark as read"
                  >
                    Mark Read
                  </button>
                )}
                <button
                  onClick={() => handleRemoveFromReadingList(job.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                  title="Remove from reading list"
                >
                  Remove
                </button>
              </>
            )}
          </div>
        </div>
        
        {type === 'saved' && item.notes && (
          <div className="mt-2 p-2 bg-yellow-50 rounded text-sm text-gray-700">
            <strong>Notes:</strong> {item.notes}
          </div>
        )}
        
        {type === 'reading' && (
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span>Added: {new Date(item.addedAt).toLocaleDateString()}</span>
            {item.isRead && <span className="text-green-600">✓ Read</span>}
          </div>
        )}
        
        {type === 'reports' && (
          <div className="mt-2 text-sm">
            <div className="text-red-600 font-medium">Reason: {item.reason}</div>
            {item.description && (
              <div className="text-gray-600 mt-1">{item.description}</div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              Reported: {new Date(item.reportedAt).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Job Actions</h1>
      
      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-96">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === 'saved' && (
              <>
                {savedJobs.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">🔖</div>
                    <p>No saved jobs yet</p>
                    <p className="text-sm">Jobs you save will appear here</p>
                  </div>
                ) : (
                  savedJobs.map(item => renderJobItem(item, 'saved'))
                )}
              </>
            )}
            
            {activeTab === 'reading' && (
              <>
                {readingList.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">📚</div>
                    <p>Your reading list is empty</p>
                    <p className="text-sm">Jobs you add to reading list will appear here</p>
                  </div>
                ) : (
                  readingList.map(item => renderJobItem(item, 'reading'))
                )}
              </>
            )}
            
            {activeTab === 'reports' && (
              <>
                {reports.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">⚠️</div>
                    <p>No reports submitted</p>
                    <p className="text-sm">Jobs you report will appear here</p>
                  </div>
                ) : (
                  reports.map(item => renderJobItem(item, 'reports'))
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}