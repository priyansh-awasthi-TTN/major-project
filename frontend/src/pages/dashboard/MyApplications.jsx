import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DropdownMenu from '../../components/DropdownMenu';
import { useAuth } from '../../context/AuthContext';
import DashTopBar from '../../components/DashTopBar';
import Toast from '../../components/Toast';
import { messages } from '../../data/mockData';

const allApplications = [
  { id: 1,  company: 'Nomad',        logo: 'N',  color: 'bg-emerald-500', location: 'Paris, France',        title: 'Social Media Assistant', dateApplied: '24 July 2021', status: 'In Review',    salary: '$75k-$85k', type: 'Full-Time', note: 'Application under review by the hiring team.' },
  { id: 2,  company: 'Udacity',      logo: 'U',  color: 'bg-cyan-500',    location: 'New York, USA',         title: 'Social Media Assistant', dateApplied: '20 July 2021', status: 'In Review',    salary: '$60k-$70k', type: 'Full-Time', note: 'Recruiter viewed your profile.' },
  { id: 3,  company: 'Dropbox',      logo: 'D',  color: 'bg-blue-600',    location: 'San Francisco, USA',    title: 'Brand Designer',         dateApplied: '18 July 2021', status: 'In Review',    salary: '$90k-$110k', type: 'Full-Time', note: 'Awaiting hiring manager decision.' },
  { id: 4,  company: 'Stripe',       logo: 'S',  color: 'bg-indigo-600',  location: 'New York, USA',         title: 'Lead Engineer',          dateApplied: '15 July 2021', status: 'Interviewing', salary: '$120k-$140k', type: 'Full-Time', interviewDate: '28 July 2021, 10:00 AM', interviewer: 'Ally Wales', interviewerRole: 'Engineering Manager', round: 'Round 2 — Technical', note: 'Prepare system design questions.' },
  { id: 5,  company: 'Divvy',        logo: 'Dv', color: 'bg-teal-500',    location: 'Salt Lake City, USA',   title: 'Social Media Assistant', dateApplied: '14 July 2021', status: 'Interviewing', salary: '$55k-$65k', type: 'Full-Time', interviewDate: '27 July 2021, 2:00 PM', interviewer: 'Joe Bartmann', interviewerRole: 'HR Manager', round: 'Round 1 — HR Screen', note: 'Bring portfolio samples.' },
  { id: 6,  company: 'Terraform',    logo: 'T',  color: 'bg-purple-500',  location: 'Hamburg, Germany',      title: 'Interactive Developer',  dateApplied: '12 July 2021', status: 'Interviewing', salary: '$80k-$95k', type: 'Full-Time', interviewDate: '29 July 2021, 4:00 PM', interviewer: 'Ruben Culhane', interviewerRole: 'Tech Lead', round: 'Round 3 — Final', note: 'Final round with CTO.' },
  { id: 7,  company: 'Coinbase',     logo: 'C',  color: 'bg-yellow-500',  location: 'London, UK',            title: 'Product Designer',       dateApplied: '10 July 2021', status: 'Assessment',   salary: '$95k-$115k', type: 'Part-Time', assessmentDue: '30 July 2021', assessmentType: 'Design Challenge', note: 'Create a mobile onboarding flow for a crypto wallet.' },
  { id: 8,  company: 'Revolut',      logo: 'Rv', color: 'bg-red-500',     location: 'Madrid, Spain',         title: 'Email Marketing',        dateApplied: '8 July 2021',  status: 'Assessment',   salary: '$65k-$75k', type: 'Full-Time', assessmentDue: '31 July 2021', assessmentType: 'Marketing Case Study', note: 'Prepare a 30-day email campaign strategy.' },
  { id: 9,  company: 'Packer',       logo: 'P',  color: 'bg-orange-500',  location: 'Madrid, Spain',         title: 'Visual Designer',        dateApplied: '5 July 2021',  status: 'Offered',      salary: '$70k-$80k', type: 'Full-Time', offerExpiry: '1 Aug 2021', offerBonus: '$5,000 signing bonus', note: 'Offer letter sent to your email.' },
  { id: 10, company: 'Webflow',      logo: 'W',  color: 'bg-blue-700',    location: 'San Francisco, USA',    title: 'Brand Designer',         dateApplied: '2 July 2021',  status: 'Offered',      salary: '$85k-$100k', type: 'Full-Time', offerExpiry: '3 Aug 2021', offerBonus: 'Equity package included', note: 'Review benefits package before accepting.' },
  { id: 11, company: 'Maze',         logo: 'M',  color: 'bg-pink-500',    location: 'Remote',                title: 'Product Designer',       dateApplied: '28 June 2021', status: 'Hired',        salary: '$90k', type: 'Full-Time', startDate: '2 Aug 2021', manager: 'Christina Johanson', note: 'Welcome aboard! Onboarding starts Aug 2.' },
  { id: 12, company: 'DigitalOcean', logo: 'Do', color: 'bg-blue-500',    location: 'New York, USA',         title: 'Social Media Assistant', dateApplied: '25 June 2021', status: 'Unsuitable',   salary: '$50k', type: 'Full-Time', note: 'Position filled internally.' },
];

const statusStyle = {
  'In Review':    'border border-yellow-400 text-yellow-600 bg-yellow-50',
  'Interviewing': 'border border-orange-400 text-orange-600 bg-orange-50',
  'Assessment':   'border border-blue-400 text-blue-600 bg-blue-50',
  'Offered':      'border border-purple-400 text-purple-600 bg-purple-50',
  'Hired':        'border border-green-500 text-green-600 bg-green-50',
  'Unsuitable':   'border border-red-400 text-red-500 bg-red-50',
  'Shortlisted':  'border border-cyan-400 text-cyan-600 bg-cyan-50',
};

const tabs = [
  { label: 'All',          filter: null },
  { label: 'In Review',    filter: 'In Review' },
  { label: 'Interviewing', filter: 'Interviewing' },
  { label: 'Assessment',   filter: 'Assessment' },
  { label: 'Offered',      filter: 'Offered' },
  { label: 'Hired',        filter: 'Hired' },
];

const sortOptions = ['Date Applied (Newest)', 'Date Applied (Oldest)', 'Company A-Z', 'Status'];

function DetailDrawer({ app, onClose }) {
  if (!app) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-900">Application Detail</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="px-6 py-5 space-y-5">
          {/* Company + role */}
          <div className="flex items-start gap-4">
            <div className={`${app.color} text-white rounded-xl w-14 h-14 flex items-center justify-center font-bold text-lg flex-shrink-0`}>{app.logo}</div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{app.title}</h3>
              <p className="text-sm text-gray-500">{app.company} • {app.location}</p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs border border-green-500 text-green-600 rounded px-2 py-0.5">{app.type}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle[app.status]}`}>{app.status}</span>
              </div>
            </div>
          </div>

          {/* Key info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Date Applied</span><span className="font-medium">{app.dateApplied}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Salary Range</span><span className="font-medium">{app.salary}</span></div>
          </div>

          {/* Status-specific content */}
          {app.status === 'In Review' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-yellow-700 mb-1">⏳ Under Review</p>
              <p className="text-xs text-gray-600">{app.note}</p>
              <button className="mt-3 text-xs bg-yellow-500 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600">Request Follow-up</button>
            </div>
          )}

          {app.status === 'Interviewing' && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-orange-700">🎤 {app.round}</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-300 flex items-center justify-center text-white text-xs font-bold">
                  {app.interviewer?.split(' ').map(n=>n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{app.interviewer}</p>
                  <p className="text-xs text-gray-500">{app.interviewerRole}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>📅</span><span>{app.interviewDate}</span>
              </div>
              <p className="text-xs text-gray-500 italic">{app.note}</p>
              <div className="flex gap-2">
                <button className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600">Add to Calendar</button>
                <button className="text-xs border border-orange-400 text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-50">Reschedule</button>
              </div>
            </div>
          )}

          {app.status === 'Assessment' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-blue-700">📝 {app.assessmentType}</p>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>⏰</span><span>Due: {app.assessmentDue}</span>
              </div>
              <p className="text-xs text-gray-600">{app.note}</p>
              <button className="mt-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">Start Assessment</button>
            </div>
          )}

          {app.status === 'Offered' && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-purple-700">🎉 Offer Received!</p>
              <div className="flex justify-between text-xs"><span className="text-gray-500">Offer Expires</span><span className="font-medium text-red-500">{app.offerExpiry}</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-500">Bonus</span><span className="font-medium">{app.offerBonus}</span></div>
              <p className="text-xs text-gray-500">{app.note}</p>
              <div className="flex gap-2 mt-2">
                <button className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">Accept Offer</button>
                <button className="text-xs border border-red-400 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50">Decline</button>
                <button className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50">Negotiate</button>
              </div>
            </div>
          )}

          {app.status === 'Hired' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-green-700">🚀 Congratulations! You're hired.</p>
              <div className="flex justify-between text-xs"><span className="text-gray-500">Start Date</span><span className="font-medium">{app.startDate}</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-500">Manager</span><span className="font-medium">{app.manager}</span></div>
              <p className="text-xs text-gray-500">{app.note}</p>
              <button className="mt-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">View Onboarding</button>
            </div>
          )}

          {app.status === 'Unsuitable' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-red-600">❌ Not Selected</p>
              <p className="text-xs text-gray-600 mt-1">{app.note}</p>
              <button className="mt-3 text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50">Find Similar Jobs</button>
            </div>
          )}

          {/* Note */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Your Notes</p>
            <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none" placeholder="Add a private note about this application..." />
          </div>
        </div>
      </div>
    </div>
  );
}

const appMenuItems = (app, onRemove, navigate, user) => [
  { 
    icon: '👁️', 
    label: 'View Details', 
    action: () => navigate(`/dashboard/jobs/${app.id}`)
  },
  { 
    icon: '📄', 
    label: 'View Job Posting', 
    action: () => navigate(`/dashboard/jobs/${app.id}`)
  },
  { 
    icon: '✉️', 
    label: 'Message Recruiter', 
    action: () => {
      // Find recruiter email from messages data
      const recruiterMessage = messages.find(msg => 
        msg.company.toLowerCase() === app.company.toLowerCase()
      );
      const recruiterEmail = recruiterMessage ? 
        `${recruiterMessage.name.toLowerCase().replace(' ', '.')}@${app.company.toLowerCase()}.com` : 
        `recruiter@${app.company.toLowerCase()}.com`;
      
      // Open default email client with compose window
      const subject = encodeURIComponent(`Regarding ${app.title} Position`);
      const body = encodeURIComponent(`Dear Hiring Manager,\n\nI hope this email finds you well. I am writing to follow up on my application for the ${app.title} position at ${app.company}.\n\nI am very excited about this opportunity and would love to discuss how my skills and experience align with your team's needs.\n\nThank you for your time and consideration.\n\nBest regards,\n${user?.fullName || 'Applicant'}`);
      
      window.location.href = `mailto:${recruiterEmail}?subject=${subject}&body=${body}`;
    }
  },
  'divider',
  { 
    icon: '🗑️', 
    label: 'Remove Application', 
    action: () => onRemove(app.id), 
    danger: true 
  },
];

export default function MyApplications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = (user?.fullName || 'Jake').split(' ')[0];
  const [activeTab, setActiveTab] = useState(0);
  const [showNotice, setShowNotice] = useState(true);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy] = useState(sortOptions[0]);
  const [filterType, setFilterType] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [applications, setApplications] = useState(allApplications);
  const [toast, setToast] = useState(null);

  const handleRemove = (id) => {
    if (confirm('Are you sure you want to remove this application?')) {
      setApplications(prev => prev.filter(a => a.id !== id));
      setToast({ message: 'Application removed successfully', type: 'success' });
    }
  };

  const tabFilter = tabs[activeTab].filter;

  let filtered = applications.filter(app => {
    const matchesTab = !tabFilter || app.status === tabFilter;
    const matchesSearch = !search ||
      app.company.toLowerCase().includes(search.toLowerCase()) ||
      app.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = !filterType || app.type === filterType;
    return matchesTab && matchesSearch && matchesType;
  });

  // Sort
  if (sortBy === 'Company A-Z') filtered = [...filtered].sort((a,b) => a.company.localeCompare(b.company));
  else if (sortBy === 'Date Applied (Oldest)') filtered = [...filtered].sort((a,b) => a.id - b.id);
  else if (sortBy === 'Status') filtered = [...filtered].sort((a,b) => a.status.localeCompare(b.status));

  const counts = tabs.map(t => t.filter ? applications.filter(a => a.status === t.filter).length : applications.length);

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <DashTopBar title="My Applications" />

      <div className="overflow-y-auto flex-1 px-8 py-6">
        {/* Greeting */}
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Keep it up, {firstName} 💪</h2>
            <p className="text-sm text-gray-500 mt-0.5">Here is job applications status from July 19 - July 25.</p>
          </div>
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white">
            <span>Jul 19 - Jul 25</span><span>📅</span>
          </div>
        </div>

        {/* New Notices */}
        {showNotice && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-4 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0">📋</div>
            <div className="flex-1">
              <p className="font-semibold text-blue-700 text-sm">New Notices</p>
              <p className="text-xs text-gray-500 mt-0.5">You can request a follow-up 7 days after applying for a job if the application status is in review. Only one follow-up is allowed per job.</p>
            </div>
            <button onClick={() => setShowNotice(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {tabs.map((tab, i) => (
            <button key={tab.label} onClick={() => setActiveTab(i)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${activeTab === i ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab.label} ({counts[i]})
            </button>
          ))}
        </div>

        {/* Table card */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Applications History</h3>
            <div className="flex gap-2 items-center">
              {showSearch && (
                <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-400 w-48"
                  placeholder="Search company or role..." />
              )}
              <button onClick={() => setShowSearch(s => !s)}
                className={`flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-sm transition ${showSearch ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                🔍 Search
              </button>
              <button onClick={() => setShowFilter(s => !s)}
                className={`flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-sm transition ${showFilter ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                ☰ Filter
              </button>
            </div>
          </div>

          {/* Filter panel */}
          {showFilter && (
            <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Sort by:</span>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none text-gray-700">
                  {sortOptions.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Job Type:</span>
                <select value={filterType} onChange={e => setFilterType(e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none text-gray-700">
                  <option value="">All Types</option>
                  <option>Full-Time</option>
                  <option>Part-Time</option>
                  <option>Remote</option>
                  <option>Contract</option>
                </select>
              </div>
              <button onClick={() => { setSortBy(sortOptions[0]); setFilterType(''); setSearch(''); }}
                className="text-xs text-red-500 hover:underline">Clear filters</button>
            </div>
          )}

          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs border-b border-gray-100">
                <th className="text-left px-6 py-3 w-8">#</th>
                <th className="text-left px-4 py-3">Company Name</th>
                <th className="text-left px-4 py-3">Roles</th>
                <th className="text-left px-4 py-3">Date Applied</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((app, idx) => (
                <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer" onClick={() => setSelectedApp(app)}>
                  <td className="px-6 py-4 text-gray-400">{idx + 1}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`${app.color} text-white rounded-xl w-10 h-10 flex items-center justify-center text-xs font-bold flex-shrink-0`}>{app.logo}</div>
                      <p className="font-semibold text-gray-900">{app.company}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-600">{app.title}</td>
                  <td className="px-4 py-4 text-gray-500">{app.dateApplied}</td>
                  <td className="px-4 py-4">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusStyle[app.status] || 'border border-gray-300 text-gray-500'}`}>{app.status}</span>
                  </td>
                  <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                    <div className="relative">
                      <button onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === app.id ? null : app.id); }}
                        className="text-gray-400 hover:text-gray-600 text-lg px-1">•••</button>
                      {openMenu === app.id && (
                        <div className="absolute right-0 top-8 z-50">
                          <DropdownMenu items={appMenuItems(app, handleRemove, navigate, user)} onClose={() => setOpenMenu(null)} />
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">No applications found</td></tr>
              )}
            </tbody>
          </table>

          <div className="flex justify-center items-center gap-1 px-6 py-4">
            <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded">‹</button>
            {[1,2,3,4,5].map(p => (
              <button key={p} className={`w-8 h-8 rounded text-sm font-medium ${p === 1 ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{p}</button>
            ))}
            <span className="text-gray-400 text-sm px-1">...</span>
            <button className="w-8 h-8 rounded text-sm text-gray-600 hover:bg-gray-100">33</button>
            <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded">›</button>
          </div>
        </div>
      </div>

      <DetailDrawer app={selectedApp} onClose={() => setSelectedApp(null)} />
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}
