import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMessaging } from '../context/MessagingContext';

const navItems = [
  { label: 'Dashboard',       icon: '🏠', path: '/dashboard',             match: (p) => p === '/dashboard' },
  { label: 'Network',         icon: '🌐', path: '/dashboard/network',     match: (p) => p.startsWith('/dashboard/network') },
  { label: 'Messages',        icon: '💬', path: '/dashboard/messages',    match: (p) => p.startsWith('/dashboard/messages') || p.startsWith('/dashboard/profile/') },
  { label: 'My Applications', icon: '📄', path: '/dashboard/applications',match: (p) => p.startsWith('/dashboard/applications') },
  { label: 'Find Jobs',       icon: '🔍', path: '/dashboard/find-jobs',   match: (p) => p.startsWith('/dashboard/find-jobs') || p.startsWith('/dashboard/jobs/') },
  { label: 'Browse Companies',icon: '🏢', path: '/dashboard/companies',   match: (p) => p.startsWith('/dashboard/companies') },
  { label: 'My Public Profile',icon: '👤',path: '/dashboard/profile',     match: (p) => p === '/dashboard/profile' },
];

const settingsItems = [
  { label: 'Settings',    icon: '⚙️', path: '/dashboard/settings' },
  { label: 'Help Center', icon: '❓', path: '/dashboard/help' },
];

export default function DashboardSidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { messages } = useMessaging();

  const unreadCount = messages.filter(m => !m.isRead && !m.isArchived).length;

  const displayName  = user?.fullName || 'User';
  const displayEmail = user?.email    || 'user@email.com';
  const initials     = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleLogout = async () => {
    console.log('Logout button clicked');
    try {
      await logout();
      console.log('Logout successful, navigating to home');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, clear local state and navigate
      navigate('/', { replace: true });
    }
  };

  return (
    <aside className="w-64 h-screen sticky top-0 bg-white border-r border-gray-200 flex flex-col py-6 px-4 overflow-y-auto flex-shrink-0">
      <div className="flex-1">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg mb-8 px-2">
          <span className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm">J</span>
          JobHuntly
        </Link>

        <nav className="space-y-1">
          {navItems.map(item => {
            const badge = item.label === 'Messages' && unreadCount > 0 ? unreadCount : null;
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${item.match(pathname) ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                <span>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {badge && (
                  <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8">
          <p className="text-xs text-gray-400 uppercase tracking-wider px-3 mb-2">Settings</p>
          {settingsItems.map(item => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${pathname === item.path ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Logout + User profile at bottom */}
      <div className="mt-4">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition mb-1">
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 3H4a1 1 0 00-1 1v12a1 1 0 001 1h3M13 15l4-5-4-5M17 10H7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Logout
        </button>
        <div className="flex items-center gap-3 px-3 py-3 border-t border-gray-200">
          <div className="w-9 h-9 rounded-full bg-blue-200 flex items-center justify-center text-sm font-bold text-blue-700 flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
            <p className="text-xs text-gray-400 truncate">{displayEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
