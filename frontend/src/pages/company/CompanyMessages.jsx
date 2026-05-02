import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CompanyTopBar from '../../components/CompanyTopBar';
import MessageList from '../../components/messaging/MessageList';
import ChatWindow from '../../components/messaging/ChatWindow';
import Toast from '../../components/Toast';
import { useMessaging } from '../../context/MessagingContext';

export default function CompanyMessages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    messages,
    markRead,
    updateMeta,
    sendMessage,
    sendAttachment,
    blockUser,
    loadHistoryForUser,
    startNewChat,
  } = useMessaging();

  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const userId = Number(searchParams.get('user'));
    if (!userId) return;

    const found = messages.find((message) => message.id === userId);
    if (found) {
      setSelected(found);
      return;
    }

    startNewChat(
      userId,
      searchParams.get('name') || `User ${userId}`,
      searchParams.get('email') || '',
      searchParams.get('type') || 'JOBSEEKER',
    );
  }, [searchParams, messages, startNewChat]);

  useEffect(() => {
    if (!selected) return;

    const updated = messages.find((message) => message.id === selected.id);
    if (!updated) return;

    setSelected(updated);
    if (!updated.isRead) {
      markRead(updated.id);
    }
  }, [messages, selected?.id, markRead]);

  useEffect(() => {
    if (selected && typeof loadHistoryForUser === 'function') {
      loadHistoryForUser(selected.id);
    }
  }, [selected?.id, loadHistoryForUser]);

  const handleSelect = (message) => {
    setSelected(message);
    if (!message.isRead) {
      markRead(message.id);
    }
  };

  const togglePin = (id) => {
    updateMeta(id, { isPinned: !messages.find((message) => message.id === id)?.isPinned });
    setToast({ message: 'Updated', type: 'success' });
  };

  const toggleStar = (id) => {
    updateMeta(id, { isStarred: !messages.find((message) => message.id === id)?.isStarred });
    setToast({ message: 'Updated', type: 'success' });
  };

  const toggleMute = (id) => {
    updateMeta(id, { isMuted: !messages.find((message) => message.id === id)?.isMuted });
    setToast({ message: 'Updated', type: 'success' });
  };

  const toggleArchive = (id) => {
    const message = messages.find((entry) => entry.id === id);
    updateMeta(id, { isArchived: !message?.isArchived });
    if (selected?.id === id && !message?.isArchived) {
      setSelected(null);
    }
    setToast({ message: message?.isArchived ? 'Unarchived' : 'Archived', type: 'success' });
  };

  const handleBlock = (id) => {
    if (!confirm('Block this user? You can unblock them in Settings.')) return;
    blockUser(id);
    if (selected?.id === id) {
      setSelected(null);
    }
    setToast({ message: 'User blocked', type: 'success' });
  };

  const handleDelete = (id) => {
    if (!confirm('Delete this conversation? This cannot be undone.')) return;
    updateMeta(id, { isArchived: true });
    if (selected?.id === id) {
      setSelected(null);
    }
    setToast({ message: 'Conversation deleted', type: 'success' });
  };

  const buildProfilePath = (message) => `/company/seeker/${message.id}`;

  const menuItemsFor = (message) => [
    { icon: message.isPinned ? '📌' : '📍', label: message.isPinned ? 'Unpin' : 'Pin', action: () => togglePin(message.id) },
    { icon: message.isStarred ? '⭐' : '☆', label: message.isStarred ? 'Unstar' : 'Star', action: () => toggleStar(message.id) },
    { icon: '👤', label: 'View Profile', action: () => navigate(buildProfilePath(message)) },
    'divider',
    { icon: message.isMuted ? '🔊' : '🔇', label: message.isMuted ? 'Unmute' : 'Mute', action: () => toggleMute(message.id) },
    { icon: message.isArchived ? '📤' : '📥', label: message.isArchived ? 'Unarchive' : 'Archive', action: () => toggleArchive(message.id) },
    'divider',
    { icon: '🗑️', label: 'Delete', action: () => handleDelete(message.id), danger: true },
    { icon: '🚫', label: 'Block', action: () => handleBlock(message.id), danger: true },
  ];

  return (
    <div className="flex h-screen flex-col bg-white pb-16 lg:pb-0">
      <CompanyTopBar title="Messages" subtitle="Manage candidate conversations in one place." />

      <div className="flex min-h-0 flex-1 overflow-hidden pt-16">
        <MessageList
          messages={messages}
          selected={selected}
          onSelect={handleSelect}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          menuItemsFor={menuItemsFor}
          showArchived={showArchived}
          setShowArchived={setShowArchived}
          search={search}
          setSearch={setSearch}
        />

        <ChatWindow
          selected={selected}
          onTogglePin={togglePin}
          onToggleStar={toggleStar}
          onToggleMute={toggleMute}
          onToggleArchive={toggleArchive}
          onBlock={handleBlock}
          onDelete={handleDelete}
          onSend={sendMessage}
          onSendAttachment={sendAttachment}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          buildProfilePath={buildProfilePath}
        />
      </div>

      {toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null}
    </div>
  );
}
