import { useState } from 'react';
import CompanyTopBar from '../../components/CompanyTopBar';

const contacts = [
  { id: 1, name: 'Jan Mayer', role: 'Recruiter at Nomad', time: '2 mins ago', preview: 'Hey! I wanted to follow up...', avatar: 'JM', color: 'bg-blue-400', unread: true },
  { id: 2, name: 'Jan Alicia', role: 'HR at Udacity', time: '1:00 PM', preview: 'Thanks for your time!', avatar: 'JA', color: 'bg-cyan-400', unread: false },
  { id: 3, name: 'Ally Jones', role: 'Manager at Stripe', time: '3:40 PM', preview: 'We would like to invite you...', avatar: 'AJ', color: 'bg-purple-400', unread: false },
  { id: 4, name: 'Alison Laird', role: 'HR at Coinbase', time: '2:00 PM', preview: 'Hey, thanks for applying!', avatar: 'AL', color: 'bg-green-400', unread: false },
  { id: 5, name: 'James Garfield', role: 'Manager at Stripe', time: '1:00 PM', preview: 'Looking forward to our chat.', avatar: 'JG', color: 'bg-yellow-400', unread: false },
  { id: 6, name: 'Angelina Rovere', role: 'Recruiter at Packer', time: '12:00 PM', preview: 'Send Message', avatar: 'AR', color: 'bg-pink-400', unread: false },
  { id: 7, name: 'Martha Stewart', role: 'HR at Netflix', time: '11:00 AM', preview: 'Please review the application.', avatar: 'MS', color: 'bg-red-400', unread: false },
];

const conversation = [
  { from: 'them', text: 'Hey! I wanted to follow up on the Social Media Manager role.', time: '2 mins ago' },
  { from: 'them', text: 'We would like to schedule an interview. Are you available this week?', time: '1 min ago' },
  { from: 'me', text: 'Hi Jan! Thanks for reaching out. I am very interested and would love to schedule an interview.', time: 'Just now' },
  { from: 'them', text: 'Great! How about Thursday at 2 PM?', time: 'Just now' },
];

export default function CompanyMessages() {
  const [selected, setSelected] = useState(contacts[0]);
  const [input, setInput] = useState('');

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <CompanyTopBar title="Messages" />
      <div className="flex flex-1 overflow-hidden">
        {/* Contact list */}
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-100">
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" placeholder="Search messages..." />
          </div>
          <div className="flex-1 overflow-y-auto">
            {contacts.map(c => (
              <div key={c.id} onClick={() => setSelected(c)}
                className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${selected.id === c.id ? 'bg-blue-50' : ''}`}>
                <div className={`${c.color} text-white rounded-full w-10 h-10 flex items-center justify-center text-xs font-bold flex-shrink-0`}>{c.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                    <p className="text-xs text-gray-400 flex-shrink-0">{c.time}</p>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{c.preview}</p>
                </div>
                {c.unread && <div className="w-2 h-2 bg-blue-600 rounded-full mt-1 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col bg-gray-50">
          <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`${selected.color} text-white rounded-full w-10 h-10 flex items-center justify-center text-xs font-bold`}>{selected.avatar}</div>
              <div>
                <p className="font-semibold text-gray-900">{selected.name}</p>
                <p className="text-xs text-gray-500">{selected.role}</p>
              </div>
            </div>
            <button className="text-blue-600 text-sm border border-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50">View Profile</button>
          </div>
          <div className="flex-1 p-6 space-y-4 overflow-y-auto">
            <p className="text-center text-xs text-gray-400">Today</p>
            {conversation.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-sm px-4 py-2.5 rounded-2xl text-sm ${msg.from === 'me' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                  <p>{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.from === 'me' ? 'text-blue-200' : 'text-gray-400'}`}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white border-t border-gray-200 p-4 flex gap-3">
            <input value={input} onChange={e => setInput(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500" placeholder="Send Message" />
            <button onClick={() => setInput('')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
