import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { applications as mockApplications, messages } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import DropdownMenu from '../../components/DropdownMenu';
import DashTopBar from '../../components/DashTopBar';
import Toast from '../../components/Toast';

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

// Enhanced Calendar component with day, month, year selection
function Calendar({ selectedDate, onDateChange, onClose }) {
  const calendarRef = useRef(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState('days'); // 'days', 'months', 'years'
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const isToday = (date) => {
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === month;
  };

  const isSelected = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const handleDateClick = (date) => {
    onDateChange(date);
    onClose();
  };

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const goToPrevYear = () => {
    setCurrentMonth(new Date(year - 1, month, 1));
  };

  const goToNextYear = () => {
    setCurrentMonth(new Date(year + 1, month, 1));
  };

  const handleMonthClick = (monthIndex) => {
    setCurrentMonth(new Date(year, monthIndex, 1));
    setViewMode('days');
  };

  const handleYearClick = (selectedYear) => {
    setCurrentMonth(new Date(selectedYear, month, 1));
    setViewMode('months');
  };

  const renderDaysView = () => {
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <button onClick={goToPrevMonth} className="p-1 hover:bg-gray-100 rounded">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={() => setViewMode('months')}
            className="font-semibold text-gray-900 hover:bg-gray-100 px-2 py-1 rounded"
          >
            {monthNames[month]} {year}
          </button>
          <button onClick={goToNextMonth} className="p-1 hover:bg-gray-100 rounded">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              className={`
                text-center py-2 text-sm rounded hover:bg-gray-100 transition-colors
                ${!isCurrentMonth(date) ? 'text-gray-300' : 'text-gray-700'}
                ${isToday(date) ? 'bg-blue-100 text-blue-600 font-semibold' : ''}
                ${isSelected(date) ? 'bg-blue-600 text-white' : ''}
              `}
            >
              {date.getDate()}
            </button>
          ))}
        </div>
      </>
    );
  };

  const renderMonthsView = () => {
    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <button onClick={goToPrevYear} className="p-1 hover:bg-gray-100 rounded">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={() => setViewMode('years')}
            className="font-semibold text-gray-900 hover:bg-gray-100 px-2 py-1 rounded"
          >
            {year}
          </button>
          <button onClick={goToNextYear} className="p-1 hover:bg-gray-100 rounded">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {monthNames.map((monthName, index) => (
            <button
              key={index}
              onClick={() => handleMonthClick(index)}
              className={`
                text-center py-3 text-sm rounded hover:bg-gray-100 transition-colors
                ${month === index ? 'bg-blue-600 text-white' : 'text-gray-700'}
              `}
            >
              {monthName.slice(0, 3)}
            </button>
          ))}
        </div>
      </>
    );
  };

  const renderYearsView = () => {
    const startYear = Math.floor(year / 10) * 10;
    const years = [];
    for (let i = startYear - 1; i <= startYear + 10; i++) {
      years.push(i);
    }

    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentMonth(new Date(startYear - 10, month, 1))} className="p-1 hover:bg-gray-100 rounded">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-semibold text-gray-900">
            {startYear} - {startYear + 9}
          </span>
          <button onClick={() => setCurrentMonth(new Date(startYear + 10, month, 1))} className="p-1 hover:bg-gray-100 rounded">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {years.map((yearOption) => (
            <button
              key={yearOption}
              onClick={() => handleYearClick(yearOption)}
              className={`
                text-center py-3 text-sm rounded hover:bg-gray-100 transition-colors
                ${year === yearOption ? 'bg-blue-600 text-white' : 'text-gray-700'}
                ${(yearOption < startYear || yearOption > startYear + 9) ? 'text-gray-400' : ''}
              `}
            >
              {yearOption}
            </button>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 w-80" ref={calendarRef}>
      {viewMode === 'days' && renderDaysView()}
      {viewMode === 'months' && renderMonthsView()}
      {viewMode === 'years' && renderYearsView()}
      
      <div className="mt-4 pt-3 border-t border-gray-100">
        <button
          onClick={() => handleDateClick(today)}
          className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Today
        </button>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = (user?.fullName || 'Jake').split(' ')[0];
  const [openMenu, setOpenMenu] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: new Date(2024, 6, 19), // July 19, 2024
    end: new Date(2024, 6, 25)    // July 25, 2024
  });

  const formatDateRange = (start, end) => {
    const options = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  const handleDateChange = (date) => {
    // Set a 7-day range starting from selected date
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 6);
    setSelectedDateRange({ start: date, end: endDate });
  };

  const [applications, setApplications] = useState(mockApplications.slice(0, 3));
  const [toast, setToast] = useState(null);

  const appMenuItems = (app) => [
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
      action: () => {
        if (confirm(`Are you sure you want to remove your application for ${app.title}?`)) {
          // Remove application from the list
          setApplications(prev => prev.filter(a => a.id !== app.id));
          // Show success toast
          setToast({ message: 'Application removed successfully', type: 'success' });
        }
      }, 
      danger: true 
    },
  ];

  const handleApplicationClick = (app) => {
    navigate(`/dashboard/jobs/${app.id}`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      <DashTopBar title="Dashboard" />
      <div className="overflow-y-auto flex-1 px-8 py-6">
        {/* Greeting */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Good morning, {firstName} 👋</h2>
            <p className="text-sm text-gray-500 mt-0.5">Here is what's happening with your job search applications from {formatDateRange(selectedDateRange.start, selectedDateRange.end)}.</p>
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white hover:bg-gray-50 transition-colors"
            >
              <span>{formatDateRange(selectedDateRange.start, selectedDateRange.end)}</span>
              <span>📅</span>
            </button>
            {showCalendar && (
              <Calendar 
                selectedDate={selectedDateRange.start}
                onDateChange={handleDateChange}
                onClose={() => setShowCalendar(false)}
              />
            )}
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
            {applications.map(app => (
              <div key={app.id} 
                   onClick={() => handleApplicationClick(app)}
                   className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors">
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
                    <div className="absolute right-0 top-8 z-50">
                      <DropdownMenu items={appMenuItems(app)} onClose={() => setOpenMenu(null)} />
                    </div>
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
