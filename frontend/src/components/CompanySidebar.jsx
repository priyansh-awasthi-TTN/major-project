import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LS_KEY = 'jh_company_messages';

function getUnreadCount() {
  try {
    const msgs = JSON.parse(sessionStorage.getItem(LS_KEY)) || [];
    return msgs.filter(m => m.unread).length;
  } catch { return 0; }
}

const NAV = [
  { label: 'Dashboard',       icon: '🏠', path: '/company/dashboard' },
  { label: 'Messages',        icon: '💬', path: '/company/messages', badge: true },
  { label: 'Company Profile', icon: '🏢', path: '/company/profile' },
  { label: 'All Applicants',  icon: '👥', path: '/company/applicants' },
  { label: 'Job Listing',     icon: '📋', path: '/company/jobs' },
  { label: 'My Schedule',     icon: '📅', path: '/company/schedule' },
];

const SETTINGS = [
  { label: 'Settings',    icon: '⚙️', path: '/company/settings' },
  { label: 'Help Center', icon: '❓', path: '/company/help' },
];

export default function CompanySidebar() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const unread = getUnreadCount();
  const displayName = user?.fullName || 'Company';
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-200 flex flex-col justify-between py-6 px-4 flex-shrink-0">
      <div>
        <Link to="/" className="flex items-center gap-2 font-bold text-lg mb-6 px-2">
          <span className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm">J</span>
          JobHuntly
        </Link>

        {/* Company selector */}
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 mb-6 cursor-pointer hover:bg-gray-100">
          <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">{initials}</div>
          <span className="text-sm font-medium text-gray-800 flex-1 truncate">{displayName}</span>
          <span className="text-gray-400 text-xs">▼</span>
        </div>

        <nav className="space-y-1">
          {NAV.map(item => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${pathname.startsWith(item.path) ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
              <span>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && unread > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unread}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="mt-8">
          <p className="text-xs text-gray-400 uppercase px-3 mb-2">Settings</p>
          {SETTINGS.map(item => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${pathname === item.path ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 px-3 py-3 border-t border-gray-200 mt-4">
        <div className="w-9 h-9 rounded-full bg-indigo-200 flex items-center justify-center text-sm font-bold text-indigo-700 flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
          <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
        </div>
      </div>
    </aside>
  );
}
