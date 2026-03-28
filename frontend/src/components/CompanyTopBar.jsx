import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CompanyTopBar({ title, subtitle }) {
  const { user } = useAuth();
  const companyName = user?.fullName || 'Company';
  const initials = companyName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between flex-shrink-0">
      {/* Left: company identity */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-xs text-gray-400 leading-none mb-0.5">Company</p>
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-gray-900">{companyName}</span>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-400">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        {title && <h1 className="text-lg font-bold text-gray-900 mr-4">{title}</h1>}
        <button className="relative p-2 text-gray-400 hover:text-gray-600">
          🔔
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <Link to="/company/jobs/post" className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-1 font-medium">
          + Post a Job
        </Link>
      </div>
    </div>
  );
}
