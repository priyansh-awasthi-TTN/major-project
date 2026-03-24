import { Link } from 'react-router-dom';
import CompanyTopBar from '../../components/CompanyTopBar';
import { applicants, jobListings } from '../../data/companyMockData';

const statusColor = {
  'In Review': 'bg-blue-100 text-blue-600',
  'Shortlisted': 'bg-yellow-100 text-yellow-700',
  'Declined': 'bg-red-100 text-red-600',
  'Interviewing': 'bg-purple-100 text-purple-600',
};

export default function CompanyDashboard() {
  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      <CompanyTopBar />
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Good morning, Maria</h1>
            <p className="text-sm text-gray-500">Here is your job listings statistic report from July 19 - July 25.</p>
          </div>
          <div className="flex gap-2">
            <button className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">Jobs View</button>
            <button className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">Month</button>
            <button className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">Week</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-600 text-white rounded-xl p-6">
            <p className="text-sm text-blue-200 mb-1">New candidates to review</p>
            <p className="text-4xl font-bold">76</p>
            <p className="text-xs text-blue-200 mt-2">↑ This week</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Schedule for today</p>
            <p className="text-4xl font-bold text-gray-900">3</p>
            <p className="text-xs text-gray-400 mt-2">↑ Today</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Messages received</p>
            <p className="text-4xl font-bold text-gray-900">24</p>
            <p className="text-xs text-gray-400 mt-2">↑ This week</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Chart area */}
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-900">Job statistics</h2>
                <div className="flex gap-2 text-xs">
                  <button className="bg-blue-600 text-white px-3 py-1 rounded">Week</button>
                  <button className="text-gray-500 px-3 py-1 rounded hover:bg-gray-100">Month</button>
                  <button className="text-gray-500 px-3 py-1 rounded hover:bg-gray-100">Year</button>
                </div>
              </div>
              {/* Bar chart mock */}
              <div className="flex items-end gap-3 h-32 mt-4">
                {[60, 80, 45, 90, 55, 70, 85, 40, 75, 95, 50, 65].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t" style={{ height: `${h}%`, background: i % 2 === 0 ? '#3b82f6' : '#a78bfa' }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => <span key={m}>{m}</span>)}
              </div>
            </div>

            {/* Job Opens */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-sm text-gray-500">Job Opens</p>
                  <p className="text-3xl font-bold text-gray-900">12 <span className="text-sm text-gray-400 font-normal">Jobs Opened</span></p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Job Views</p>
                  <p className="text-2xl font-bold text-gray-900">2,342 <span className="text-xs text-green-500">↑ 6.4%</span></p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Jobs Applied</p>
                  <p className="text-2xl font-bold text-gray-900">654 <span className="text-xs text-red-500">↓ 0.5%</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Applicants Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Applicants Summary</h3>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'Full Time', count: 40, color: 'bg-blue-500' },
                  { label: 'Part Time', count: 12, color: 'bg-purple-400' },
                  { label: 'Internship', count: 10, color: 'bg-yellow-400' },
                  { label: 'Freelance', count: 5, color: 'bg-green-400' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="flex-1 text-gray-600">{item.label}</span>
                    <span className="font-medium text-gray-800">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Job Updates */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">Job Updates</h2>
            <Link to="/company/jobs" className="text-blue-600 text-sm hover:underline">See All →</Link>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {applicants.slice(0, 4).map(a => (
              <div key={a.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`${a.color} text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold`}>{a.avatar}</div>
                  <div>
                    <p className="text-xs font-medium text-gray-800">{a.name}</p>
                    <p className="text-xs text-gray-400">{a.role}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[a.stage] || 'bg-gray-100 text-gray-600'}`}>{a.stage}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
