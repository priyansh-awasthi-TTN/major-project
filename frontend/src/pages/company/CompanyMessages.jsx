import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashTopBar from '../../components/DashTopBar';

const messages = [
  {
    id: 1,
    name: 'Jan Mayer',
    role: 'Designer Candidate',
    time: '12 mins ago',
    preview: 'We want to invite you for a quick interview',
    avatar: 'JM',
    avatarColor: 'bg-gray-500',
    unread: true,
    chat: [
      { from: 'them', text: 'Hey Jan, I wanted to reach out because we saw your work contributions and were impressed by your work.', time: '12 mins ago' },
      { from: 'them', text: 'We want to invite you for a quick interview', time: '12 mins ago' },
      { from: 'me', text: 'Hi Maria, sure I would love to. Thanks for taking the time to see my work!', time: '12 mins ago' }
    ]
  },
  {
    id: 2,
    name: 'Joe Bartmann',
    role: 'Developer',
    time: '3:40 PM',
    preview: 'Hey thanks for your interview yesterday...',
    avatar: 'JB',
    avatarColor: 'bg-blue-400',
    unread: false,
    chat: [
      { from: 'me', text: 'Thank you for the interview yesterday, Joe. I really enjoyed our discussion about the development role.', time: '4:15 PM' },
      { from: 'them', text: 'Hey thanks for your interview yesterday, looking forward to working together', time: '3:40 PM' },
      { from: 'them', text: 'Your technical skills and problem-solving approach really impressed the team.', time: '3:41 PM' }
    ]
  },
  {
    id: 3,
    name: 'Ally Wales',
    role: 'Designer',
    time: '3:40 PM',
    preview: 'Hey thanks for your interview yesterday...',
    avatar: 'AW',
    avatarColor: 'bg-yellow-400',
    unread: false,
    chat: [
      { from: 'them', text: 'Hey thanks for your interview yesterday, the team was really impressed', time: '3:40 PM' },
      { from: 'them', text: 'Your design portfolio showcases excellent creativity and attention to detail.', time: '3:42 PM' },
      { from: 'me', text: 'Thank you so much! I put a lot of effort into those projects. When can we discuss next steps?', time: '3:45 PM' }
    ]
  },
  {
    id: 4,
    name: 'James Gardner',
    role: 'Product Manager',
    time: '3:40 PM',
    preview: 'Hey thanks for your interview yesterday...',
    avatar: 'JG',
    avatarColor: 'bg-purple-400',
    unread: false,
    chat: [
      { from: 'me', text: 'Hi James, following up on our conversation about the Product Manager position.', time: '4:00 PM' },
      { from: 'them', text: 'Hey thanks for your interview yesterday, we would like to move forward', time: '3:40 PM' },
      { from: 'them', text: 'Your product strategy insights were exactly what we are looking for.', time: '3:43 PM' }
    ]
  },
  {
    id: 5,
    name: 'Allison Geidt',
    role: 'UX Designer',
    time: '3:40 PM',
    preview: 'Hey thanks for your interview yesterday...',
    avatar: 'AG',
    avatarColor: 'bg-pink-400',
    unread: false,
    chat: [
      { from: 'them', text: 'Hey thanks for your interview yesterday, your design skills are amazing', time: '3:40 PM' },
      { from: 'me', text: 'Thank you! I am passionate about creating user-centered designs.', time: '3:50 PM' },
      { from: 'them', text: 'We would love to have you join our UX team. Are you available for a final call this week?', time: '3:52 PM' }
    ]
  },
  {
    id: 6,
    name: 'Ruben Culhane',
    role: 'Frontend Developer',
    time: '3:40 PM',
    preview: 'Hey thanks for your interview yesterday...',
    avatar: 'RC',
    avatarColor: 'bg-green-400',
    unread: false,
    chat: [
      { from: 'them', text: 'Hey thanks for your interview yesterday, your technical knowledge is impressive', time: '3:40 PM' },
      { from: 'them', text: 'Your React and Node.js experience is exactly what our frontend team needs.', time: '3:44 PM' },
      { from: 'me', text: 'I am excited about the opportunity to contribute to your projects!', time: '3:55 PM' }
    ]
  },
  {
    id: 7,
    name: 'Lydia Diaz',
    role: 'Marketing Specialist',
    time: '3:40 PM',
    preview: 'Hey thanks for your interview yesterday...',
    avatar: 'LD',
    avatarColor: 'bg-red-400',
    unread: false,
    chat: [
      { from: 'me', text: 'Hi Lydia, thank you for taking the time to interview me for the Marketing Specialist role.', time: '4:10 PM' },
      { from: 'them', text: 'Hey thanks for your interview yesterday, we loved your marketing strategies', time: '3:40 PM' },
      { from: 'them', text: 'Your campaign ideas for social media engagement were brilliant.', time: '3:45 PM' }
    ]
  },
  {
    id: 8,
    name: 'James Dokidis',
    role: 'Backend Developer',
    time: '3:40 PM',
    preview: 'Hey thanks for your interview yesterday...',
    avatar: 'JD',
    avatarColor: 'bg-indigo-400',
    unread: false,
    chat: [
      { from: 'them', text: 'Hey thanks for your interview yesterday, your backend architecture ideas were great', time: '3:40 PM' },
      { from: 'me', text: 'Thank you! I enjoy working on scalable backend systems.', time: '4:00 PM' },
      { from: 'them', text: 'Your experience with microservices and cloud deployment is impressive.', time: '3:46 PM' }
    ]
  },
  {
    id: 9,
    name: 'Angelina Swann',
    role: 'Data Analyst',
    time: '3:40 PM',
    preview: 'Hey thanks for your interview yesterday...',
    avatar: 'AS',
    avatarColor: 'bg-cyan-400',
    unread: false,
    chat: [
      { from: 'them', text: 'Hey thanks for your interview yesterday, your data analysis skills are outstanding', time: '3:40 PM' },
      { from: 'them', text: 'The way you explained your approach to data visualization was very insightful.', time: '3:47 PM' },
      { from: 'me', text: 'I believe data should tell a story. Looking forward to contributing to your analytics team.', time: '4:05 PM' }
    ]
  }
];

export default function CompanyMessages() {
  const [selected, setSelected] = useState(null);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  const filtered = messages.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = () => {
    if (input.trim()) setInput('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <DashTopBar title="Messages" />

      <div className="flex flex-1 overflow-hidden">
        {/* Inbox list */}
        <div className="w-80 border-r border-gray-200 flex flex-col bg-white flex-shrink-0">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
              <span className="text-gray-400 text-sm">🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
                placeholder="Search messages"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.map(msg => (
              <div
                key={msg.id}
                onClick={() => setSelected(msg)}
                className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition ${selected?.id === msg.id ? 'bg-blue-50 border-l-2 border-l-blue-600' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full ${msg.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {msg.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className="text-sm font-semibold text-gray-900 truncate">{msg.name}</p>
                    <p className="text-xs text-gray-400 flex-shrink-0 ml-2">{msg.time}</p>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{msg.preview}</p>
                </div>
                {msg.unread && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        {!selected ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-400">
              <p className="text-5xl mb-3">💬</p>
              <p className="font-medium text-gray-600">Select a conversation</p>
              <p className="text-sm mt-1">Choose from your inbox to start chatting</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col bg-white">
            {/* Chat header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${selected.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {selected.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selected.name}</p>
                  <p className="text-xs text-gray-500">{selected.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <button className="hover:text-gray-600 p-1" title="Pin">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M9 4v6l-2 4h10l-2-4V4M12 14v6M8 4h8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="hover:text-yellow-500 p-1" title="Star">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="hover:text-gray-600 p-1" title="More options">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {/* Conversation start banner */}
              <div className="flex flex-col items-center mb-6">
                <div className={`w-16 h-16 rounded-full ${selected.avatarColor} flex items-center justify-center text-white text-xl font-bold mb-3`}>
                  {selected.avatar}
                </div>
                <p className="font-bold text-gray-900 text-lg">{selected.name}</p>
                <p className="text-sm text-gray-500">{selected.role}</p>
                <p className="text-sm text-gray-400 mt-1">
                  This is the very beginning of your direct message with <span className="font-medium text-gray-700">{selected.name}</span>
                </p>
              </div>

              {/* Date divider */}
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-1 text-xs text-gray-500">
                  <span>∨</span> Today
                </div>
              </div>

              {/* Chat bubbles */}
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
                  <div className={`max-w-sm ${msg.from === 'me' ? 'items-end' : 'items-start'} flex flex-col`}>
                    {msg.from === 'me' && <p className="text-xs text-gray-400 mb-1 text-right">You</p>}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.from === 'me'
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}>
                      {msg.text}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50">
                <button className="text-gray-400 hover:text-gray-600 flex-shrink-0">📎</button>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
                  placeholder="Reply message"
                />
                <button className="text-gray-400 hover:text-gray-600 flex-shrink-0">😊</button>
                <button
                  onClick={handleSend}
                  className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-700 flex-shrink-0"
                >
                  <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" strokeLinejoin="round" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}