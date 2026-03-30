import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DropdownMenu from '../../components/DropdownMenu';
import { useAuth } from '../../context/AuthContext';
import DashTopBar from '../../components/DashTopBar';
import Toast from '../../components/Toast';
import MessageRecruiterModal from '../../components/MessageRecruiterModal';
import { messages } from '../../data/mockData';
import apiService from '../../services/api';

const LS_CAL = 'jh_calendarDate';
const PAGE_SIZE = 11;

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
  { label: 'All', filter: null },
  { label: 'In Review', filter: 'In Review' },
  { label: 'Interviewing', filter: 'Interviewing' },
  { label: 'Assessment', filter: 'Assessment' },
  { label: 'Offered', filter: 'Offered' },
  { label: 'Hired', filter: 'Hired' },
];

const sortOptions = ['Date Applied (Newest)', 'Date Applied (Oldest)', 'Company A-Z', 'Status'];

// ── Calendar (same as Dashboard) ──────────────────────────────────────────────
function Calendar({ selectedDate, onDateChange, onClose }) {
  const ref = useRef(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState('days');
  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const isToday    = (d) => d.toDateString() === today.toDateString();
  const isCurMonth = (d) => d.getMonth() === month;
  const isSelected = (d) => selectedDate && d.toDateString() === selectedDate.toDateString();

  const days = () => {
    const first = new Date(year, month, 1);
    const start = new Date(first); start.setDate(start.getDate() - first.getDay());
    return Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return d; });
  };

  return (
    <div ref={ref} className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 w-80">
      {viewMode === 'days' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="p-1 hover:bg-gray-100 rounded">‹</button>
            <button onClick={() => setViewMode('months')} className="font-semibold text-gray-900 hover:bg-gray-100 px-2 py-1 rounded text-sm">{monthNames[month]} {year}</button>
            <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="p-1 hover:bg-gray-100 rounded">›</button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="text-center text-xs font-medium text-gray-500 py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days().map((d, i) => (
              <button key={i} onClick={() => { onDateChange(d); onClose(); }}
                className={`text-center py-1.5 text-xs rounded hover:bg-gray-100 transition ${!isCurMonth(d) ? 'text-gray-300' : 'text-gray-700'} ${isToday(d) ? 'bg-blue-100 text-blue-600 font-semibold' : ''} ${isSelected(d) ? 'bg-blue-600 text-white' : ''}`}>
                {d.getDate()}
              </button>
            ))}
          </div>
        </>
      )}
      {viewMode === 'months' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentMonth(new Date(year - 1, month, 1))} className="p-1 hover:bg-gray-100 rounded">‹</button>
            <button onClick={() => setViewMode('years')} className="font-semibold text-gray-900 hover:bg-gray-100 px-2 py-1 rounded text-sm">{year}</button>
            <button onClick={() => setCurrentMonth(new Date(year + 1, month, 1))} className="p-1 hover:bg-gray-100 rounded">›</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {monthNames.map((mn, i) => (
              <button key={i} onClick={() => { setCurrentMonth(new Date(year, i, 1)); setViewMode('days'); }}
                className={`text-center py-2 text-xs rounded hover:bg-gray-100 transition ${month === i ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
                {mn.slice(0, 3)}
              </button>
            ))}
          </div>
        </>
      )}
      {viewMode === 'years' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentMonth(new Date(Math.floor(year/10)*10 - 10, month, 1))} className="p-1 hover:bg-gray-100 rounded">‹</button>
            <span className="font-semibold text-gray-900 text-sm">{Math.floor(year/10)*10} – {Math.floor(year/10)*10+9}</span>
            <button onClick={() => setCurrentMonth(new Date(Math.floor(year/10)*10 + 10, month, 1))} className="p-1 hover:bg-gray-100 rounded">›</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 12 }, (_, i) => Math.floor(year/10)*10 - 1 + i).map(y => (
              <button key={y} onClick={() => { setCurrentMonth(new Date(y, month, 1)); setViewMode('months'); }}
                className={`text-center py-2 text-xs rounded hover:bg-gray-100 transition ${year === y ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
                {y}
              </button>
            ))}
          </div>
        </>
      )}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <button onClick={() => { onDateChange(today); onClose(); }} className="w-full text-center text-xs text-blue-600 hover:text-blue-700 font-medium">Today</button>
      </div>
    </div>
  );
}

// ── Notes helpers ─────────────────────────────────────────────────────────────
const LS_NOTES    = 'jh_appNotes';
const LS_FOLLOWUP = 'jh_followups';
const LS_ASSESS   = 'jh_assessments';
function loadNotes() { try { return JSON.parse(sessionStorage.getItem(LS_NOTES)) || {}; } catch { return {}; } }
function saveNotes(n) { sessionStorage.setItem(LS_NOTES, JSON.stringify(n)); }
function loadLS(key) { try { return JSON.parse(sessionStorage.getItem(key)) || {}; } catch { return {}; } }
function saveLS(key, val) { sessionStorage.setItem(key, JSON.stringify(val)); }

// ── Detail Drawer ─────────────────────────────────────────────────────────────
function DetailDrawer({ app, onClose, onStatusChange, onToast }) {
  const [input, setInput]             = useState('');
  const [notes, setNotes]             = useState(() => (loadNotes()[app?.id] || []));
  const [followupSent, setFollowupSent]   = useState(() => !!(loadLS(LS_FOLLOWUP)[app?.id]));
  const [assessStarted, setAssessStarted] = useState(() => !!(loadLS(LS_ASSESS)[app?.id]));
  const [confirmDecline, setConfirmDecline] = useState(false);

  useEffect(() => {
    setNotes(loadNotes()[app?.id] || []);
    setInput('');
    setFollowupSent(!!(loadLS(LS_FOLLOWUP)[app?.id]));
    setAssessStarted(!!(loadLS(LS_ASSESS)[app?.id]));
    setConfirmDecline(false);
  }, [app?.id]);

  if (!app) return null;

  const addNote = () => {
    const text = input.trim(); if (!text) return;
    const entry = { id: Date.now(), text, time: new Date().toLocaleString() };
    const updated = [entry, ...notes];
    setNotes(updated);
    const all = loadNotes(); all[app.id] = updated; saveNotes(all);
    setInput('');
  };
  const deleteNote = (id) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    const all = loadNotes(); all[app.id] = updated; saveNotes(all);
  };

  const handleFollowup = () => {
    const map = loadLS(LS_FOLLOWUP);
    map[app.id] = { sentAt: new Date().toISOString() };
    saveLS(LS_FOLLOWUP, map);
    setFollowupSent(true);
    onToast('Follow-up request sent to the recruiter!', 'success');
  };

  const handleStartAssessment = () => {
    const map = loadLS(LS_ASSESS);
    map[app.id] = { startedAt: new Date().toISOString() };
    saveLS(LS_ASSESS, map);
    setAssessStarted(true);
    onStatusChange(app.id, 'Interviewing');
    onToast('Assessment started! Status updated to Interviewing.', 'success');
    onClose();
  };

  const handleAccept = () => {
    onStatusChange(app.id, 'Hired');
    onToast(`Congratulations! You accepted the offer from ${app.company}.`, 'success');
    onClose();
  };

  const handleDecline = () => {
    onStatusChange(app.id, 'Unsuitable');
    onToast(`Offer from ${app.company} declined.`, 'success');
    setConfirmDecline(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-900">Application Detail</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="px-6 py-5 space-y-5">
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
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Date Applied</span><span className="font-medium">{app.dateApplied}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Salary Range</span><span className="font-medium">{app.salary}</span></div>
          </div>

          {app.status === 'In Review' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-yellow-700">⏳ Under Review</p>
                <p className="text-xs text-gray-500 mt-1">Your application is being reviewed. You can send one follow-up request to prompt the recruiter.</p>
              </div>
              {followupSent ? (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <span className="text-green-600 text-sm">✓</span>
                  <p className="text-xs text-green-700 font-medium">Follow-up sent. The recruiter has been notified.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">Sending a follow-up lets the recruiter know you are still interested.</p>
                  <button onClick={handleFollowup} className="text-xs bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition font-medium">
                    📨 Request Follow-up
                  </button>
                </div>
              )}
            </div>
          )}

          {app.status === 'Interviewing' && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-orange-700">🎤 Interview Scheduled</p>
              <p className="text-xs text-gray-500">Prepare well — research the company and practice common interview questions.</p>
              <div className="flex gap-2 pt-1">
                <button onClick={() => onToast('Interview added to your calendar!', 'success')} className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition">📅 Add to Calendar</button>
                <button onClick={() => onToast('Reschedule request sent.', 'success')} className="text-xs border border-orange-400 text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition">🔄 Reschedule</button>
              </div>
            </div>
          )}

          {app.status === 'Assessment' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-blue-700">📝 Assessment Pending</p>
                <p className="text-xs text-gray-500 mt-1">Complete the assessment to move forward. Your status will update to Interviewing once started.</p>
              </div>
              {assessStarted ? (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <span className="text-green-600">✓</span>
                  <p className="text-xs text-green-700 font-medium">Assessment in progress. Status updated to Interviewing.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="bg-white border border-blue-100 rounded-lg p-3 text-xs text-gray-600 space-y-1">
                    <p>⏱ Estimated time: <span className="font-medium">60–90 minutes</span></p>
                    <p>📋 Format: <span className="font-medium">Technical + Aptitude</span></p>
                    <p>⚠️ Once started, the timer cannot be paused.</p>
                  </div>
                  <button onClick={handleStartAssessment} className="w-full text-sm bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                    🚀 Start Assessment
                  </button>
                </div>
              )}
            </div>
          )}

          {app.status === 'Offered' && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-purple-700">🎉 Offer Received!</p>
                <p className="text-xs text-gray-500 mt-1">Review the offer carefully before accepting or declining.</p>
              </div>
              <div className="bg-white border border-purple-100 rounded-lg p-3 space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">Salary</span><span className="font-semibold text-gray-800">{app.salary}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-medium">{app.type}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Location</span><span className="font-medium">{app.location}</span></div>
              </div>
              {confirmDecline ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-semibold text-red-700">Are you sure you want to decline this offer?</p>
                  <p className="text-xs text-gray-500">This action cannot be undone.</p>
                  <div className="flex gap-2">
                    <button onClick={handleDecline} className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition">Yes, Decline</button>
                    <button onClick={() => setConfirmDecline(false)} className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleAccept} className="flex-1 text-sm bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium">✅ Accept Offer</button>
                  <button onClick={() => setConfirmDecline(true)} className="flex-1 text-sm border border-red-400 text-red-500 py-2 rounded-lg hover:bg-red-50 transition font-medium">❌ Decline</button>
                  <button onClick={() => onToast('Negotiation request sent.', 'success')} className="flex-1 text-sm border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition font-medium">💬 Negotiate</button>
                </div>
              )}
            </div>
          )}

          {app.status === 'Hired' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-green-700">🚀 Congratulations! You are hired.</p>
              <p className="text-xs text-gray-500">Welcome to the team! Check your email for onboarding details.</p>
              <button onClick={() => onToast('Onboarding details sent to your email!', 'success')} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition">📧 View Onboarding</button>
            </div>
          )}

          {app.status === 'Unsuitable' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-red-600">❌ Not Selected</p>
              <p className="text-xs text-gray-500">Unfortunately you were not selected. Keep applying!</p>
              <button onClick={() => onToast('Searching for similar jobs...', 'success')} className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">🔍 Find Similar Jobs</button>
            </div>
          )}

          {app.status === 'Shortlisted' && (
            <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-cyan-700">✅ Shortlisted</p>
              <p className="text-xs text-gray-500">You have been shortlisted. The recruiter will reach out soon with next steps.</p>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Your Notes</p>
            <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-400 transition">
              <textarea rows={3} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) addNote(); }}
                className="w-full px-3 py-2.5 text-sm outline-none resize-none text-gray-700 placeholder-gray-400"
                placeholder="Add a private note... (Ctrl+Enter to save)" />
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t border-gray-100">
                <span className="text-xs text-gray-400">{input.length} chars</span>
                <button onClick={addNote} disabled={!input.trim()} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed">Save Note</button>
              </div>
            </div>
            {notes.length > 0 ? (
              <div className="mt-3 space-y-2">
                {notes.map(n => (
                  <div key={n.id} className="bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2.5 group">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{n.text}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-gray-400">{n.time}</span>
                      <button onClick={() => deleteNote(n.id)} className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 mt-2 text-center py-3">No notes yet. Add one above.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Menu items ────────────────────────────────────────────────────────────────
const buildMenuItems = (app, onRemove, navigate, onMessageRecruiter) => [
  { icon: '👁️', label: 'View Details',    action: () => navigate(`/dashboard/jobs/${app.jobId}`) },
  { icon: '📄', label: 'View Job Posting', action: () => navigate(`/dashboard/jobs/${app.jobId}`) },
  {
    icon: '✉️', label: 'Message Recruiter',
    action: () => {
      const match = messages.find(m => m.company.toLowerCase() === app.company.toLowerCase());
      const email = match
        ? `${match.name.toLowerCase().replace(' ', '.')}@${app.company.toLowerCase()}.com`
        : `recruiter@${app.company.toLowerCase()}.com`;
      onMessageRecruiter({ email, name: match?.name || null, jobTitle: app.title, company: app.company });
    },
  },
  'divider',
  { icon: '🗑️', label: 'Remove Application', action: () => onRemove(app.id), danger: true },
];

// ── Pagination helper ─────────────────────────────────────────────────────────
function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;
  const pages = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
  }
  return (
    <div className="flex justify-center items-center gap-1 px-6 py-4">
      <button onClick={() => onChange(current - 1)} disabled={current === 1}
        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded disabled:opacity-30">‹</button>
      {pages.map((p, i) =>
        p === '...'
          ? <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">…</span>
          : <button key={p} onClick={() => onChange(p)}
              className={`w-8 h-8 rounded text-sm font-medium ${p === current ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{p}</button>
      )}
      <button onClick={() => onChange(current + 1)} disabled={current === total}
        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded disabled:opacity-30">›</button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MyApplications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = (user?.fullName || 'Jake').split(' ')[0];

  // Calendar — same sessionStorage key as Dashboard
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState(() => {
    try {
      const saved = sessionStorage.getItem(LS_CAL);
      if (saved) {
        const start = new Date(JSON.parse(saved));
        const end = new Date(start); end.setDate(end.getDate() + 6);
        return { start, end };
      }
    } catch {}
    return { start: new Date(2024, 6, 19), end: new Date(2024, 6, 25) };
  });

  const handleDateChange = (date) => {
    const end = new Date(date); end.setDate(end.getDate() + 6);
    setSelectedDateRange({ start: date, end });
    sessionStorage.setItem(LS_CAL, JSON.stringify(date.toISOString()));
  };

  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const dateLabel = `${fmt(selectedDateRange.start)} - ${fmt(selectedDateRange.end)}`;

  const [activeTab, setActiveTab]       = useState(0);
  const [showNotice, setShowNotice]     = useState(true);
  const [search, setSearch]             = useState('');
  const [showSearch, setShowSearch]     = useState(false);
  const [showFilter, setShowFilter]     = useState(false);
  const [sortBy, setSortBy]             = useState(sortOptions[0]);
  const [filterType, setFilterType]     = useState('');
  const [selectedApp, setSelectedApp]   = useState(null);
  const [openMenu, setOpenMenu]         = useState(null);
  const [applications, setApplications] = useState([]);
  const [toast, setToast]               = useState(null);
  const [recruiterModal, setRecruiterModal] = useState(null);
  const [page, setPage]                 = useState(1);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    apiService.getApplications()
      .then(data => setApplications(data || []))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = (id, newStatus) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    setSelectedApp(prev => prev?.id === id ? { ...prev, status: newStatus } : prev);
  };

  const handleToast = (message, type = 'success') => setToast({ message, type });
  const handleRemove = async (id) => {
    if (!window.confirm('Remove this application?')) return;
    try {
      await apiService.deleteApplication(id);
      setApplications(prev => prev.filter(a => a.id !== id));
      setToast({ message: 'Application removed', type: 'success' });
    } catch(e) {
      setToast({ message: 'Failed to remove application', type: 'error' });
    }
  };

  const tabFilter = tabs[activeTab].filter;
  let filtered = applications.filter(app => {
    const matchTab    = !tabFilter || app.status === tabFilter;
    const matchSearch = !search || app.company.toLowerCase().includes(search.toLowerCase()) || app.title.toLowerCase().includes(search.toLowerCase());
    const matchType   = !filterType || app.type === filterType;
    return matchTab && matchSearch && matchType;
  });

  if (sortBy === 'Company A-Z')           filtered = [...filtered].sort((a, b) => (a.company || '').localeCompare(b.company || ''));
  else if (sortBy === 'Date Applied (Oldest)') filtered = [...filtered].sort((a, b) => new Date(a.dateApplied) - new Date(b.dateApplied));
  else if (sortBy === 'Date Applied (Newest)') filtered = [...filtered].sort((a, b) => new Date(b.dateApplied) - new Date(a.dateApplied));
  else if (sortBy === 'Status')           filtered = [...filtered].sort((a, b) => (a.status || '').localeCompare(b.status || ''));

  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage    = Math.min(page, totalPages || 1);
  const paginated   = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const counts      = tabs.map(t => t.filter ? applications.filter(a => a.status === t.filter).length : applications.length);

  // Reset to page 1 when filters change
  const handleTabChange = (i) => { setActiveTab(i); setPage(1); };
  const handleSearch    = (v) => { setSearch(v); setPage(1); };

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <DashTopBar title="My Applications" />
      <div className="overflow-y-auto flex-1 px-8 py-6">

        {/* Header */}
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Keep it up, {firstName} 💪</h2>
            <p className="text-sm text-gray-500 mt-0.5">Here is job applications status from {dateLabel}.</p>
          </div>
          <div className="relative">
            <button onClick={() => setShowCalendar(v => !v)}
              className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white hover:bg-gray-50 transition">
              <span>{dateLabel}</span><span>📅</span>
            </button>
            {showCalendar && (
              <Calendar selectedDate={selectedDateRange.start} onDateChange={handleDateChange} onClose={() => setShowCalendar(false)} />
            )}
          </div>
        </div>

        {/* Notice */}
        {showNotice && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-4 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0">📋</div>
            <div className="flex-1">
              <p className="font-semibold text-blue-700 text-sm">New Notices</p>
              <p className="text-xs text-gray-500 mt-0.5">You can request a follow-up 7 days after applying if the status is In Review. Only one follow-up per job.</p>
            </div>
            <button onClick={() => setShowNotice(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
          {tabs.map((tab, i) => (
            <button key={tab.label} onClick={() => handleTabChange(i)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${activeTab === i ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab.label} ({counts[i]})
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Applications History</h3>
            <div className="flex gap-2 items-center">
              {showSearch && (
                <input autoFocus value={search} onChange={e => handleSearch(e.target.value)}
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

          {showFilter && (
            <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Sort by:</span>
                <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none text-gray-700">
                  {sortOptions.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Job Type:</span>
                <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none text-gray-700">
                  <option value="">All Types</option>
                  <option>Full-Time</option><option>Part-Time</option><option>Remote</option><option>Contract</option>
                </select>
              </div>
              <button onClick={() => { setSortBy(sortOptions[0]); setFilterType(''); setSearch(''); setPage(1); }}
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
              {paginated.map((app, idx) => (
                <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer" onClick={() => setSelectedApp(app)}>
                  <td className="px-6 py-4 text-gray-400">{(safePage - 1) * PAGE_SIZE + idx + 1}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-1 rounded transition" 
                         onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/companies/${app.companyId || app.company}`); }}>
                      <div className={`${app.color} text-white rounded-xl w-10 h-10 flex items-center justify-center text-xs font-bold flex-shrink-0`}>{app.logo}</div>
                      <p className="font-semibold text-gray-900">{app.company}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-600 cursor-pointer hover:text-blue-600 hover:underline"
                      onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/jobs/${app.jobId}`); }}>
                    {app.title}
                  </td>
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
                          <DropdownMenu items={buildMenuItems(app, handleRemove, navigate, setRecruiterModal)} onClose={() => setOpenMenu(null)} />
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                   <div className="flex items-center justify-center">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                   </div>
                </td></tr>
              )}
              {!loading && paginated.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">No applications found</td></tr>
              )}
            </tbody>
          </table>

          <Pagination current={safePage} total={totalPages} onChange={setPage} />
        </div>
      </div>

      <DetailDrawer app={selectedApp} onClose={() => setSelectedApp(null)} onStatusChange={handleStatusChange} onToast={handleToast} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {recruiterModal && (
        <MessageRecruiterModal
          recruiterEmail={recruiterModal.email}
          recruiterName={recruiterModal.name}
          jobTitle={recruiterModal.jobTitle}
          company={recruiterModal.company}
          senderName={user?.fullName}
          onClose={() => setRecruiterModal(null)}
          onSuccess={() => setToast({ message: 'Email client opened!', type: 'success' })}
        />
      )}
    </div>
  );
}
