import { useState } from 'react';
import { Link } from 'react-router-dom';
import { applications } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import DropdownMenu from '../../components/DropdownMenu';
import DashTopBar from '../../components/DashTopBar';

const statusStyle = {
  'In Review':    'border border-yellow-400 text-yellow-600',
  'Shortlisted':  'border border-blue-400 text-blue-600',
  'Declined':     'border border-red-400 text-red-600',
  'Interviewing': 'border border-purple-400 text-purple-600',
  'Offered':      'border border-green-400 text-green-600',
};

const interviews = [
  { time: '10:00 AM', name: null },
  { time: '10:30 AM', name: 'Joe Bartmann', role: 'HR Manager at Divvy', active: true },
  { time: '11:00 AM', name: null },
];

export default function DashboardHome() {
  const { user } = useAuth();
  const firstName = (user?.name || 'Jake').split(' ')[0];
  const [openMenu, setOpenMenu] = useState(null);

  const appMenuItems = (_app) => [
    { icon: '👁️', label: 'View Details', action: () => {} },
    { icon: '📄', label: 'View Job Posting', action: () => {} },
    { icon: '✉️', label: 'Message Recruiter', action: () => {} },
    'divider',
    { icon: '🗑️', label: 'Remove Application', action: () => {}, danger: true },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      <DashTopBar title="Dashboard" />
      <div className="overflow-y-auto flex-1 px-8 py-6">
        {/* Greeting */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Good morning, {firstName} 👋</h2>
            <p className="text-sm text-gray-500 mt-0.5">Here is what's happening with your job search applications from July 19 - July 25.</p>
          </div>
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white">
            <span>Jul 19 - Jul 25</span>
            <span>📅</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-5 mb-6">
          {/* Total Jobs Applied */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-3">Total Jobs Applied</p>
            <div className="flex items-end justify-between">
              <p className="text-5xl font-bold text-gray-900">45</p>
              <span className="text-4xl opacity-20">📄</span>
            </div>
          </div>

          {/* Jobs Applied Status */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-3">Jobs Applied Status</p>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3.5" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#4f46e5" strokeWidth="3.5"
                    strokeDasharray="60 40" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-xs space-y-2">
                <p className="flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 bg-indigo-600 rounded-sm" />
                  <span className="font-semibold">60%</span>
                  <span className="text-gray-400">Unsuitable</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 bg-gray-200 rounded-sm" />
                  <span className="font-semibold">40%</span>
                  <span className="text-gray-400">Interviewed</span>
                </p>
                <Link to="/dashboard/applications" className="text-blue-600 text-xs hover:underline block mt-2">
                  View All Applications →
                </Link>
              </div>
            </div>
          </div>

          {/* Upcoming Interviews */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-3">Upcomming Interviews</p>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-800">Today, 26 November</p>
              <div className="flex gap-1">
                <button className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 text-xs">‹</button>
                <button className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 text-xs">›</button>
              </div>
            </div>
            <div className="space-y-2">
              {interviews.map((slot, i) => (
                <div key={i} className={`flex items-center gap-3 py-1.5 px-2 rounded-lg ${slot.active ? 'bg-blue-50' : ''}`}>
                  <span className={`text-xs w-14 flex-shrink-0 ${slot.active ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                    {slot.time}
                  </span>
                  {slot.name ? (
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-300 to-red-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {slot.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{slot.name}</p>
                        <p className="text-xs text-gray-400">{slot.role}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-px flex-1 bg-gray-100" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interviewed stat */}
        <div className="grid grid-cols-3 gap-5 mb-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-3">Interviewed</p>
            <div className="flex items-end justify-between">
              <p className="text-5xl font-bold text-gray-900">18</p>
              <span className="text-4xl opacity-20">❓</span>
            </div>
          </div>
          <div className="col-span-2" />
        </div>

        {/* Recent Applications History */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-semibold text-gray-900">Recent Applications History</h2>
          </div>
          <div className="space-y-4">
            {applications.slice(0, 3).map(app => (
              <div key={app.id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                <div className={`${app.color} text-white rounded-xl w-11 h-11 flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                  {app.logo}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{app.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{app.company} • {app.location} • {app.type}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">Date Applied</p>
                  <p className="text-sm font-medium text-gray-700">{app.dateApplied}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium flex-shrink-0 ${statusStyle[app.status] || 'border border-gray-300 text-gray-500'}`}>
                  {app.status}
                </span>
                <div className="relative flex-shrink-0">
                  <button onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === app.id ? null : app.id); }}
                    className="text-gray-400 hover:text-gray-600 px-1">•••</button>
                  {openMenu === app.id && (
                    <DropdownMenu items={appMenuItems(app)} onClose={() => setOpenMenu(null)} />
                  )}
                </div>
              </div>
            ))}
          </div>
          <Link to="/dashboard/applications" className="text-blue-600 text-sm mt-4 flex items-center justify-center gap-1 hover:underline">
            View all applications history →
          </Link>
        </div>
      </div>
    </div>
  );
}
