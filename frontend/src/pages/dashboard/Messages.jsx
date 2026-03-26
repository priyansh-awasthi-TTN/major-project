import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMessaging } from '../../context/MessagingContext';
import DashTopBar from '../../components/DashTopBar';
import MessageList from '../../components/messaging/MessageList';
import ChatWindow from '../../components/messaging/ChatWindow';
import Toast from '../../components/Toast';

export default function Messages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { messages, markRead, updateMeta, sendMessage, blockUser } = useMessaging();

  const [selected, setSelected]       = useState(null);
  const [search, setSearch]           = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [openMenu, setOpenMenu]       = useState(null);
  const [toast, setToast]             = useState(null);

  // Auto-select from URL param (e.g. coming back from recruiter profile)
  useEffect(() => {
    const userId = searchParams.get('user');
    if (userId) {
      const found = messages.find(m => m.id === parseInt(userId));
      if (found) setSelected(found);
    }
  }, [searchParams]); // intentionally only on mount / param change

  // Keep selected in sync when messages update (e.g. new chat message sent)
  useEffect(() => {
    if (selected) {
      const updated = messages.find(m => m.id === selected.id);
      if (updated) setSelected(updated);
    }
  }, [messages]);

  const handleSelect = (msg) => {
    setSelected(msg);
    if (!msg.isRead) markRead(msg.id);
  };

  const togglePin     = (id) => { updateMeta(id, { isPinned:   !messages.find(m => m.id === id)?.isPinned   }); setToast({ message: 'Updated', type: 'success' }); };
  const toggleStar    = (id) => { updateMeta(id, { isStarred:  !messages.find(m => m.id === id)?.isStarred  }); setToast({ message: 'Updated', type: 'success' }); };
  const toggleMute    = (id) => { updateMeta(id, { isMuted:    !messages.find(m => m.id === id)?.isMuted    }); setToast({ message: 'Updated', type: 'success' }); };
  const toggleArchive = (id) => {
    const msg = messages.find(m => m.id === id);
    updateMeta(id, { isArchived: !msg?.isArchived });
    if (selected?.id === id && !msg?.isArchived) setSelected(null);
    setToast({ message: msg?.isArchived ? 'Unarchived' : 'Archived', type: 'success' });
  };

  const handleBlock = (id) => {
    if (!confirm('Block this user? You can unblock them in Settings.')) return;
    blockUser(id);
    if (selected?.id === id) setSelected(null);
    setToast({ message: 'User blocked', type: 'success' });
  };

  const handleDelete = (id) => {
    if (!confirm('Delete this conversation? This cannot be undone.')) return;
    // Mark as archived as a soft-delete (no backend)
    updateMeta(id, { isArchived: true });
    if (selected?.id === id) setSelected(null);
    setToast({ message: 'Conversation deleted', type: 'success' });
  };

  const menuItemsFor = (msg) => [
    { icon: msg.isPinned  ? '📌' : '📍', label: msg.isPinned  ? 'Unpin'    : 'Pin',     action: () => togglePin(msg.id) },
    { icon: msg.isStarred ? '⭐' : '☆',  label: msg.isStarred ? 'Unstar'   : 'Star',    action: () => toggleStar(msg.id) },
    { icon: '👤',                          label: 'View Profile',                         action: () => navigate(`/dashboard/profile/${msg.id}`) },
    'divider',
    { icon: msg.isMuted   ? '🔊' : '🔇', label: msg.isMuted   ? 'Unmute'   : 'Mute',    action: () => toggleMute(msg.id) },
    { icon: msg.isArchived? '📤' : '📥', label: msg.isArchived? 'Unarchive': 'Archive',  action: () => toggleArchive(msg.id) },
    'divider',
    { icon: '🗑️', label: 'Delete', action: () => handleDelete(msg.id), danger: true },
    { icon: '🚫', label: 'Block',  action: () => handleBlock(msg.id),  danger: true },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <DashTopBar>
        <button
          onClick={() => { setSelected(null); setShowArchived(false); }}
          className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition"
        >
          Messages
        </button>
      </DashTopBar>

      <div className="flex flex-1 overflow-hidden">
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
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
        />
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
