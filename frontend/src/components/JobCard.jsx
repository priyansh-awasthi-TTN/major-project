import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ShareModal from './ShareModal';

export default function JobCard({ job, grid = false, dashboard = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);
  const basePath = dashboard ? '/dashboard/jobs' : '/jobs';
  
  const handleApply = (e) => {
    e.preventDefault();
    if (!user && !dashboard) {
      navigate('/login');
      return;
    }
    navigate(`${basePath}/${job.id}`);
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShareModal(true);
  };

  const jobUrl = `${window.location.origin}${basePath}/${job.id}`;
  
  return (
    <>
    <div className={`bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition ${grid ? '' : 'flex items-start gap-4'}`}>
      <div className={`${job.color} text-white rounded-xl w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0 ${grid ? 'mb-3' : ''}`}>
        {job.logo}
      </div>
      <div className="flex-1">
        <div className={`flex items-start ${grid ? 'flex-col gap-1' : 'justify-between'}`}>
          <div>
            <span className="text-xs border border-green-500 text-green-600 rounded px-2 py-0.5 mr-2">{job.type}</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleShare}
              className="text-gray-400 hover:text-blue-600 transition p-1"
              title="Share job"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
            {!grid && (
              <button 
                onClick={handleApply}
                className="bg-blue-50 text-blue-600 text-sm px-4 py-1.5 rounded hover:bg-blue-600 hover:text-white transition"
              >
                Apply
              </button>
            )}
          </div>
        </div>
        <Link to={`${basePath}/${job.id}`}>
          <h3 className="font-semibold text-gray-900 mt-2 hover:text-blue-600 cursor-pointer">{job.title}</h3>
        </Link>
        <p className="text-sm text-gray-500">{job.company} • {job.location}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {job.categories.map(c => (
            <span key={c} className="text-xs bg-orange-50 text-orange-600 border border-orange-200 rounded px-2 py-0.5">{c}</span>
          ))}
        </div>
        {grid && (
          <div className="mt-3 flex gap-2">
            <button 
              onClick={handleApply}
              className="flex-1 bg-blue-50 text-blue-600 text-sm px-4 py-1.5 rounded hover:bg-blue-600 hover:text-white transition"
            >
              Apply
            </button>
            <button 
              onClick={handleShare}
              className="text-gray-400 hover:text-blue-600 transition p-1.5"
              title="Share job"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-2">{job.applied} applied of {job.capacity} capacity</p>
      </div>
    </div>
    <ShareModal 
      isOpen={showShareModal} 
      onClose={() => setShowShareModal(false)} 
      job={job}
      url={jobUrl}
    />
    </>
  );
}
