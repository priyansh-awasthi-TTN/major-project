import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { messages } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import DropdownMenu from '../../components/DropdownMenu';
import DashTopBar from '../../components/DashTopBar';
import Toast from '../../components/Toast';
import MessageRecruiterModal from '../../components/MessageRecruiterModal';
import apiService from '../../services/api';

const LS_CAL = 'jh_calendarDate';

const statusStyle = {
  'In Review':    'border border-yellow-400 text-yellow-600',
  'Shortlisted':  'border border-blue-400 text-blue-600',
  'Declined':     'border border-red-400 text-red-600',
  'Interviewing': 'border border-purple-400 text-purple-600',
  'Offered':      'border border-green-400 text-green-600',
  'Assessment':   'border border-blue-400 text-blue-600',
  'Hired':        'border border-green-500 text-green-600',
  'Unsuitable':   'border border-red-400 text-red-500',
};

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
  const [toast, setToast] = useState(null);
  const [recruiterModal, setRecruiterModal] = useState(null); // { email, name, jobTitle, company }

  // Calendar date — persisted to sessionStorage
  const [selectedDateRange, setSelectedDateRange] = useState(() => {
    try {
      const saved = sessionStorage.getItem(LS_CAL);
      if (saved) {
        const start = new Date(JSON.parse(saved));
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        return { start, end };
      }
    } catch {}
    const end = new Date();
    const start = new Date(); start.setDate(start.getDate() - 6);
    return { start, end };
  });

  const handleDateChange = (date) => {
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 6);
    const range = { start: date, end: endDate };
    setSelectedDateRange(range);
    sessionStorage.setItem(LS_CAL, JSON.stringify(date.toISOString()));
  };

  const formatDateRange = (start, end) => {
    const options = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  const [apiApplications, setApiApplications] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ totalApplied: 0, interviewing: 0, hired: 0, byStatus: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getApplications()
      .then(data => {
        setApiApplications(data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!apiApplications.length && loading) return;

    const { start, end } = selectedDateRange;
    const startObj = new Date(start); startObj.setHours(0,0,0,0);
    const endObj = new Date(end); endObj.setHours(23,59,59,999);

    const filtered = apiApplications.filter(app => {
      if (!app.dateApplied) return false;
      // Handle the strict date string 'Jul 20, 2024' or ISO format
      const d = new Date(app.dateApplied);
      return d >= startObj && d <= endObj;
    });

    const byStatus = {};
    let totalApplied = 0;
    let interviewing = 0;
    let hired = 0;

    filtered.forEach(app => {
      totalApplied++;
      byStatus[app.status] = (byStatus[app.status] || 0) + 1;
      if (app.status === 'Interviewing') interviewing++;
      if (app.status === 'Hired') hired++;
    });

    setStats({ totalApplied, interviewing, hired, byStatus });
    
    // Sort descending by date to get recent ones
    const sorted = [...filtered].sort((a,b) => new Date(b.dateApplied) - new Date(a.dateApplied));
    setApplications(sorted.slice(0, 5));
  }, [apiApplications, selectedDateRange, loading]);

  // Compute donut chart percentages from real status data
  const total = stats.totalApplied || 0;
  const unsuitable = stats.byStatus?.['Unsuitable'] || 0;
  const interviewed = (stats.byStatus?.['Interviewing'] || 0) + (stats.byStatus?.['Hired'] || 0);
  const unsuitablePct = total > 0 ? Math.round((unsuitable / total) * 100) : 0;
  const interviewedPct = total > 0 ? Math.round((interviewed / total) * 100) : 0;

  const appMenuItems = (app) => [
    { 
      icon: '👁️', 
      label: 'View Details', 
      action: () => navigate(`/dashboard/jobs/${app.jobId}`)
    },
    { 
      icon: '📄', 
      label: 'View Job Posting', 
      action: () => navigate(`/dashboard/jobs/${app.jobId}`)
    },
    { 
      icon: '✉️', 
      label: 'Message Recruiter', 
      action: () => {
        const recruiterMessage = messages.find(msg =>
          msg.company.toLowerCase() === app.company.toLowerCase()
        );
        const recruiterEmail = recruiterMessage
          ? `${recruiterMessage.name.toLowerCase().replace(' ', '.')}@${app.company.toLowerCase()}.com`
          : `recruiter@${app.company.toLowerCase()}.com`;
        setRecruiterModal({
          email: recruiterEmail,
          name: recruiterMessage?.name || null,
          jobTitle: app.title,
          company: app.company,
        });
      }
    },
    'divider',
    { 
      icon: '🗑️', 
      label: 'Remove Application', 
      action: () => {
        if (confirm(`Are you sure you want to remove your application for ${app.title}?`)) {
          apiService.deleteApplication(app.id)
            .then(() => {
              setApplications(prev => prev.filter(a => a.id !== app.id));
              setToast({ message: 'Application removed successfully', type: 'success' });
            })
            .catch(() => setToast({ message: 'Failed to remove application', type: 'error' }));
        }
      }, 
      danger: true 
    },
  ];

  const handleApplicationClick = (app) => {
    navigate(`/dashboard/jobs/${app.jobId}`);
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
              <p className="text-5xl font-bold text-gray-900">{loading ? '—' : total}</p>
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
                    strokeDasharray={`${unsuitablePct} ${100 - unsuitablePct}`} strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-xs space-y-2">
                <p className="flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 bg-indigo-600 rounded-sm" />
                  <span className="font-semibold">{unsuitablePct}%</span>
                  <span className="text-gray-400">Unsuitable</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 bg-gray-200 rounded-sm" />
                  <span className="font-semibold">{interviewedPct}%</span>
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
            <p className="text-sm text-gray-500 mb-3">Upcoming Interviews</p>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-800">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            {stats.interviewing > 0 ? (
              <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {stats.interviewing}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">Active Interviews</p>
                  <p className="text-xs text-gray-400">Applications in Interviewing stage</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">No active interviews scheduled.</p>
            )}
          </div>
        </div>

        {/* Interviewed stat */}
        <div className="grid grid-cols-3 gap-5 mb-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-3">Interviewed</p>
            <div className="flex items-end justify-between">
              <p className="text-5xl font-bold text-gray-900">{loading ? '—' : stats.interviewing}</p>
              <span className="text-4xl opacity-20">🎤</span>
            </div>
          </div>
          <div className="col-span-2" />
        </div>

        {/* Recent Applications History */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-semibold text-gray-900">Recent Applications History</h2>
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-4xl mb-2">📋</p>
              <p className="font-medium text-gray-600">No applications yet</p>
              <p className="text-sm mt-1">Start applying to jobs and they'll appear here.</p>
              <Link to="/dashboard/find-jobs" className="text-blue-600 text-sm mt-3 inline-block hover:underline">Browse Jobs →</Link>
            </div>
          ) : (
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
          )}
          {applications.length > 0 && (
            <Link to="/dashboard/applications" className="text-blue-600 text-sm mt-4 flex items-center justify-center gap-1 hover:underline">
              View all applications history →
            </Link>
          )}
        </div>
      </div>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      {recruiterModal && (
        <MessageRecruiterModal
          recruiterEmail={recruiterModal.email}
          recruiterName={recruiterModal.name}
          jobTitle={recruiterModal.jobTitle}
          company={recruiterModal.company}
          senderName={user?.fullName}
          onClose={() => setRecruiterModal(null)}
          onSuccess={() => setToast({ message: 'Email client opened — message ready to send!', type: 'success' })}
        />
      )}
    </div>
  );
}
