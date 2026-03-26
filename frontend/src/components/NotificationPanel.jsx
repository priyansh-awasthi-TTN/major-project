import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

const FILTERS = ['All', 'Unread', 'Interviews', 'Status'];

function NotifItem({ n, onMarkRead, timeAgo, userName, userEmail }) {
  return (
    <div
      onClick={() => onMarkRead(n.id)}
      className={`px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-indigo-50/50' : ''}`}
    >
      <div className="flex gap-3">
        <div className={`${n.avatarColor} text-white rounded-full w-10 h-10 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5`}>
          {n.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800 leading-snug">
            <span className="font-semibold">{n.name}</span>{' '}
            {n.text.replace('Jake Gyll', userName)}
          </p>
          {n.badge && (
            <span className={`inline-block mt-1.5 text-xs px-3 py-0.5 rounded-full border font-medium ${n.badgeColor}`}>
              {n.badge}
            </span>
          )}
          {n.type === 'interview_card' && n.card && (
            <div className="mt-2 border-l-4 border-indigo-600 bg-gray-50 rounded-r-xl pl-3 pr-3 py-3">
              <p className="font-bold text-gray-900 text-sm">Interview – {userName}</p>
              <p className="text-xs text-gray-500 mb-2">{n.card.role}</p>
              <div className="grid grid-cols-2 gap-1 text-xs mb-2">
                <div className="flex items-center gap-1 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Date
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Time
                </div>
                <span className="font-medium text-gray-800">{n.card.date}</span>
                <span className="font-medium text-gray-800">{n.card.time}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold">
                  {userName.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">{userName}</p>
                  <p className="text-xs text-gray-400">{userEmail}</p>
                </div>
              </div>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1.5">{timeAgo(n.timestamp)}</p>
        </div>
        {!n.read && (
          <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-2" />
        )}
      </div>
    </div>
  );
}

export default function NotificationPanel({ open, onClose }) {
  const { notifications, unreadCount, markAllRead, markRead, timeAgo, user } = useNotifications();
  const [filter, setFilter] = useState('All');
  const panelRef = useRef(null);
  const navigate = useNavigate();

  const userName = user?.fullName || 'Jake Gyll';
  const userEmail = user?.email || 'jakegyll@email.com';

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const filtered = notifications.filter(n => {
    if (filter === 'Unread') return !n.read;
    if (filter === 'Interviews') return n.type === 'interview' || n.type === 'interview_card';
    if (filter === 'Status') return n.type === 'status';
    return true;
  });

  // Group by Today / Earlier
  const now = Date.now();
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const todayItems = filtered.filter(n => n.timestamp >= todayStart);
  const earlierItems = filtered.filter(n => n.timestamp < todayStart);

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
      style={{ maxHeight: '560px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-900 text-base">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
              {unreadCount}
            </span>
          )}
        </div>
        <button onClick={markAllRead} className="text-indigo-600 text-sm font-medium hover:underline">
          Mark all as read
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 px-4 py-2 border-b border-gray-100 flex-shrink-0">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {f}
            {f === 'Unread' && unreadCount > 0 && (
              <span className="ml-1 bg-red-500 text-white rounded-full px-1 text-xs">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            No {filter.toLowerCase()} notifications
          </div>
        ) : (
          <>
            {todayItems.length > 0 && (
              <>
                <div className="px-5 py-2 bg-gray-50">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Today</span>
                </div>
                {todayItems.map(n => (
                  <NotifItem key={n.id} n={n} onMarkRead={markRead} timeAgo={timeAgo} userName={userName} userEmail={userEmail} />
                ))}
              </>
            )}
            {earlierItems.length > 0 && (
              <>
                <div className="px-5 py-2 bg-gray-50">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Earlier</span>
                </div>
                {earlierItems.map(n => (
                  <NotifItem key={n.id} n={n} onMarkRead={markRead} timeAgo={timeAgo} userName={userName} userEmail={userEmail} />
                ))}
              </>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-100 text-center flex-shrink-0">
        <button
          onClick={() => { onClose(); navigate('/dashboard/notifications'); }}
          className="text-indigo-600 text-sm font-medium hover:underline"
        >
          View all notifications
        </button>
      </div>
    </div>
  );
}
