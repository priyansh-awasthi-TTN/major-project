import { Link } from 'react-router-dom';
import { BellIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function CompanyTopBar({ title, subtitle }) {
  const { user } = useAuth();
  const { unreadCount = 0 } = useNotifications();

  const companyName = user?.companyName || user?.fullName || 'Nomad';
  const heading = title || companyName;
  const supportingText = subtitle || (title ? companyName : 'Company workspace');

  return (
    <div className="fixed inset-x-0 top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur lg:left-60">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg">{heading}</h1>
          <p className="truncate text-xs text-slate-500">{supportingText}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="notifications"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
          >
            <BellIcon className="h-5 w-5" />
            {unreadCount > 0 ? (
              <span className="absolute right-2 top-2 flex h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
            ) : null}
          </button>

          <Link
            to="/company/jobs/post"
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <PlusIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Post a job</span>
            <span className="sm:hidden">Post</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
