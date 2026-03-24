import { Link } from 'react-router-dom';

export default function JobCard({ job, grid = false, dashboard = false }) {
  const basePath = dashboard ? '/dashboard/jobs' : '/jobs';
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition ${grid ? '' : 'flex items-start gap-4'}`}>
      <div className={`${job.color} text-white rounded-xl w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0 ${grid ? 'mb-3' : ''}`}>
        {job.logo}
      </div>
      <div className="flex-1">
        <div className={`flex items-start ${grid ? 'flex-col gap-1' : 'justify-between'}`}>
          <div>
            <span className="text-xs border border-green-500 text-green-600 rounded px-2 py-0.5 mr-2">{job.type}</span>
          </div>
          {!grid && (
            <Link to={`${basePath}/${job.id}`}>
              <button className="bg-blue-50 text-blue-600 text-sm px-4 py-1.5 rounded hover:bg-blue-600 hover:text-white transition">Apply</button>
            </Link>
          )}
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
          <div className="mt-3">
            <Link to={`${basePath}/${job.id}`}>
              <button className="w-full bg-blue-50 text-blue-600 text-sm px-4 py-1.5 rounded hover:bg-blue-600 hover:text-white transition">Apply</button>
            </Link>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-2">{job.applied} applied of {job.capacity} capacity</p>
      </div>
    </div>
  );
}
