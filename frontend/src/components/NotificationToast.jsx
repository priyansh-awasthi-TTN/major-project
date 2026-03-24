import { useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationToast() {
  const { toast, dismissToast } = useNotifications();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(dismissToast, 5000);
    return () => clearTimeout(t);
  }, [toast, dismissToast]);

  if (!toast) return null;

  return (
    <div className="fixed top-6 right-6 z-[100] w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 flex gap-3 items-start animate-slide-in">
      <div className={`${toast.avatarColor} text-white rounded-full w-9 h-9 flex items-center justify-center text-xs font-bold flex-shrink-0`}>
        {toast.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-indigo-600 mb-0.5">New notification</p>
        <p className="text-sm text-gray-800 leading-snug">
          <span className="font-semibold">{toast.name}</span> {toast.text}
        </p>
        {toast.badge && (
          <span className={`inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full border font-medium ${toast.badgeColor}`}>
            {toast.badge}
          </span>
        )}
      </div>
      <button onClick={dismissToast} className="text-gray-400 hover:text-gray-600 text-lg leading-none flex-shrink-0">✕</button>
    </div>
  );
}
