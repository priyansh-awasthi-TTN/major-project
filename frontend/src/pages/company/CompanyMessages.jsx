import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CompanyTopBar from '../../components/CompanyTopBar';
import DropdownMenu from '../../components/DropdownMenu';
import EmojiPicker from '../../components/EmojiPicker';
import Toast from '../../components/Toast';

const LS_KEY = 'jh_company_messages';
const LS_BLOCKED = 'jh_company_blocked';

const INITIAL = [
  { 
    id: 1, 
    seekerId: 1, 
    name: 'Jan Mayer', 
    role: 'Designer Candidate', 
    time: '12 mins ago', 
    avatar: 'JM', 
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
    avatar: 'JB', 
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
    avatar: 'AW', 
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
    avatar: 'JG', 
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
    avatar: 'AG', 
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
    avatar: 'RC', 
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
    avatar: 'LD', 
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
    avatar: 'JD', 
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
    avatar: 'AS', 
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
export default function CompanyMessages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [msgs, setMsgs] = useState(loadMsgs);
  const [blocked, setBlocked] = useState(loadBlocked);
  const [sel, setSel] = useState(null);
  const [input, setInput] = useState('');
  const [pendingFile, setPendingFile] = useState(null);
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
    setPendingFile(null);
    if (msg.unread) update(msg.id, { unread: false });
  };

  const handleFileStage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPendingFile(file);
    e.target.value = '';
  };

  const handleSend = () => {
    if ((!input.trim() && !pendingFile) || !sel || sel.muted) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const entries = [];
    if (input.trim()) entries.push({ from: 'me', text: input.trim(), time });
    if (pendingFile) entries.push({ from: 'me', text: `📎 ${pendingFile.name}`, time });
    const lastEntry = entries[entries.length - 1];
    setMsgs(p => p.map(m => m.id === sel.id
      ? { ...m, chat: [...m.chat, ...entries], preview: lastEntry.text, time: 'Just now' }
      : m
    ));
    setInput('');
    setPendingFile(null);
    setShowEmoji(false);
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
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      <CompanyTopBar title="Messages" />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-200 flex flex-col bg-white flex-shrink-0">
          <div className="p-4 border-b border-gray-100 space-y-2">
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-400 flex-shrink-0">
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
            <div className="flex gap-2">
              <button 
                onClick={() => setShowArchived(false)}
                className={`flex-1 text-xs py-1.5 rounded-lg transition ${!showArchived ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                Inbox ({msgs.filter(m => !m.archived && !blocked.some(b => b.id === m.id)).length})
              </button>
              <button 
                onClick={() => setShowArchived(true)}
                className={`flex-1 text-xs py-1.5 rounded-lg transition ${showArchived ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                Archived ({msgs.filter(m => m.archived).length})
              </button>
            </div>
          </div>

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
                <div className={`w-10 h-10 rounded-full ${msg.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {msg.avatar}
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
                <div className={`w-10 h-10 rounded-full ${sel.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {sel.avatar}
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
                <div className={`w-16 h-16 rounded-full ${sel.color} flex items-center justify-center text-white text-xl font-bold mb-3`}>
                  {sel.avatar}
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
                    <div className={`w-8 h-8 rounded-full ${sel.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {sel.avatar}
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 text-xs font-bold flex-shrink-0">
                      {initials}
                    </div>
                  )}
                  <div className={`max-w-sm flex flex-col ${msg.from === 'me' ? 'items-end' : 'items-start'}`}>
                    {msg.from === 'me' && <p className="text-xs text-gray-400 mb-1">You</p>}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.from === 'me' 
                        ? 'bg-gray-100 text-gray-800 rounded-br-sm' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}>
                      {msg.text}
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
                  {pendingFile && (
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-700">
                      <span>📎</span>
                      <span className="flex-1 truncate">{pendingFile.name}</span>
                      <button 
                        onClick={() => setPendingFile(null)} 
                        className="text-blue-400 hover:text-blue-700 text-lg leading-none"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 relative">
                    <input ref={fileRef} type="file" className="hidden" onChange={handleFileStage} />
                    <button 
                      onClick={() => fileRef.current?.click()} 
                      className="text-gray-400 hover:text-gray-600 flex-shrink-0" 
                      title="Attach file"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <input 
                      value={input} 
                      onChange={e => setInput(e.target.value)} 
                      onKeyDown={e => e.key === 'Enter' && handleSend()}
                      className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
                      placeholder="Reply message" 
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
                      className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-700 flex-shrink-0 transition"
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}