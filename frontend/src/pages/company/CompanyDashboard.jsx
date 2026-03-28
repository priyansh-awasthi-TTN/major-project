import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationPanel from '../../components/NotificationPanel';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

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

// Helper functions for date management
const formatDate = (date) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
};

const formatFullDate = (date) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
};

const getStoredDateRange = () => {
  const stored = localStorage.getItem('company_dashboard_date_range');
  if (stored) {
    const parsed = JSON.parse(stored);
    return {
      start: new Date(parsed.start),
      end: new Date(parsed.end)
    };
  }
  // Default to last 7 days
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);
  return { start, end };
};

const storeDateRange = (dateRange) => {
  localStorage.setItem('company_dashboard_date_range', JSON.stringify({
    start: dateRange.start.toISOString(),
    end: dateRange.end.toISOString()
  }));
};

function Calendar({ isOpen, onClose, onDateSelect, selectedRange }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);
  const [tempRange, setTempRange] = useState(selectedRange);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add days from previous month
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false
      });
    }
    
    // Add all days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true
      });
    }
    
    // Add days from next month to fill the grid
    const remainingCells = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const handleDateClick = (dateObj) => {
    const date = dateObj.date;
    if (selectingStart) {
      setTempRange({ start: date, end: date });
      setSelectingStart(false);
    } else {
      const newRange = {
        start: date < tempRange.start ? date : tempRange.start,
        end: date > tempRange.start ? date : tempRange.start
      };
      setTempRange(newRange);
      onDateSelect(newRange);
      onClose();
      setSelectingStart(true);
    }
  };

  const isDateInRange = (date) => {
    if (!tempRange.start || !tempRange.end) return false;
    return date >= tempRange.start && date <= tempRange.end;
  };

  const isDateSelected = (date) => {
    if (!tempRange.start) return false;
    if (selectingStart) return date.getTime() === tempRange.start.getTime();
    return date.getTime() === tempRange.start.getTime() || date.getTime() === tempRange.end.getTime();
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 6);
    const newRange = { start: today, end: endDate };
    onDateSelect(newRange);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-0 w-80 overflow-hidden z-50">
      {/* Header with selected range */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
            <span className="text-sm font-medium text-gray-700">
              {formatDate(tempRange.start)} - {formatDate(tempRange.end)}
            </span>
            <div className="w-4 h-4 bg-red-100 rounded flex items-center justify-center">
              <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="p-4">
        {/* Month/Year Navigation */}
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => navigateMonth(-1)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-base font-semibold text-gray-900">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button onClick={() => navigateMonth(1)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {getDaysInMonth(currentDate).map((dateObj, index) => {
            const { date, isCurrentMonth } = dateObj;
            const selected = isDateSelected(date);
            const inRange = isDateInRange(date);
            const today = isToday(date);
            
            return (
              <button
                key={index}
                onClick={() => handleDateClick(dateObj)}
                className={`
                  h-8 text-xs rounded-lg transition-all duration-200 font-medium
                  ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                  ${selected ? 'bg-blue-500 text-white shadow-md' : ''}
                  ${inRange && !selected ? 'bg-blue-100 text-blue-700' : ''}
                  ${today && !selected && !inRange ? 'bg-blue-50 text-blue-600 border border-blue-200' : ''}
                  ${!selected && !inRange && !today ? 'hover:bg-gray-100' : ''}
                `}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        {/* Today button */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={goToToday}
            className="text-blue-600 font-medium text-sm hover:text-blue-700 transition-colors"
          >
            Today
          </button>
        </div>
      </div>
    </div>
  );
}

function DateRangePicker({ dateRange, onDateRangeChange }) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isCalendarOpen) return;
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCalendarOpen]);
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        type="button"
        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
        className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <span>{formatDate(dateRange.start)} - {formatDate(dateRange.end)}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
      
      {isCalendarOpen && (
        <Calendar
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
          onDateSelect={(range) => {
            onDateRangeChange(range);
            storeDateRange(range);
          }}
          selectedRange={dateRange}
        />
      )}
    </div>
  );
}

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Week');
  const [statsTab, setStatsTab] = useState('Overview');
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [dateRange, setDateRange] = useState(getStoredDateRange);
  const { unreadCount } = useNotifications();
  const { user } = useAuth();

  const currentData = mockData[activeTab];
  const displayedJobs = showAllJobs ? allJobUpdates : allJobUpdates.slice(0, 4);

  const getDateRangeText = () => {
    return `${formatFullDate(dateRange.start)} - ${formatFullDate(dateRange.end)}`;
  };

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
    storeDateRange(newRange);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      <style jsx>{`
        @keyframes ring {
          0%, 20%, 50%, 80%, 100% {
            transform: rotate(0deg);
          }
          10% {
            transform: rotate(10deg);
          }
          30% {
            transform: rotate(-10deg);
          }
          40% {
            transform: rotate(8deg);
          }
          60% {
            transform: rotate(-8deg);
          }
          70% {
            transform: rotate(5deg);
          }
          90% {
            transform: rotate(-5deg);
          }
        }
      `}</style>
      {/* Top Bar - Fixed */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between flex-shrink-0 fixed top-0 right-0 z-20" style={{ left: '240px' }}>
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
              onClick={(e) => {
                e.stopPropagation();
                setBellOpen(!bellOpen);
              }}
              aria-label="notifications"
              className={`notification-bell relative p-2 rounded-full transition-all duration-200 ${bellOpen ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              <svg
                className="w-5 h-5"
                style={{ animation: unreadCount > 0 ? 'ring 2s ease-in-out infinite' : 'none', transformOrigin: 'top center' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </button>
            <NotificationPanel open={bellOpen} onClose={() => setBellOpen(false)} />
          </div>
          <button 
            onClick={() => navigate('/company/jobs/post')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Post a job
          </button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 p-8" style={{ marginTop: '80px' }}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Good morning, {user?.fullName || 'User'}</h2>
            <p className="text-gray-500 text-sm">Here is your job listings statistic report from {getDateRangeText()}.</p>
          </div>
          <DateRangePicker dateRange={dateRange} onDateRangeChange={handleDateRangeChange} />
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
            {statsTab === 'Overview' && (
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
                              {item.jobView}
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
            )}

            {statsTab === 'Jobs View' && (
              <div className="h-64 flex items-end justify-between gap-2 mb-4">
                {currentData.chartData.map((item, i) => {
                  const maxValue = Math.max(...currentData.chartData.map(d => d.jobView));
                  const jobViewHeight = (item.jobView / maxValue) * 100;
                  
                  return (
                    <div key={item.day} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex flex-col justify-end h-48">
                        <div 
                          className="bg-yellow-400 rounded relative"
                          style={{ height: `${jobViewHeight}%` }}
                        >
                          {i === 3 && (
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                              122
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
            )}

            {statsTab === 'Jobs Applied' && (
              <div className="h-64 flex items-end justify-between gap-2 mb-4">
                {currentData.chartData.map((item, i) => {
                  const maxValue = Math.max(...currentData.chartData.map(d => d.jobApplied));
                  const jobAppliedHeight = (item.jobApplied / maxValue) * 100;
                  
                  return (
                    <div key={item.day} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex flex-col justify-end h-48">
                        <div 
                          className="bg-indigo-600 rounded relative"
                          style={{ height: `${jobAppliedHeight}%` }}
                        >
                          {i === 3 && (
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                              34
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
            )}

            {/* Legend */}
            {statsTab === 'Overview' && (
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
            )}

            {statsTab === 'Jobs View' && (
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded" />
                  <span className="text-gray-600">Job View</span>
                </div>
              </div>
            )}

            {statsTab === 'Jobs Applied' && (
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-indigo-600 rounded" />
                  <span className="text-gray-600">Job Applied</span>
                </div>
              </div>
            )}

            {/* Stats Cards Row */}
            {statsTab === 'Overview' && (
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
            )}

            {statsTab === 'Jobs View' && (
              <div className="flex justify-end mt-6">
                <div className="bg-gray-50 rounded-lg p-6 w-80">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <span className="text-lg font-medium text-gray-900">Job Views</span>
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{currentData.jobViews.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">
                    This {activeTab} <span className={currentData.jobViewsChange > 0 ? 'text-blue-500' : 'text-red-500'}>
                      {currentData.jobViewsChange}% {currentData.jobViewsChange > 0 ? '▲' : '▼'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {statsTab === 'Jobs Applied' && (
              <div className="flex justify-end mt-6">
                <div className="bg-gray-50 rounded-lg p-6 w-80">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="text-lg font-medium text-gray-900">Job Applied</span>
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{currentData.jobApplied.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">
                    This {activeTab} <span className={currentData.jobAppliedChange > 0 ? 'text-blue-500' : 'text-red-500'}>
                      {currentData.jobAppliedChange}% {currentData.jobAppliedChange > 0 ? '▲' : '▼'}
                    </span>
                  </div>
                </div>
              </div>
            )}
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