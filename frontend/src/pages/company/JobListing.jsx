import { Link } from 'react-router-dom';
import CompanyTopBar from '../../components/CompanyTopBar';
import { jobListings } from '../../data/companyMockData';

export default function JobListing() {
  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      <CompanyTopBar title="Job Listing" subtitle="Here is your jobs listing status from July 19 - July 25." />
      <div className="p-8" style={{ marginTop: '60px' }}>
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <p className="font-semibold text-gray-900">Job List</p>
            <button className="border border-gray-300 text-gray-600 text-sm px-3 py-1.5 rounded-lg hover:bg-gray-50">Filter</button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs border-b border-gray-100">
                <th className="text-left p-4">Roles</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Date Posted</th>
                <th className="text-left p-4">Due Date</th>
                <th className="text-left p-4">Job Type</th>
                <th className="text-left p-4">Applicants</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {jobListings.map(job => (
                <tr key={job.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`${job.color} text-white rounded-lg w-8 h-8 flex items-center justify-center text-xs font-bold`}>{job.title[0]}</div>
                      <p className="font-medium text-gray-800">{job.title}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${job.status === 'Live' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{job.status}</span>
                  </td>
                  <td className="p-4 text-gray-500">{job.datePosted}</td>
                  <td className="p-4 text-gray-500">{job.dueDate}</td>
                  <td className="p-4 text-gray-500">{job.jobType}</td>
                  <td className="p-4 text-gray-700 font-medium">{job.applications}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Link to={`/company/jobs/${job.id}/applicants`} className="text-blue-600 text-xs border border-blue-600 px-2 py-1 rounded hover:bg-blue-50">View Applicants</Link>
                      <Link to={`/company/jobs/${job.id}/detail`} className="text-gray-600 text-xs border border-gray-300 px-2 py-1 rounded hover:bg-gray-50">Job Details</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center p-4">
            <p className="text-xs text-gray-400">View 10 applicants per page</p>
            <div className="flex gap-2">
              {[1,2].map(p => (
                <button key={p} className={`w-8 h-8 rounded text-sm ${p === 1 ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
