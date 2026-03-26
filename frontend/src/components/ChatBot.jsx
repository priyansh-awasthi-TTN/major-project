import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const BOT_NAME = 'JobHuntly Assistant';

function getBotReply(input) {
  const msg = input.toLowerCase().trim();

  if (msg.match(/\b(hi|hello|hey|howdy)\b/)) {
    return "Hi there! 👋 I'm your JobHuntly assistant. I can help you find jobs, check application status, learn about companies, or answer any job search questions. What can I help you with?";
  }
  if (msg.match(/find|search|look.*job|job.*search|browse job/)) {
    return "To find jobs, head to **Find Jobs** in the sidebar. You can filter by employment type (Full-Time, Part-Time, Remote), job category, experience level, and salary range. Want tips on narrowing your search?";
  }
  if (msg.match(/appli(cation|ed|cations)|my appli|track/)) {
    return "You can track all your applications under **My Applications**. Each application shows its current status — In Review, Interviewing, Assessment, Offered, or Hired. Click any row to see detailed info and notes.";
  }
  if (msg.match(/status|in review|interview(ing)?|shortlist|offered|hired|declined|unsuitable/)) {
    return "Here's what each status means:\n• **In Review** — Employer is reviewing your application\n• **Interviewing** — You've been selected for an interview\n• **Assessment** — There's a test or challenge to complete\n• **Offered** — You received a job offer 🎉\n• **Hired** — Congratulations, you got the job!\n• **Unsuitable** — Not selected this time";
  }
  if (msg.match(/compan(y|ies)|browse compan/)) {
    return "You can browse companies under **Browse Companies**. Filter by industry, company size, or search by name. Click any company to see their open roles, team, and culture info.";
  }
  if (msg.match(/profile|resume|cv|portfolio/)) {
    return "Your profile is under **My Public Profile**. Keep it updated with your experience, education, skills, and portfolio links — recruiters use it to evaluate you before reaching out.";
  }
  if (msg.match(/message|chat|recruiter|contact/)) {
    return "You can message recruiters directly from the **Messages** section. Once a recruiter reaches out or you apply to a job, a conversation thread will appear there.";
  }
  if (msg.match(/interview|schedule|calendar/)) {
    return "Interview details appear in your application drawer — click any application with 'Interviewing' status to see the date, time, interviewer name, and round info. You can also add it to your calendar from there.";
  }
  if (msg.match(/offer|salary|negotiat/)) {
    return "When you receive an offer, it shows up under **My Applications** with 'Offered' status. You can Accept, Decline, or Negotiate directly from the application detail panel. Don't forget to check the offer expiry date!";
  }
  if (msg.match(/follow.?up|remind|7 day/)) {
    return "You can request a follow-up 7 days after applying if your status is still 'In Review'. Only one follow-up is allowed per job. Look for the **Request Follow-up** button in the application detail panel.";
  }
  if (msg.match(/setting|password|email|account/)) {
    return "Go to **Settings** to update your profile photo, personal details, email, password, and account type (Job Seeker or Employer). Changes are saved immediately.";
  }
  if (msg.match(/help|support|problem|issue|stuck/)) {
    return "The **Help Center** has articles on common topics like using My Applications, profile setup, and job search tips. If you still need help, use the **Contact Us** button there to reach our support team.";
  }
  if (msg.match(/notif(y|ication)/)) {
    return "Notification preferences can be managed in **Settings → Notifications**. You can toggle alerts for application updates and personalized job recommendations.";
  }
  if (msg.match(/tip|advice|how to|best way|improve/)) {
    return "Here are some quick job search tips:\n• Complete your profile 100% — recruiters filter by it\n• Apply early — jobs fill fast\n• Tailor your application to each role\n• Follow up after 7 days if no response\n• Keep your portfolio and skills section updated";
  }
  if (msg.match(/logout|sign out|exit/)) {
    return "You can log out using the **Logout** button at the bottom of the sidebar. Your session will end and you'll be redirected to the login page.";
  }
  if (msg.match(/thank|thanks|great|awesome|perfect/)) {
    return "You're welcome! 😊 Feel free to ask anything else. Good luck with your job search!";
  }
  if (msg.match(/bye|goodbye|see you|cya/)) {
    return "Goodbye! Best of luck with your applications. Come back anytime you need help! 👋";
  }

  return "I'm not sure about that one. Try asking me about:\n• Finding jobs\n• Application status\n• Interview tips\n• Company search\n• Profile & settings\n• Messages & follow-ups";
}

function Message({ msg }) {
  const isBot = msg.role === 'bot';
  return (
    <div className={`flex gap-2 ${isBot ? '' : 'flex-row-reverse'}`}>
      {isBot && (
        <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
          </svg>
        </div>
      )}
      <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
        isBot
          ? 'bg-gray-100 text-gray-800 rounded-tl-sm'
          : 'bg-gray-900 text-white rounded-tr-sm'
      }`}>
        {msg.text}
      </div>
    </div>
  );
}

export default function ChatBot() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: `Hi${user?.fullName ? ' ' + user.fullName.split(' ')[0] : ''}! 👋 I'm your JobHuntly assistant. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { role: 'bot', text: getBotReply(text) }]);
    }, 700);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const quickReplies = ['Find jobs', 'My applications', 'Interview tips', 'Contact support'];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-gray-900 hover:bg-gray-700 text-white rounded-full shadow-lg flex items-center justify-center transition"
        aria-label="Open chat"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
          </svg>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-22 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ height: '460px', bottom: '80px' }}>
          {/* Header */}
          <div className="bg-gray-900 px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-semibold">{BOT_NAME}</p>
              <p className="text-gray-400 text-xs">Always here to help</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => <Message key={i} msg={msg} />)}
            {typing && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
                  </svg>
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
            {quickReplies.map(q => (
              <button key={q} onClick={() => { setInput(q); }}
                className="text-xs border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full hover:bg-gray-50 hover:border-gray-300 transition">
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 pb-3">
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-gray-400 transition">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Type a message..."
                className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
              />
              <button onClick={send} disabled={!input.trim()}
                className="w-7 h-7 bg-gray-900 disabled:bg-gray-300 text-white rounded-lg flex items-center justify-center transition flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
