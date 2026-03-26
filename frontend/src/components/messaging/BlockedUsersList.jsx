import { useMessaging } from '../../context/MessagingContext';

export default function BlockedUsersList() {
  const { blockedMessages, unblockUser } = useMessaging();

  if (blockedMessages.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-3">🚫</p>
        <p className="font-medium text-gray-600">No blocked users</p>
        <p className="text-sm mt-1">Users you block from Messages will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {blockedMessages.map(user => (
        <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${user.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
              {user.avatar}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
          </div>
          <button
            onClick={() => unblockUser(user.id)}
            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition"
          >
            Unblock
          </button>
        </div>
      ))}
    </div>
  );
}
