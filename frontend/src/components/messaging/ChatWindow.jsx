import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DropdownMenu from '../DropdownMenu';
import EmojiPicker from '../EmojiPicker';
import Toast from '../Toast';

function renderAttachment(message, isOwnMessage) {
  const linkClass = isOwnMessage ? 'text-blue-100 hover:text-white' : 'text-blue-600 hover:text-blue-700';

  if (message.messageType === 'IMAGE' && message.fileUrl) {
    return (
      <a href={message.fileUrl} target="_blank" rel="noreferrer" className="block">
        <img src={message.fileUrl} alt={message.text || 'Image attachment'} className="max-h-56 rounded-xl mb-2 object-cover" />
        <span className={`text-xs underline ${linkClass}`}>{message.text || 'Open image'}</span>
      </a>
    );
  }

  if (message.messageType === 'VIDEO' && message.fileUrl) {
    return (
      <div className="space-y-2">
        <video controls src={message.fileUrl} className="max-h-56 rounded-xl" />
        <a href={message.fileUrl} target="_blank" rel="noreferrer" className={`text-xs underline ${linkClass}`}>
          {message.text || 'Open video'}
        </a>
      </div>
    );
  }

  if (message.fileUrl) {
    return (
      <a href={message.fileUrl} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-2 text-sm underline ${linkClass}`}>
        <span>📎</span>
        <span>{message.text || 'Open attachment'}</span>
      </a>
    );
  }

  return message.text;
}

export default function ChatWindow({ selected, onTogglePin, onToggleStar, onToggleMute, onToggleArchive, onBlock, onDelete, onSend, onSendAttachment, openMenu, setOpenMenu }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [pendingFiles, setPendingFiles] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [toast, setToast] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selected?.chat]);

  useEffect(() => {
    setInput('');
    setPendingFiles([]);
    setShowEmoji(false);
  }, [selected?.id]);

  if (!selected) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-400">
          <p className="text-5xl mb-3">💬</p>
          <p className="font-medium text-gray-600">Select a conversation</p>
          <p className="text-sm mt-1">Choose from your inbox to start chatting</p>
        </div>
      </div>
    );
  }

  const handleSend = async () => {
    if ((!input.trim() && pendingFiles.length === 0) || sending) return;

    setSending(true);
    try {
      if (input.trim()) {
        onSend(selected.id, input.trim());
      }
      for (const file of pendingFiles) {
        await onSendAttachment(selected.id, file);
      }
      setInput('');
      setPendingFiles([]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setToast({ message: error.message || 'Failed to send message', type: 'error' });
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';

    if (files.length === 0 || sending || typeof onSendAttachment !== 'function') return;
    setPendingFiles(prev => [...prev, ...files]);
  };

  const removePendingFile = (indexToRemove) => {
    setPendingFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const headerMenu = [
    { icon: '👤', label: 'View Profile', action: () => navigate(`/dashboard/profile/${selected.id}`) },
    'divider',
    { icon: selected.isMuted ? '🔊' : '🔇', label: selected.isMuted ? 'Unmute' : 'Mute', action: () => onToggleMute(selected.id) },
    { icon: selected.isArchived ? '📤' : '📥', label: selected.isArchived ? 'Unarchive' : 'Archive', action: () => onToggleArchive(selected.id) },
    'divider',
    { icon: '🗑️', label: 'Delete', action: () => onDelete(selected.id), danger: true },
    { icon: '🚫', label: 'Block',  action: () => onBlock(selected.id),  danger: true },
  ];

  return (
    <div className="flex-1 flex flex-col bg-white min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <div
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
          onClick={() => navigate(`/dashboard/profile/${selected.id}`)}
        >
          <div className={`w-10 h-10 rounded-full ${selected.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
            {selected.avatar}
          </div>
          <div>
            <p className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
              {selected.name}
              {selected.isMuted  && <span className="text-gray-400">🔇</span>}
              {selected.isPinned && <span className="text-blue-500">📌</span>}
              {selected.isStarred && <span className="text-yellow-400">⭐</span>}
            </p>
            <p className="text-xs text-gray-500">{selected.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-400">
          <button
            onClick={() => onTogglePin(selected.id)}
            className={`p-1.5 rounded hover:bg-gray-100 transition ${selected.isPinned ? 'text-blue-500' : ''}`}
            title={selected.isPinned ? 'Unpin' : 'Pin'}
          >
            <svg width="17" height="17" fill={selected.isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M9 4v6l-2 4h10l-2-4V4M12 14v6M8 4h8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={() => onToggleStar(selected.id)}
            className={`p-1.5 rounded hover:bg-gray-100 transition ${selected.isStarred ? 'text-yellow-400' : ''}`}
            title={selected.isStarred ? 'Unstar' : 'Star'}
          >
            <svg width="17" height="17" fill={selected.isStarred ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="relative">
            <button
              onClick={() => setOpenMenu(openMenu === 'header' ? null : 'header')}
              className="p-1.5 rounded hover:bg-gray-100 transition"
            >
              <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
              </svg>
            </button>
            {openMenu === 'header' && (
              <div className="absolute right-0 top-9 z-50">
                <DropdownMenu items={headerMenu} onClose={() => setOpenMenu(null)} position="right" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {/* Banner */}
        <div className="flex flex-col items-center mb-4">
          <div className={`w-16 h-16 rounded-full ${selected.avatarColor} flex items-center justify-center text-white text-xl font-bold mb-3`}>
            {selected.avatar}
          </div>
          <p className="font-bold text-gray-900 text-lg">{selected.name}</p>
          <p className="text-sm text-gray-500">
            {selected.role.split(' at ')[0]} at{' '}
            <span className="text-blue-600">{selected.company}</span>
          </p>
          <p className="text-sm text-gray-400 mt-1">
            This is the very beginning of your direct message with{' '}
            <span className="font-medium text-gray-700">{selected.name}</span>
          </p>
        </div>

        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-1 text-xs text-gray-500">
            <span>∨</span> Today
          </div>
        </div>

        {selected.chat.map((msg, i) => (
          <div key={i} className={`flex items-end gap-3 ${msg.from === 'me' ? 'flex-row-reverse' : ''}`}>
            {msg.from === 'them' ? (
              <div className={`w-8 h-8 rounded-full ${selected.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                {selected.avatar}
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {(user?.fullName || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className={`max-w-sm flex flex-col ${msg.from === 'me' ? 'items-end' : 'items-start'}`}>
              {msg.from === 'me' && <p className="text-xs text-gray-400 mb-1">You</p>}
              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.from === 'me'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}>
                {renderAttachment(msg, msg.from === 'me')}
              </div>
              <p className="text-xs text-gray-400 mt-1">{msg.time}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-200 bg-white flex-shrink-0">
        {selected.isMuted ? (
          <div className="flex items-center justify-center py-2 text-sm text-gray-400">
            Conversation is muted — you cannot send messages
          </div>
        ) : (
          <div className="space-y-2">
            {pendingFiles.map((file, index) => (
              <div key={`${file.name}-${file.size}-${index}`} className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-700">
                <span>📎</span>
                <span className="flex-1 truncate">{file.name}</span>
                <button
                  onClick={() => removePendingFile(index)}
                  className="text-blue-400 hover:text-blue-700 text-lg leading-none"
                  disabled={sending}
                >
                  ×
                </button>
              </div>
            ))}
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 relative">
              <input type="file" onChange={handleFileUpload} className="hidden" id="chat-file-upload" accept="image/*,video/*,.pdf,.doc,.docx,.txt" multiple />
              <label htmlFor="chat-file-upload" className={`cursor-pointer flex-shrink-0 ${sending ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                {sending ? '⏳' : '📎'}
              </label>

              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !sending && handleSend()}
                className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
                placeholder={sending ? 'Sending...' : 'Reply message'}
                disabled={sending}
              />

              <div className="relative flex-shrink-0">
                <button onClick={() => setShowEmoji(v => !v)} className="text-gray-400 hover:text-gray-600">😊</button>
                {showEmoji && (
                  <EmojiPicker
                    onEmojiSelect={emoji => setInput(prev => prev + emoji)}
                    onClose={() => setShowEmoji(false)}
                  />
                )}
              </div>

              <button
                onClick={handleSend}
                disabled={sending || (!input.trim() && pendingFiles.length === 0)}
                className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-700 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" strokeLinejoin="round" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
