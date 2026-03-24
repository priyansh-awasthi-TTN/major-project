import { useState } from 'react';
import { Link } from 'react-router-dom';
import NotificationPanel from './NotificationPanel';
import { useNotifications } from '../context/NotificationContext';

export default function DashTopBar({ title, children }) {
  const [bellOpen, setBellOpen] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <div className="flex justify-between items-center px-8 py-5 bg-white border-b border-gray-200 flex-shrink-0">
      {children ? children : <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
      <div className="flex items-center gap-3">
        <Link to="/" className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">
          Back to homepage
        </Link>

        <div className="relative">
          <button
            onClick={() => setBellOpen(o => !o)}
            className={`relative p-1.5 rounded-full transition ${bellOpen ? 'bg-indigo-50' : 'hover:bg-gray-100'}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-700"
              style={{ animation: 'ring 2s ease-in-out infinite', transformOrigin: 'top center' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>

          <NotificationPanel open={bellOpen} onClose={() => setBellOpen(false)} />
        </div>
      </div>
    </div>
  );
}
