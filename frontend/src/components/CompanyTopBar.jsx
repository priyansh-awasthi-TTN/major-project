import { Link } from 'react-router-dom';

export default function CompanyTopBar({ title, subtitle }) {
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
      <div>
        {title && <h1 className="text-lg font-bold text-gray-900">{title}</h1>}
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-gray-400 hover:text-gray-600">
          🔔
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <Link to="/company/jobs/post" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1">
          + Post a Job
        </Link>
      </div>
    </div>
  );
}
