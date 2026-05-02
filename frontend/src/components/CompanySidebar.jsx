import { Link, useLocation } from 'react-router-dom';
import {
  BriefcaseIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  HomeIcon,
  QuestionMarkCircleIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useMessaging } from '../context/MessagingContext';

const NAV = [
  {
    label: 'Dashboard',
    path: '/company/dashboard',
    icon: HomeIcon,
    match: (pathname) => pathname === '/company/dashboard',
  },
  {
    label: 'Messages',
    path: '/company/messages',
    icon: ChatBubbleLeftRightIcon,
    badge: true,
    match: (pathname) => pathname.startsWith('/company/messages'),
  },
  {
    label: 'Company Profile',
    path: '/company/profile',
    icon: BuildingOffice2Icon,
    match: (pathname) => pathname.startsWith('/company/profile'),
  },
  {
    label: 'All Applicants',
    path: '/company/applicants',
    icon: UsersIcon,
    match: (pathname) => pathname.startsWith('/company/applicants'),
  },
  {
    label: 'Job Listing',
    path: '/company/jobs',
    icon: BriefcaseIcon,
    match: (pathname) => pathname.startsWith('/company/jobs'),
  },
  {
    label: 'My Schedule',
    path: '/company/schedule',
    icon: CalendarDaysIcon,
    match: (pathname) => pathname.startsWith('/company/schedule'),
  },
];

const SETTINGS = [
  {
    label: 'Settings',
    path: '/company/settings',
    icon: Cog6ToothIcon,
    match: (pathname) => pathname.startsWith('/company/settings'),
  },
  {
    label: 'Help Center',
    path: '/company/help',
    icon: QuestionMarkCircleIcon,
    match: (pathname) => pathname.startsWith('/company/help'),
  },
];

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function SidebarLink({ item, active, unread, compact = false }) {
  const Icon = item.icon;

  if (compact) {
    return (
      <Link
        to={item.path}
        className={`relative flex min-w-0 flex-1 flex-col items-center gap-1 px-2 py-2 text-[11px] font-medium transition ${
          active ? 'text-indigo-600' : 'text-slate-500'
        }`}
      >
        <div className={`rounded-2xl p-2 transition ${active ? 'bg-indigo-50' : 'bg-transparent'}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="truncate">{item.label.split(' ')[0]}</span>
        {item.badge && unread > 0 ? (
          <span className="absolute right-3 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-semibold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </Link>
    );
  }

  return (
    <Link
      to={item.path}
      className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${
        active
          ? 'bg-[#eef2ff] text-indigo-700 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.12)]'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
          active ? 'bg-white text-indigo-600 shadow-sm' : 'bg-slate-100 text-slate-500'
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && unread > 0 ? (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[11px] font-semibold text-white">
          {unread > 99 ? '99+' : unread}
        </span>
      ) : null}
    </Link>
  );
}

export default function CompanySidebar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { totalUnreadCount = 0 } = useMessaging();

  const companyName = user?.companyName || user?.fullName || 'Nomad';
  const contactName = user?.fullName || 'Maria Kelly';
  const contactEmail = user?.email || 'maria@email.com';
  const initials = getInitials(companyName);

  return (
    <>
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-60 lg:flex-col lg:border-r lg:border-slate-200 lg:bg-white">
        <div className="flex h-full flex-col px-4 py-5">
          <Link to="/" className="flex items-center gap-2 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
              J
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-900">JobHuntly</span>
          </Link>

          <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Company</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-sm font-bold text-white shadow-sm">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{companyName}</p>
                <p className="truncate text-xs text-slate-500">Workspace</p>
              </div>
              <ChevronDownIcon className="h-4 w-4 flex-shrink-0 text-slate-400" />
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            {NAV.map((item) => (
              <SidebarLink
                key={item.path}
                item={item}
                active={item.match(pathname)}
                unread={totalUnreadCount}
              />
            ))}
          </nav>

          <div className="mt-8">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Settings</p>
            <div className="mt-2 space-y-1">
              {SETTINGS.map((item) => (
                <SidebarLink
                  key={item.path}
                  item={item}
                  active={item.match(pathname)}
                  unread={totalUnreadCount}
                />
              ))}
            </div>
          </div>

          <div className="mt-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-sm font-bold text-indigo-700">
                {getInitials(contactName)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{contactName}</p>
                <p className="truncate text-xs text-slate-500">{contactEmail}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.35rem)] pt-2 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-1">
          {NAV.slice(0, 5).map((item) => (
            <SidebarLink
              key={item.path}
              item={item}
              active={item.match(pathname)}
              unread={totalUnreadCount}
              compact
            />
          ))}
        </div>
      </nav>
    </>
  );
}
