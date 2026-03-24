import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

const POOL = [
  { avatar: 'JM', avatarColor: 'bg-gray-500',   name: 'Jan Mayer',     text: 'invited you to interview with Nomad',                        badge: 'New',         badgeColor: 'border border-yellow-400 text-yellow-600', type: 'interview' },
  { avatar: 'JA', avatarColor: 'bg-rose-400',    name: 'Jana Alicia',   text: 'from Udacity updated your job application status',           badge: 'Shortlisted', badgeColor: 'border border-teal-400 text-teal-600',    type: 'status' },
  { avatar: 'AW', avatarColor: 'bg-amber-400',   name: 'Ally Wales',    text: 'from Digital Ocean sent you an interview invitation',        badge: null,          type: 'interview_card', card: { title: 'Interview', role: 'Social Media Manager Role', date: 'Mon, 20 July 2021', time: '12 PM – 12:30 PM' } },
  { avatar: 'KL', avatarColor: 'bg-indigo-400',  name: 'Kevin Lee',     text: 'from Stripe reviewed your Lead Engineer application',        badge: 'In Review',   badgeColor: 'border border-yellow-400 text-yellow-600', type: 'status' },
  { avatar: 'SR', avatarColor: 'bg-green-500',   name: 'Sarah Rowe',    text: 'from Maze sent you a job offer for Product Designer',        badge: 'Offered',     badgeColor: 'border border-purple-400 text-purple-600', type: 'status' },
  { avatar: 'MB', avatarColor: 'bg-blue-500',    name: 'Mike Brown',    text: 'from Dropbox shortlisted you for Brand Designer',            badge: 'Shortlisted', badgeColor: 'border border-teal-400 text-teal-600',    type: 'status' },
  { avatar: 'PC', avatarColor: 'bg-pink-500',    name: 'Priya Chandra', text: 'from Coinbase scheduled a technical assessment for you',     badge: 'Assessment',  badgeColor: 'border border-blue-400 text-blue-600',    type: 'status' },
  { avatar: 'TN', avatarColor: 'bg-orange-400',  name: 'Tom Nash',      text: 'from Revolut declined your Email Marketing application',     badge: 'Declined',    badgeColor: 'border border-red-400 text-red-500',      type: 'status' },
  { avatar: 'EW', avatarColor: 'bg-cyan-500',    name: 'Emma Wilson',   text: 'from Webflow invited you to a final round interview',        badge: 'New',         badgeColor: 'border border-yellow-400 text-yellow-600', type: 'interview' },
  { avatar: 'RG', avatarColor: 'bg-violet-500',  name: 'Ryan Garcia',   text: 'from Terraform hired you for Interactive Developer role',    badge: 'Hired',       badgeColor: 'border border-green-500 text-green-600',  type: 'status' },
  { avatar: 'LH', avatarColor: 'bg-lime-500',    name: 'Lisa Huang',    text: 'from Packer sent you an offer for Visual Designer',         badge: 'Offered',     badgeColor: 'border border-purple-400 text-purple-600', type: 'status' },
  { avatar: 'DK', avatarColor: 'bg-red-400',     name: 'David Kim',     text: 'from Discord wants to schedule a call with you',            badge: 'New',         badgeColor: 'border border-yellow-400 text-yellow-600', type: 'interview' },
  { avatar: 'NP', avatarColor: 'bg-teal-500',    name: 'Nina Patel',    text: 'from Robinhood moved your application to final stage',       badge: 'Shortlisted', badgeColor: 'border border-teal-400 text-teal-600',    type: 'status' },
  { avatar: 'CF', avatarColor: 'bg-fuchsia-500', name: 'Chris Ford',    text: 'from Kraken reviewed your portfolio and left feedback',      badge: 'In Review',   badgeColor: 'border border-yellow-400 text-yellow-600', type: 'status' },
  { avatar: 'OB', avatarColor: 'bg-sky-500',     name: 'Olivia Brooks', text: 'from Udacity congratulated you on completing the assessment',badge: 'Assessment',  badgeColor: 'border border-blue-400 text-blue-600',    type: 'status' },
];

function timeAgo(date) {
  const diff = Math.floor((Date.now() - date) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min${Math.floor(diff / 60) > 1 ? 's' : ''} ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
}

let idCounter = 100;

function makeNotification(template) {
  return {
    ...template,
    id: ++idCounter,
    timestamp: Date.now(),
    read: false,
  };
}

const INITIAL = POOL.slice(0, 5).map((t, i) => ({
  ...t,
  id: i + 1,
  timestamp: Date.now() - [720000, 259200000, 1209600000, 432000000, 604800000][i],
  read: [false, false, false, true, true][i],
}));

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(INITIAL);
  const [toast, setToast] = useState(null);
  const usedIndices = useRef(new Set([0, 1, 2, 3, 4]));

  // Refresh time labels every 30s
  useEffect(() => {
    const t = setInterval(() => {
      setNotifications(ns => [...ns]); // trigger re-render for timeAgo
    }, 30000);
    return () => clearInterval(t);
  }, []);

  // Add a new notification every 60s
  useEffect(() => {
    const t = setInterval(() => {
      const available = POOL.map((_, i) => i).filter(i => !usedIndices.current.has(i));
      if (available.length === 0) {
        usedIndices.current.clear(); // reset cycle
        return;
      }
      const idx = available[Math.floor(Math.random() * available.length)];
      usedIndices.current.add(idx);
      const notif = makeNotification(POOL[idx]);
      setNotifications(ns => [notif, ...ns].slice(0, 20)); // cap at 20
      setToast(notif);
    }, 30 * 60 * 1000); // every 30 minutes
    return () => clearInterval(t);
  }, []);

  const markAllRead = useCallback(() =>
    setNotifications(ns => ns.map(n => ({ ...n, read: true }))), []);

  const markRead = useCallback((id) =>
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n)), []);

  const dismissToast = useCallback(() => setToast(null), []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAllRead,
      markRead,
      toast,
      dismissToast,
      timeAgo,
      user,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
