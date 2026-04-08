import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import apiService from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

const DEFAULT_NOTIFICATION_PREFERENCES = {
  applications: true,
  jobs: true,
  recommendations: true,
};

const POOL = [
  { avatar: 'JM', avatarColor: 'bg-gray-500', name: 'Jan Mayer', text: 'invited you to interview with Nomad', badge: 'New', badgeColor: 'border border-yellow-400 text-yellow-600', type: 'interview', category: 'applications' },
  { avatar: 'JA', avatarColor: 'bg-rose-400', name: 'Jana Alicia', text: 'updated your job application status at Udacity', badge: 'Shortlisted', badgeColor: 'border border-teal-400 text-teal-600', type: 'status', category: 'applications' },
  { avatar: 'AW', avatarColor: 'bg-amber-400', name: 'Ally Wales', text: 'sent you an interview invitation for a Social Media Manager role', badge: null, type: 'interview_card', category: 'applications', card: { title: 'Interview', role: 'Social Media Manager Role', date: 'Mon, 20 July 2026', time: '12 PM - 12:30 PM' } },
  { avatar: 'KL', avatarColor: 'bg-indigo-400', name: 'Kevin Lee', text: 'reviewed your Lead Engineer application at Stripe', badge: 'In Review', badgeColor: 'border border-yellow-400 text-yellow-600', type: 'status', category: 'applications' },
  { avatar: 'SR', avatarColor: 'bg-green-500', name: 'Sarah Rowe', text: 'sent you a job offer for Product Designer', badge: 'Offered', badgeColor: 'border border-purple-400 text-purple-600', type: 'status', category: 'applications' },
  { avatar: 'MB', avatarColor: 'bg-blue-500', name: 'Mike Brown', text: 'shared a new Brand Designer opening that matches your profile', badge: 'New Role', badgeColor: 'border border-blue-400 text-blue-600', type: 'status', category: 'jobs' },
  { avatar: 'PC', avatarColor: 'bg-pink-500', name: 'Priya Chandra', text: 'recommended a Product Designer role based on your profile', badge: 'Recommended', badgeColor: 'border border-emerald-400 text-emerald-600', type: 'status', category: 'recommendations' },
  { avatar: 'TN', avatarColor: 'bg-orange-400', name: 'Tom Nash', text: 'posted a new Email Marketing role in your city', badge: 'Nearby', badgeColor: 'border border-orange-400 text-orange-600', type: 'status', category: 'jobs' },
  { avatar: 'EW', avatarColor: 'bg-cyan-500', name: 'Emma Wilson', text: 'invited you to a final round interview', badge: 'New', badgeColor: 'border border-yellow-400 text-yellow-600', type: 'interview', category: 'applications' },
  { avatar: 'RG', avatarColor: 'bg-violet-500', name: 'Ryan Garcia', text: 'highlighted an Interactive Developer job for you', badge: 'Recommended', badgeColor: 'border border-emerald-400 text-emerald-600', type: 'status', category: 'recommendations' },
  { avatar: 'LH', avatarColor: 'bg-lime-500', name: 'Lisa Huang', text: 'shared a Visual Designer role from Packer', badge: 'New Role', badgeColor: 'border border-blue-400 text-blue-600', type: 'status', category: 'jobs' },
  { avatar: 'DK', avatarColor: 'bg-red-400', name: 'David Kim', text: 'recommended a frontend role that fits your recent searches', badge: 'Recommended', badgeColor: 'border border-emerald-400 text-emerald-600', type: 'status', category: 'recommendations' },
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

const INITIAL = POOL.slice(0, 6).map((template, index) => ({
  ...template,
  id: index + 1,
  timestamp: Date.now() - [720000, 259200000, 1209600000, 432000000, 604800000, 86400000][index],
  read: [false, false, false, true, true, false][index],
}));

function buildPreferencesFromProfile(profile) {
  return {
    applications: profile?.applicationNotifications ?? true,
    jobs: profile?.jobNotifications ?? true,
    recommendations: profile?.recommendationNotifications ?? true,
  };
}

function isNotificationEnabled(notification, preferences) {
  return preferences[notification.category] !== false;
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(INITIAL);
  const [toast, setToast] = useState(null);
  const [notificationPreferences, setNotificationPreferences] = useState(DEFAULT_NOTIFICATION_PREFERENCES);
  const usedIndices = useRef(new Set([0, 1, 2, 3, 4, 5]));

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNotifications((currentNotifications) => [...currentNotifications]);
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadPreferences = async () => {
      if (!user) {
        setNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
        return;
      }

      try {
        const profile = await apiService.getMyProfile();
        if (!ignore) {
          setNotificationPreferences(buildPreferencesFromProfile(profile));
        }
      } catch (error) {
        if (!ignore) {
          setNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
        }
      }
    };

    loadPreferences();
    return () => {
      ignore = true;
    };
  }, [user?.id]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const available = POOL
        .map((template, index) => ({ template, index }))
        .filter(({ template, index }) => isNotificationEnabled(template, notificationPreferences) && !usedIndices.current.has(index));

      if (available.length === 0) {
        usedIndices.current.clear();
        return;
      }

      const chosen = available[Math.floor(Math.random() * available.length)];
      usedIndices.current.add(chosen.index);

      const nextNotification = makeNotification(chosen.template);
      setNotifications((currentNotifications) => [nextNotification, ...currentNotifications].slice(0, 20));
      setToast(nextNotification);
    }, 30 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [notificationPreferences]);

  const markAllRead = useCallback(() => {
    setNotifications((currentNotifications) => currentNotifications.map((notification) => ({ ...notification, read: true })));
  }, []);

  const markRead = useCallback((id) => {
    setNotifications((currentNotifications) => currentNotifications.map((notification) => (
      notification.id === id ? { ...notification, read: true } : notification
    )));
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const updateNotificationPreferencesLocally = useCallback((nextPreferences) => {
    setNotificationPreferences((currentPreferences) => (
      typeof nextPreferences === 'function' ? nextPreferences(currentPreferences) : nextPreferences
    ));
  }, []);

  const filteredNotifications = notifications.filter((notification) => isNotificationEnabled(notification, notificationPreferences));
  const unreadCount = filteredNotifications.filter((notification) => !notification.read).length;
  const visibleToast = toast && isNotificationEnabled(toast, notificationPreferences) ? toast : null;

  return (
    <NotificationContext.Provider
      value={{
        notifications: filteredNotifications,
        unreadCount,
        markAllRead,
        markRead,
        toast: visibleToast,
        dismissToast,
        timeAgo,
        user,
        notificationPreferences,
        updateNotificationPreferencesLocally,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
