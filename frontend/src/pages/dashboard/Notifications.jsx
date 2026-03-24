import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import DashTopBar from '../../components/DashTopBar';

const FILTERS = ['All', 'Unread', 'Interviews', 'Status'];

function NotifRow({ n, onMarkRead, timeAgo, userName, userEmail }) {
  return (
    <div
      onClick={() => onMarkRead(n.id)}
      className={`flex gap-4 px-6 py-5 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-indigo-50/40' : ''}`}
    >
      {/* Avatar */}
      <div className={`${n.avatarColor} text-white rounded-full w-11 h-11 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5`}>
        {n.avatar}
      </div>

      {/* Content */}
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
          <div className="mt-3 border-l-4 border-indigo-600 bg-gray-50 rounded-r-xl pl-4 pr-4 py-3 max-w-sm">
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

        <p className="text-xs text-gray-400 mt-2">{timeAgo(n.timestamp)}</p>
      </div>

      {/* Unread dot */}
      {!n.read && (
        <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full flex-shrink-0 mt-2" />
      )}
    </div>
  );
}

export default function Notifications() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAllRead, markRead, timeAgo } = useNotifications();
  const [filter, setFilter] = useState('All');

  const userName = user?.name || 'Jake Gyll';
  const userEmail = user?.email || 'jakegyll@email.com';

  const filtered = notifications.filter(n => {
    if (filter === 'Unread') return !n.read;
    if (filter === 'Interviews') return n.type === 'interview' || n.type === 'interview_card';
    if (filter === 'Status') return n.type === 'status';
    return true;
  });

  const todayStart = new Date().setHours(0, 0, 0, 0);
  const todayItems = filtered.filter(n => n.timestamp >= todayStart);
  const earlierItems = filtered.filter(n => n.timestamp < todayStart);

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <DashTopBar title="Notifications" />
      <div className="overflow-y-auto flex-1">
      <div className="max-w-3xl mx-auto px-8 py-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">All Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-indigo-600 text-white text-xs rounded-full px-2 py-0.5 font-semibold">
                {unreadCount} unread
              </span>
            )}
          </div>
          <button
            onClick={markAllRead}
            className="text-sm text-indigo-600 font-medium hover:underline"
          >
            Mark all as read
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition border ${
                filter === f
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {f}
              {f === 'Unread' && unreadCount > 0 && (
                <span className="ml-1.5 bg-red-500 text-white rounded-full px-1.5 text-xs">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Notification list */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              No {filter.toLowerCase()} notifications
            </div>
          ) : (
            <>
              {todayItems.length > 0 && (
                <>
                  <div className="px-6 py-2.5 bg-gray-50 border-b border-gray-100">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Today</span>
                  </div>
                  {todayItems.map(n => (
                    <NotifRow key={n.id} n={n} onMarkRead={markRead} timeAgo={timeAgo} userName={userName} userEmail={userEmail} />
                  ))}
                </>
              )}
              {earlierItems.length > 0 && (
                <>
                  <div className="px-6 py-2.5 bg-gray-50 border-b border-gray-100">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Earlier</span>
                  </div>
                  {earlierItems.map(n => (
                    <NotifRow key={n.id} n={n} onMarkRead={markRead} timeAgo={timeAgo} userName={userName} userEmail={userEmail} />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
