import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import NotificationPanel from '../../components/NotificationPanel';
import { useNotifications } from '../../context/NotificationContext';

const allJobUpdates = [
  {
    id: 1,
    title: 'Social Media Assistant',
    company: 'Nomad',
    location: 'Paris, France',
    type: 'Full-Time',
    logo: 'N',
    color: 'bg-emerald-500',
    tags: ['Marketing', 'Design'],
    applied: 5,
    capacity: 10
  },
  {
    id: 2,
    title: 'Brand Designer',
    company: 'Nomad',
    location: 'Paris, France',
    type: 'Full-Time',
    logo: '📦',
    color: 'bg-blue-500',
    tags: ['Business', 'Design'],
    applied: 5,
    capacity: 10
  },
  {
    id: 3,
    title: 'Interactive Developer',
    company: 'Terraform',
    location: 'Berlin, Germany',
    type: 'Full-Time',
    logo: '🔷',
    color: 'bg-cyan-500',
    tags: ['Marketing', 'Design'],
    applied: 5,
    capacity: 10
  },
  {
    id: 4,
    title: 'Product Designer',
    company: 'ClassPass',
    location: 'Berlin, Germany',
    type: 'Full-Time',
    logo: '🔵',
    color: 'bg-indigo-600',
    tags: ['Business', 'Design'],
    applied: 5,
    capacity: 10
  },
  {
    id: 5,
    title: 'Frontend Developer',
    company: 'Stripe',
    location: 'San Francisco, USA',
    type: 'Full-Time',
    logo: 'S',
    color: 'bg-purple-600',
    tags: ['Technology', 'Engineering'],
    applied: 8,
    capacity: 15
  },
  {
    id: 6,
    title: 'UX Researcher',
    company: 'Airbnb',
    location: 'Remote',
    type: 'Full-Time',
    logo: 'A',
    color: 'bg-pink-500',
    tags: ['Design', 'Research'],
    applied: 12,
    capacity: 20
  },
  {
    id: 7,
    title: 'Data Analyst',
    company: 'Netflix',
    location: 'Los Angeles, USA',
    type: 'Full-Time',
    logo: 'N',
    color: 'bg-red-600',
    tags: ['Analytics', 'Business'],
    applied: 7,
    capacity: 12
  },
  {
    id: 8,
    title: 'Mobile Developer',
    company: 'Uber',
    location: 'New York, USA',
    type: 'Full-Time',
    logo: 'U',
    color: 'bg-gray-800',
    tags: ['Mobile', 'Engineering'],
    applied: 15,
    capacity: 25
  }
];

// Mock data for different time periods
const mockData = {
  Week: {
    jobViews: 2342,
    jobViewsChange: 6.4,
    jobApplied: 654,
    jobAppliedChange: -0.5,
    chartData: [
      { day: 'Mon', jobView: 45, jobApplied: 67 },
      { day: 'Tue', jobView: 67, jobApplied: 52 },
      { day: 'Wed', jobView: 52, jobApplied: 78 },
      { day: 'Thu', jobView: 78, jobApplied: 62 },
      { day: 'Fri', jobView: 62, jobApplied: 34 },
      { day: 'Sat', jobView: 34, jobApplied: 41 },
      { day: 'Sun', jobView: 41, jobApplied: 55 }
    ]
  },
  Month: {
    jobViews: 9876,
    jobViewsChange: 12.3,
    jobApplied: 2341,
    jobAppliedChange: 8.7,
    chartData: [
      { day: 'Week 1', jobView: 234, jobApplied: 156 },
      { day: 'Week 2', jobView: 345, jobApplied: 234 },
      { day: 'Week 3', jobView: 456, jobApplied: 345 },
      { day: 'Week 4', jobView: 567, jobApplied: 456 }
    ]
  },
  Year: {
    jobViews: 45678,
    jobViewsChange: 23.1,
    jobApplied: 12345,
    jobAppliedChange: 15.6,
    chartData: [
      { day: 'Q1', jobView: 1234, jobApplied: 567 },
      { day: 'Q2', jobView: 2345, jobApplied: 789 },
      { day: 'Q3', jobView: 3456, jobApplied: 1234 },
      { day: 'Q4', jobView: 4567, jobApplied: 2345 }
    ]
  }
};

function DateRangePicker({ dateRange, onDateRangeChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const presets = [
    { label: 'Last 7 days', start: 'Jul 19', end: 'Jul 25' },
    { label: 'Last 30 days', start: 'Jun 26', end: 'Jul 25' },
    { label: 'Last 3 months', start: 'Apr 26', end: 'Jul 25' },
    { label: 'This year', start: 'Jan 1', end: 'Jul 25' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handlePresetClick = (preset, e) => {
    e.preventDefault();
    e.stopPropagation();
    onDateRangeChange({ start: preset.start, end: preset.end });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <span>{dateRange.start} - {dateRange.end}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48">
          {presets.map((preset, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => handlePresetClick(preset, e)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors focus:outline-none focus:bg-gray-50"
            >
              <div className="font-medium">{preset.label}</div>
              <div className="text-xs text-gray-500">{preset.start} - {preset.end}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CompanyDashboard() {
  const [activeTab, setActiveTab] = useState('Week');
  const [statsTab, setStatsTab] = useState('Overview');
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ start: 'Jul 19', end: 'Jul 25' });
  const { unreadCount } = useNotifications();

  const currentData = mockData[activeTab];
  const displayedJobs = showAllJobs ? allJobUpdates : allJobUpdates.slice(0, 4);

  const getDateRangeText = () => {
    const ranges = {
      'Jul 19 - Jul 25': 'July 19 - July 25',
      'Jun 26 - Jul 25': 'June 26 - July 25', 
      'Apr 26 - Jul 25': 'April 26 - July 25',
      'Jan 1 - Jul 25': 'January 1 - July 25'
    };
    const key = `${dateRange.start} - ${dateRange.end}`;
    return ranges[key] || `${dateRange.start} - ${dateRange.end}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            N
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">Company</h1>
            <p className="text-sm text-gray-500">Nomad</p>
          </div>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setBellOpen(!bellOpen)}
              className={`relative p-2 rounded-full transition ${bellOpen ? 'bg-indigo-50' : 'hover:bg-gray-100'}`}
            >
              <svg
                className="w-5 h-5 text-gray-700"
                style={{ animation: 'ring 2s ease-in-out infinite', transformOrigin: 'top center' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
              )}
            </button>
            <NotificationPanel open={bellOpen} onClose={() => setBellOpen(false)} />
          </div>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700">
            <span>+</span> Post a job
          </button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Good morning, Maria</h2>
            <p className="text-gray-500 text-sm">Here is your job listings statistic report from {getDateRangeText()}.</p>
          </div>
          <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-indigo-600 text-white rounded-xl p-6 relative overflow-hidden">
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-1">76</div>
              <div className="text-indigo-100 text-sm">New candidates to review</div>
            </div>
            <div className="absolute right-4 top-4">
              <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          <div className="bg-emerald-500 text-white rounded-xl p-6 relative overflow-hidden">
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-1">3</div>
              <div className="text-emerald-100 text-sm">Schedule for today</div>
            </div>
            <div className="absolute right-4 top-4">
              <svg className="w-6 h-6 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          <div className="bg-blue-500 text-white rounded-xl p-6 relative overflow-hidden">
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-1">24</div>
              <div className="text-blue-100 text-sm">Messages received</div>
            </div>
            <div className="absolute right-4 top-4">
              <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Job Statistics */}
          <div className="col-span-2 bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-semibold text-gray-900">Job statistics</h3>
                <p className="text-sm text-gray-500">Showing Job statistics {getDateRangeText()}</p>
              </div>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {['Week', 'Month', 'Year'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 text-sm rounded-md transition ${
                      activeTab === tab ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-6 mb-6">
              {['Overview', 'Jobs View', 'Jobs Applied'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatsTab(tab)}
                  className={`text-sm pb-2 border-b-2 transition ${
                    statsTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Chart Area */}
            <div className="h-64 flex items-end justify-between gap-2 mb-4">
              {currentData.chartData.map((item, i) => {
                const maxValue = Math.max(...currentData.chartData.map(d => Math.max(d.jobView, d.jobApplied)));
                const jobViewHeight = (item.jobView / maxValue) * 100;
                const jobAppliedHeight = (item.jobApplied / maxValue) * 100;
                
                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col justify-end h-48 gap-1">
                      <div 
                        className="bg-yellow-400 rounded-t"
                        style={{ height: `${jobViewHeight}%` }}
                      />
                      <div 
                        className="bg-indigo-600 rounded-b relative"
                        style={{ height: `${jobAppliedHeight}%` }}
                      >
                        {i === 2 && (
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                            {item.jobApplied}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800" />
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 mt-2">{item.day}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded" />
                <span className="text-gray-600">Job View</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-600 rounded" />
                <span className="text-gray-600">Job Applied</span>
              </div>
            </div>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 text-sm">👁</span>
                  </div>
                  <span className="text-sm text-gray-600">Job Views</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{currentData.jobViews.toLocaleString()}</div>
                <div className="text-xs text-gray-500">
                  This {activeTab} <span className={currentData.jobViewsChange > 0 ? 'text-green-500' : 'text-red-500'}>
                    {currentData.jobViewsChange > 0 ? '+' : ''}{currentData.jobViewsChange}% {currentData.jobViewsChange > 0 ? '↗' : '↘'}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 text-sm">📄</span>
                  </div>
                  <span className="text-sm text-gray-600">Job Applied</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{currentData.jobApplied.toLocaleString()}</div>
                <div className="text-xs text-gray-500">
                  This {activeTab} <span className={currentData.jobAppliedChange > 0 ? 'text-green-500' : 'text-red-500'}>
                    {currentData.jobAppliedChange > 0 ? '+' : ''}{currentData.jobAppliedChange}% {currentData.jobAppliedChange > 0 ? '↗' : '↘'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Job Open */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Job Open</h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-1">12</div>
                <div className="text-sm text-gray-500">Jobs Opened</div>
              </div>
            </div>

            {/* Applicants Summary */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Applicants Summary</h3>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-gray-900 mb-1">67</div>
                <div className="text-sm text-gray-500">Applicants</div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-emerald-500 via-yellow-500 to-red-500" style={{ width: '75%' }} />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded" />
                    <span>Full Time</span>
                  </div>
                  <span className="font-medium">45</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded" />
                    <span>Part-Time</span>
                  </div>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded" />
                    <span>Remote</span>
                  </div>
                  <span className="font-medium">22</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded" />
                    <span>Internship</span>
                  </div>
                  <span className="font-medium">32</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded" />
                    <span>Contract</span>
                  </div>
                  <span className="font-medium">30</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Job Updates */}
        <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-900">Job Updates</h3>
            <button 
              onClick={() => setShowAllJobs(!showAllJobs)}
              className="text-indigo-600 text-sm hover:underline flex items-center gap-1"
            >
              {showAllJobs ? 'Show Less' : 'View All'} <span>→</span>
            </button>
          </div>

          <div className={`grid gap-4 ${showAllJobs ? 'grid-cols-4' : 'grid-cols-4'}`}>
            {displayedJobs.map(job => (
              <div key={job.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`${job.color} text-white rounded-xl w-10 h-10 flex items-center justify-center font-bold text-sm`}>
                    {typeof job.logo === 'string' && job.logo.length === 1 ? job.logo : job.logo}
                  </div>
                  <span className="text-xs bg-green-50 text-green-600 border border-green-200 rounded px-2 py-0.5">
                    {job.type}
                  </span>
                </div>
                
                <h4 className="font-semibold text-gray-900 text-sm mb-1">{job.title}</h4>
                <p className="text-xs text-gray-500 mb-3">{job.company} • {job.location}</p>
                
                <div className="flex gap-1 mb-3">
                  {job.tags.map(tag => (
                    <span key={tag} className={`text-xs px-2 py-0.5 rounded border ${
                      tag === 'Marketing' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                      tag === 'Design' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                      tag === 'Technology' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                      tag === 'Engineering' ? 'bg-green-50 text-green-600 border-green-200' :
                      tag === 'Research' ? 'bg-pink-50 text-pink-600 border-pink-200' :
                      tag === 'Analytics' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                      tag === 'Mobile' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                      'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="text-xs text-gray-500">
                  <span className="font-medium text-gray-700">{job.applied} applied</span> of {job.capacity} capacity
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}