import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CompanyTopBar from '../../components/CompanyTopBar';
import DropdownMenu from '../../components/DropdownMenu';
import EmojiPicker from '../../components/EmojiPicker';
import Toast from '../../components/Toast';
import apiService from '../../services/api';

const LS_KEY = 'jh_company_messages';
const LS_BLOCKED = 'jh_company_blocked';

const INITIAL = [
  { 
    id: 1, 
    seekerId: 1, 
    name: 'Jan Mayer', 
    role: 'Designer Candidate', 
    time: '12 mins ago', 
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 
    color: 'bg-orange-400', 
    unread: true, 
    pinned: false, 
    starred: false, 
    muted: false, 
    archived: false, 
    preview: 'We want to invite you for a quick interview',
    chat: [
      { from: 'me', text: 'Hey Jan, I wanted to reach out because we saw your work contributions and were impressed by your work.', time: '12 mins ago' },
      { from: 'me', text: 'We want to invite you for a quick interview', time: '12 mins ago' },
      { from: 'them', text: 'Hi Maria, sure I would love to. Thanks for taking the time to see my work!', time: '12 mins ago' }
    ]
  },
  { 
    id: 2, 
    seekerId: 2, 
    name: 'Joe Bartmann', 
    role: 'HR Manager Candidate', 
    time: '3:40 PM', 
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 
    color: 'bg-blue-500', 
    unread: false, 
    pinned: false, 
    starred: false, 
    muted: false, 
    archived: false, 
    preview: 'Hey thanks for your interview...',
    chat: [
      { from: 'them', text: 'Hey, thanks for coming in for the interview today. We really enjoyed meeting you!', time: '3:40 PM' },
      { from: 'me', text: 'Thank you Joe! It was a great experience.', time: '3:38 PM' },
      { from: 'them', text: 'We will be in touch by end of week with next steps.', time: '3:40 PM' }
    ]
  },
  { 
    id: 3, 
    seekerId: 3, 
    name: 'Ally Wales', 
    role: 'Recruiter Candidate', 
    time: '3:40 PM', 
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', 
    color: 'bg-green-500', 
    unread: false, 
    pinned: false, 
    starred: false, 
    muted: false, 
    archived: false, 
    preview: 'Hey thanks for your interview...',
    chat: [
      { from: 'them', text: 'Hi! Just wanted to follow up on your application for the Lead Engineer role.', time: '3:40 PM' },
      { from: 'me', text: 'Hi Ally! Yes, I am very excited about the opportunity.', time: '3:35 PM' },
      { from: 'them', text: 'Great! We would love to schedule a technical interview with you.', time: '3:40 PM' }
    ]
  },
  { 
    id: 4, 
    seekerId: 4, 
    name: 'James Gardner', 
    role: 'Manager Candidate', 
    time: '3:40 PM', 
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', 
    color: 'bg-yellow-500', 
    unread: false, 
    pinned: false, 
    starred: false, 
    muted: false, 
    archived: false, 
    preview: 'Hey thanks for your interview...',
    chat: [
      { from: 'them', text: 'Hello! We reviewed your portfolio and are very impressed with your design work.', time: '3:40 PM' },
      { from: 'me', text: 'Thank you James! I put a lot of effort into those projects.', time: '3:30 PM' },
      { from: 'them', text: 'We would like to move forward with a design challenge. Are you available this week?', time: '3:40 PM' }
    ]
  },
  { 
    id: 5, 
    seekerId: 5, 
    name: 'Allison Geidt', 
    role: 'UX Designer', 
    time: '3:40 PM', 
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 
    color: 'bg-blue-600', 
    unread: false, 
    pinned: false, 
    starred: false, 
    muted: false, 
    archived: false, 
    preview: 'Hey thanks for your interview...',
    chat: [
      { from: 'them', text: 'Hi there! Thanks for applying to the Brand Designer position.', time: '3:40 PM' },
      { from: 'me', text: 'Hi Allison! I am really excited about this opportunity.', time: '3:25 PM' },
      { from: 'them', text: 'We would love to set up a call to discuss your experience further.', time: '3:40 PM' }
    ]
  },
  { 
    id: 6, 
    seekerId: 6, 
    name: 'Ruben Culhane', 
    role: 'Frontend Developer', 
    time: '3:40 PM', 
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 
    color: 'bg-purple-500', 
    unread: false, 
    pinned: false, 
    starred: false, 
    muted: false, 
    archived: false, 
    preview: 'Hey thanks for your interview...',
    chat: [
      { from: 'them', text: 'Hey! We saw your GitHub profile and are really impressed with your open source contributions.', time: '3:40 PM' },
      { from: 'me', text: 'Thanks Ruben! I enjoy contributing to open source projects.', time: '3:20 PM' },
      { from: 'them', text: 'We have an Interactive Developer role that would be a perfect fit for you.', time: '3:40 PM' }
    ]
  },
  { 
    id: 7, 
    seekerId: 7, 
    name: 'Lydia Diaz', 
    role: 'Marketing Specialist', 
    time: '3:40 PM', 
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', 
    color: 'bg-red-500', 
    unread: false, 
    pinned: false, 
    starred: false, 
    muted: false, 
    archived: false, 
    preview: 'Hey thanks for your interview...',
    chat: [
      { from: 'them', text: 'Hello! I am reaching out regarding the Email Marketing position.', time: '3:40 PM' },
      { from: 'me', text: 'Hi Lydia! Yes, I applied last week. Very interested in the role.', time: '3:15 PM' },
      { from: 'them', text: 'Wonderful! Can we schedule a quick 30-minute call this week?', time: '3:40 PM' }
    ]
  },
  { 
    id: 8, 
    seekerId: 8, 
    name: 'James Dokidis', 
    role: 'Backend Developer', 
    time: '3:40 PM', 
    avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face', 
    color: 'bg-gray-700', 
    unread: false, 
    pinned: false, 
    starred: false, 
    muted: false, 
    archived: false, 
    preview: 'Hey thanks for your interview...',
    chat: [
      { from: 'them', text: 'Hi! We reviewed your application for the Visual Designer role and loved your portfolio.', time: '3:40 PM' },
      { from: 'me', text: 'Thank you! I spent a lot of time on those case studies.', time: '3:10 PM' },
      { from: 'them', text: 'We would like to invite you for an on-site interview next week.', time: '3:40 PM' }
    ]
  },
  { 
    id: 9, 
    seekerId: 9, 
    name: 'Angelina Swann', 
    role: 'Data Analyst', 
    time: '3:40 PM', 
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face', 
    color: 'bg-pink-500', 
    unread: false, 
    pinned: false, 
    starred: false, 
    muted: false, 
    archived: false, 
    preview: 'Hey thanks for your interview...',
    chat: [
      { from: 'them', text: 'Hey! Thanks for your interest in the Customer Manager role.', time: '3:40 PM' },
      { from: 'me', text: 'Hi Angelina! I am very excited about the possibility of joining.', time: '3:05 PM' },
      { from: 'them', text: 'Great! We will send over a formal interview invitation shortly.', time: '3:40 PM' }
    ]
  }
];

// Helper functions
function loadMsgs() { 
  try { 
    const s = JSON.parse(sessionStorage.getItem(LS_KEY)); 
    return s?.length ? s : INITIAL; 
  } catch { 
    return INITIAL; 
  } 
}

function saveMsgs(d) { 
  sessionStorage.setItem(LS_KEY, JSON.stringify(d)); 
}

function loadBlocked() { 
  try { 
    return JSON.parse(sessionStorage.getItem(LS_BLOCKED)) || []; 
  } catch { 
    return []; 
  } 
}

function saveBlocked(d) { 
  sessionStorage.setItem(LS_BLOCKED, JSON.stringify(d)); 
}

function getAttachmentType(file) {
  if (!file?.type) return 'FILE';
  if (file.type.startsWith('image/')) return 'IMAGE';
  if (file.type.startsWith('video/')) return 'VIDEO';
  return 'FILE';
}

function getAttachmentPreview(attachmentType, fileName) {
  if (attachmentType === 'IMAGE') return `Image: ${fileName}`;
  if (attachmentType === 'VIDEO') return `Video: ${fileName}`;
  return `File: ${fileName}`;
}

function renderChatMessageContent(msg) {
  if (msg.attachmentType === 'IMAGE' && msg.fileUrl) {
    return (
      <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="block">
        <img src={msg.fileUrl} alt={msg.text || 'Image attachment'} className="max-h-56 rounded-xl mb-2 object-cover" />
        <span className="text-xs underline text-blue-600 hover:text-blue-700">{msg.text || 'Open image'}</span>
      </a>
    );
  }

  if (msg.attachmentType === 'VIDEO' && msg.fileUrl) {
    return (
      <div className="space-y-2">
        <video controls src={msg.fileUrl} className="max-h-56 rounded-xl" />
        <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="text-xs underline text-blue-600 hover:text-blue-700">
          {msg.text || 'Open video'}
        </a>
      </div>
    );
  }

  if (msg.fileUrl) {
    return (
      <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm underline text-blue-600 hover:text-blue-700">
        <span>📎</span>
        <span>{msg.text || 'Open attachment'}</span>
      </a>
    );
  }

  return msg.text;
}

export default function CompanyMessages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [msgs, setMsgs] = useState(loadMsgs);
  const [blocked, setBlocked] = useState(loadBlocked);
  const [sel, setSel] = useState(null);
  const [input, setInput] = useState('');
  const [pendingFiles, setPendingFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [toast, setToast] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [search, setSearch] = useState('');
  const chatEndRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => { saveMsgs(msgs); }, [msgs]);
  useEffect(() => { saveBlocked(blocked); }, [blocked]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [sel?.id, sel?.chat?.length]);
  useEffect(() => { if (sel) { const u = msgs.find(m => m.id === sel.id); if (u) setSel(u); } }, [msgs]);

  const update = (id, patch) => setMsgs(p => p.map(m => m.id === id ? { ...m, ...patch } : m));

  const handleSelect = (msg) => {
    setSel(msg);
    setPendingFiles([]);
    if (msg.unread) update(msg.id, { unread: false });
  };

  const handleFileStage = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setPendingFiles(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const removePendingFile = (indexToRemove) => {
    setPendingFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSend = async () => {
    if ((!input.trim() && pendingFiles.length === 0) || !sel || sel.muted) return;
    setSending(true);
    try {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const entries = [];

      if (input.trim()) {
        entries.push({ from: 'me', text: input.trim(), time });
      }

      for (const file of pendingFiles) {
        const uploadRes = await apiService.uploadFile(file);
        const attachmentType = getAttachmentType(file);
        entries.push({
          from: 'me',
          text: uploadRes.fileName || file.name,
          time,
          attachmentType,
          fileUrl: uploadRes.url,
        });
      }

      const lastEntry = entries[entries.length - 1];
      const preview = lastEntry?.fileUrl
        ? getAttachmentPreview(lastEntry.attachmentType, lastEntry.text)
        : lastEntry?.text;

      setMsgs(p => p.map(m => m.id === sel.id
        ? { ...m, chat: [...m.chat, ...entries], preview, time: 'Just now' }
        : m
      ));
      setInput('');
      setPendingFiles([]);
      setShowEmoji(false);
      setToast({ message: pendingFiles.length > 0 ? 'Attachments sent' : 'Message sent', type: 'success' });
    } catch (error) {
      console.error('Failed to send message:', error);
      setToast({ message: error.message || 'Failed to send attachment', type: 'error' });
    } finally {
      setSending(false);
    }
  };
  const handleDelete = (id) => {
    if (!confirm('Delete this conversation? This cannot be undone.')) return;
    setMsgs(p => p.filter(m => m.id !== id));
    if (sel?.id === id) setSel(null);
    setToast({ message: 'Conversation deleted', type: 'success' });
  };

  const handleBlock = (msg) => {
    if (!confirm(`Block ${msg.name}? They will no longer appear in your inbox.`)) return;
    setBlocked(p => [...p, { id: msg.id, seekerId: msg.seekerId, name: msg.name, role: msg.role, avatar: msg.avatar, color: msg.color }]);
    setMsgs(p => p.filter(m => m.id !== msg.id));
    if (sel?.id === msg.id) setSel(null);
    setToast({ message: `${msg.name} blocked`, type: 'success' });
  };

  const menuItems = (msg) => [
    { icon: msg.pinned ? '📌' : '📍', label: msg.pinned ? 'Unpin' : 'Pin', action: () => { update(msg.id, { pinned: !msg.pinned }); setToast({ message: msg.pinned ? 'Unpinned' : 'Pinned', type: 'success' }); } },
    { icon: msg.starred ? '⭐' : '☆', label: msg.starred ? 'Unstar' : 'Star', action: () => { update(msg.id, { starred: !msg.starred }); setToast({ message: msg.starred ? 'Unstarred' : 'Starred', type: 'success' }); } },
    { icon: '👤', label: 'View Profile', action: () => navigate(`/company/seeker/${msg.seekerId}`) },
    'divider',
    { icon: msg.muted ? '🔊' : '🔇', label: msg.muted ? 'Unmute' : 'Mute', action: () => { update(msg.id, { muted: !msg.muted }); setToast({ message: msg.muted ? 'Unmuted' : 'Muted', type: 'success' }); } },
    { icon: msg.archived ? '📤' : '📥', label: msg.archived ? 'Unarchive' : 'Archive', action: () => { update(msg.id, { archived: !msg.archived }); if (sel?.id === msg.id) setSel(null); setToast({ message: msg.archived ? 'Unarchived' : 'Archived', type: 'success' }); } },
    'divider',
    { icon: '🗑️', label: 'Delete', action: () => handleDelete(msg.id), danger: true },
    { icon: '🚫', label: 'Block', action: () => handleBlock(msg), danger: true },
  ];

  const headerMenuItems = (msg) => [
    { icon: '👤', label: 'View Profile', action: () => navigate(`/company/seeker/${msg.seekerId}`) },
    'divider',
    { icon: msg.muted ? '🔊' : '🔇', label: msg.muted ? 'Unmute' : 'Mute', action: () => { update(msg.id, { muted: !msg.muted }); setToast({ message: msg.muted ? 'Unmuted' : 'Muted', type: 'success' }); } },
    { icon: msg.archived ? '📤' : '📥', label: msg.archived ? 'Unarchive' : 'Archive', action: () => { update(msg.id, { archived: !msg.archived }); if (sel?.id === msg.id) setSel(null); setToast({ message: msg.archived ? 'Unarchived' : 'Archived', type: 'success' }); } },
    'divider',
    { icon: '🗑️', label: 'Delete', action: () => handleDelete(msg.id), danger: true },
    { icon: '🚫', label: 'Block', action: () => handleBlock(msg), danger: true },
  ];

  const initials = (user?.fullName || 'MK').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const pool = msgs.filter(m => !blocked.some(b => b.id === m.id) && (showArchived ? m.archived : !m.archived));
  const filtered = pool
    .filter(m => m.name.toLowerCase().includes((search || '').toLowerCase()) || m.role.toLowerCase().includes((search || '').toLowerCase()))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="flex flex-1 overflow-hidden ml-60">
        {/* Messages Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          {/* Top Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">J</span>
                </div>
                <span className="font-bold text-gray-900">JobHuntly</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Post a job
              </button>
            </div>
          </div>

          {/* Messages Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900 mb-4">Messages</h1>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-400 flex-shrink-0">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
                placeholder="Search messages" 
              />
            </div>
            <div className="flex gap-2 mt-3">
              <button 
                onClick={() => setShowArchived(false)}
                className={`flex-1 text-xs py-2 px-3 rounded-lg transition ${!showArchived ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                Inbox ({msgs.filter(m => !m.archived && !blocked.some(b => b.id === m.id)).length})
              </button>
              <button 
                onClick={() => setShowArchived(true)}
                className={`flex-1 text-xs py-2 px-3 rounded-lg transition ${showArchived ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                Archived ({msgs.filter(m => m.archived).length})
              </button>
            </div>
          </div>
          <div className="p-4 border-b border-gray-100 space-y-2">
          <div className="flex-1 overflow-y-auto">
            {filtered.map(msg => (
              <div 
                key={msg.id} 
                onClick={() => handleSelect(msg)}
                className={`group flex items-center gap-3 px-4 py-3.5 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition relative
                  ${sel?.id === msg.id ? 'bg-blue-50 border-l-2 border-l-blue-600' : ''}
                  ${msg.muted ? 'opacity-60' : ''}`}
              >
                {msg.pinned && (
                  <div className="absolute top-2 right-6 text-blue-500">
                    <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 4v6l-2 4h10l-2-4V4M12 14v6M8 4h8"/>
                    </svg>
                  </div>
                )}
                {msg.starred && (
                  <div className="absolute top-2 right-2 text-yellow-400">
                    <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                )}
                <img 
                  src={msg.avatar} 
                  alt={msg.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className={`w-10 h-10 rounded-full ${msg.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 hidden`}>
                  {msg.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className={`text-sm truncate ${msg.unread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                      {msg.name}
                      {msg.muted && <span className="ml-1 text-gray-400 font-normal text-xs">🔇</span>}
                    </p>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                      <p className="text-xs text-gray-400">{msg.time}</p>
                      <div className="relative">
                        <button 
                          onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === msg.id ? null : msg.id); }}
                          className="text-gray-400 hover:text-gray-600 p-0.5 opacity-0 group-hover:opacity-100 transition"
                        >
                          <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="5" cy="12" r="1.5"/>
                            <circle cx="12" cy="12" r="1.5"/>
                            <circle cx="19" cy="12" r="1.5"/>
                          </svg>
                        </button>
                        {openMenu === msg.id && (
                          <div className="absolute right-0 top-6 z-50">
                            <DropdownMenu items={menuItems(msg)} onClose={() => setOpenMenu(null)} position="right" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className={`text-xs truncate ${msg.unread ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                    {msg.preview}
                  </p>
                </div>
                {msg.unread && <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
                No conversations
              </div>
            )}
          </div>
        </div>
        {/* Chat Area */}
        {!sel ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-400">
              <p className="text-5xl mb-3">💬</p>
              <p className="font-medium text-gray-600">Select a conversation</p>
              <p className="text-sm mt-1">Choose from your inbox to start chatting</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col bg-white min-w-0">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <button 
                className="flex items-center gap-3 hover:opacity-80 transition" 
                onClick={() => navigate(`/company/seeker/${sel.seekerId}`)}
              >
                <img 
                  src={sel.avatar} 
                  alt={sel.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className={`w-10 h-10 rounded-full ${sel.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 hidden`}>
                  {sel.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 text-sm">
                    {sel.name}
                    {sel.muted && <span className="ml-1 text-gray-400">🔇</span>}
                  </p>
                  <p className="text-xs text-gray-500">{sel.role}</p>
                </div>
              </button>
              <div className="flex items-center gap-1 text-gray-400">
                <div className="relative">
                  <button 
                    onClick={() => setOpenMenu(openMenu === 'hdr' ? null : 'hdr')} 
                    className="p-1.5 rounded hover:bg-gray-100 transition"
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="5" cy="12" r="1.5"/>
                      <circle cx="12" cy="12" r="1.5"/>
                      <circle cx="19" cy="12" r="1.5"/>
                    </svg>
                  </button>
                  {openMenu === 'hdr' && (
                    <div className="absolute right-0 top-9 z-50">
                      <DropdownMenu items={headerMenuItems(sel)} onClose={() => setOpenMenu(null)} position="right" />
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => navigate(`/company/seeker/${sel.seekerId}`)}
                  className="text-blue-600 text-sm font-semibold hover:underline ml-2"
                >
                  View Profile
                </button>
              </div>
            </div>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              <div className="flex flex-col items-center mb-4">
                <img 
                  src={sel.avatar} 
                  alt={sel.name}
                  className="w-20 h-20 rounded-full object-cover mb-4"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className={`w-20 h-20 rounded-full ${sel.color} flex items-center justify-center text-white text-2xl font-bold mb-4 hidden`}>
                  {sel.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <p className="font-bold text-gray-900 text-lg">{sel.name}</p>
                <p className="text-sm text-gray-500">{sel.role}</p>
                <p className="text-sm text-gray-400 mt-1">
                  This is the very beginning of your direct message with <span className="font-medium text-gray-700">{sel.name}</span>
                </p>
              </div>
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-1 text-xs text-gray-500">
                  <span>∨</span> Today
                </div>
              </div>
              {sel.chat.map((msg, i) => (
                <div key={i} className={`flex items-end gap-3 ${msg.from === 'me' ? 'flex-row-reverse' : ''}`}>
                  {msg.from === 'them' ? (
                    <img 
                      src={sel.avatar} 
                      alt={sel.name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {initials}
                    </div>
                  )}
                  {msg.from === 'them' && (
                    <div className={`w-10 h-10 rounded-full ${sel.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 hidden`}>
                      {sel.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className={`max-w-sm flex flex-col ${msg.from === 'me' ? 'items-end' : 'items-start'}`}>
                    {msg.from === 'me' && <p className="text-xs text-gray-400 mb-1">You</p>}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.from === 'me' 
                        ? 'bg-gray-100 text-gray-800 rounded-br-sm' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}>
                      {renderChatMessageContent(msg)}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{msg.time}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            {/* Input Area */}
            <div className="px-6 py-4 border-t border-gray-200 bg-white flex-shrink-0">
              {sel.muted ? (
                <div className="text-center text-sm text-gray-400 py-2">
                  Conversation is muted — 
                  <button 
                    onClick={() => update(sel.id, { muted: false })} 
                    className="text-blue-600 hover:underline ml-1"
                  >
                    Unmute
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Pending file preview */}
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
                    <input ref={fileRef} type="file" className="hidden" onChange={handleFileStage} accept="image/*,video/*,.pdf,.doc,.docx,.txt" multiple />
                    <button 
                      onClick={() => fileRef.current?.click()} 
                      className="text-gray-400 hover:text-gray-600 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed" 
                      title="Attach file"
                      disabled={sending}
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <input 
                      value={input} 
                      onChange={e => setInput(e.target.value)} 
                      onKeyDown={e => e.key === 'Enter' && !sending && handleSend()}
                      className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
                      placeholder={sending ? 'Sending...' : 'Reply message'} 
                      disabled={sending}
                    />
                    <div className="relative flex-shrink-0">
                      <button 
                        onClick={() => setShowEmoji(v => !v)} 
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" strokeLinecap="round"/>
                        </svg>
                      </button>
                      {showEmoji && (
                        <EmojiPicker 
                          onEmojiSelect={e => setInput(p => p + e)} 
                          onClose={() => setShowEmoji(false)} 
                        />
                      )}
                    </div>
                    <button 
                      onClick={handleSend} 
                      className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-700 flex-shrink-0 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={sending || (!input.trim() && pendingFiles.length === 0)}
                    >
                      <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" strokeLinejoin="round" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
