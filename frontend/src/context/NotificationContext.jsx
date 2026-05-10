import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import apiService from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

const DEFAULT_NOTIFICATION_PREFERENCES = {
  applications: true,
  jobs: true,
  recommendations: true,
};

const AVATAR_TONES = [
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-blue-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-violet-500',
];

const getInitials = (value) => {
  const cleaned = String(value || '').trim();
  if (!cleaned) return 'NA';
  return cleaned.split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
};

const getAvatarTone = (value) => {
  const seed = String(value || '').split('').reduce((total, char) => total + char.charCodeAt(0), 0);
  return AVATAR_TONES[seed % AVATAR_TONES.length];
};

function timeAgo(date) {
  const diff = Math.floor((Date.now() - date) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min${Math.floor(diff / 60) > 1 ? 's' : ''} ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
}

const normalizeNotification = (notification) => {
  const actorName = notification.actorName || 'System';
  return {
    id: notification.id,
    name: actorName,
    text: notification.text || '',
    badge: notification.badge || null,
    badgeColor: notification.badgeColor || 'border border-indigo-400 text-indigo-600',
    type: notification.type || 'status',
    category: notification.category || 'applications',
    read: Boolean(notification.read),
    timestamp: notification.createdAt ? new Date(notification.createdAt).getTime() : Date.now(),
    avatar: getInitials(actorName),
    avatarColor: getAvatarTone(actorName),
  };
};

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
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);
  const [notificationPreferences, setNotificationPreferences] = useState(DEFAULT_NOTIFICATION_PREFERENCES);
  const lastToastId = useRef(null);

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
    let ignore = false;

    const loadNotifications = async () => {
      if (!user) {
        setNotifications([]);
        return;
      }

      try {
        const data = await apiService.getNotifications();
        if (ignore) return;
        const normalized = (Array.isArray(data) ? data : []).map(normalizeNotification);
        setNotifications(normalized);

        const latestUnread = normalized.find((item) => !item.read);
        if (latestUnread && latestUnread.id !== lastToastId.current) {
          lastToastId.current = latestUnread.id;
          setToast(latestUnread);
        }
      } catch (error) {
        if (!ignore) {
          setNotifications([]);
        }
      }
    };

    loadNotifications();
    const intervalId = setInterval(loadNotifications, 30000);

    return () => {
      ignore = true;
      clearInterval(intervalId);
    };
  }, [user?.id]);

  const markAllRead = useCallback(async () => {
    try {
      await apiService.markAllNotificationsRead();
      setNotifications((currentNotifications) => currentNotifications.map((notification) => ({ ...notification, read: true })));
    } catch (error) {
      setNotifications((currentNotifications) => currentNotifications.map((notification) => ({ ...notification, read: true })));
    }
  }, []);

  const markRead = useCallback(async (id) => {
    try {
      await apiService.markNotificationRead(id);
    } finally {
      setNotifications((currentNotifications) => currentNotifications.map((notification) => (
        notification.id === id ? { ...notification, read: true } : notification
      )));
    }
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
