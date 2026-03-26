import { useState, useRef, useEffect } from 'react';
import DashTopBar from '../../components/DashTopBar';
import ChatBot from '../../components/ChatBot';
import { useAuth } from '../../context/AuthContext';

const allArticles = [
  {
    id: 1,
    category: 'Getting Started',
    q: 'What is My Applications?',
    a: 'My Applications is a way for you to track jobs as you move through the application process. Depending on the job you applied to, you may also receive notifications indicating that an application has been actioned by an employer.',
    date: '2024-07-24',
  },
  {
    id: 2,
    category: 'Getting Started',
    q: 'How to access my applications history',
    a: 'To access applications history, go to your My Applications page on your dashboard profile. You must be signed in to your JobHuntly account to view this page.',
    date: '2024-07-20',
  },
  {
    id: 3,
    category: 'Getting Started',
    q: 'Not seeing jobs you applied in your my application list?',
    a: "Please note that we are unable to track materials submitted for jobs you apply to via an employer's site. As a result, these applications are not recorded in the My Applications section of your JobHuntly account. We suggest keeping a personal record of all positions you have applied to externally.",
    date: '2024-07-15',
  },
  {
    id: 4,
    category: 'My Profile',
    q: 'How do I update my profile photo?',
    a: 'Go to Settings → My Profile. Under the Profile Photo section, click the dashed upload area or drag and drop an image. Supported formats: SVG, PNG, JPG, GIF (max 400×400px).',
    date: '2024-07-18',
  },
  {
    id: 5,
    category: 'My Profile',
    q: 'How do I add work experience to my profile?',
    a: 'Navigate to My Public Profile from the sidebar. Click the edit icon next to the Experience section and fill in your job title, company, dates, and description. Your profile is visible to recruiters.',
    date: '2024-07-10',
  },
  {
    id: 6,
    category: 'Applying for a job',
    q: 'How do I apply for a job on JobHuntly?',
    a: 'Browse jobs via Find Jobs or Browse Companies. Open a job listing and click the Apply Now button. Fill in the application form and submit. You can track your application status under My Applications.',
    date: '2024-07-22',
  },
  {
    id: 7,
    category: 'Applying for a job',
    q: 'Can I withdraw a job application?',
    a: 'Yes. Go to My Applications, find the application you want to withdraw, click the three-dot menu on the right, and select Remove Application. Note that this action cannot be undone.',
    date: '2024-07-12',
  },
  {
    id: 8,
    category: 'Job Search Tips',
    q: 'How do I find remote jobs?',
    a: 'In Find Jobs, use the Employment Type filter and select Remote. You can combine this with category, level, and salary filters to narrow down results to remote roles that match your skills.',
    date: '2024-07-19',
  },
  {
    id: 9,
    category: 'Job Search Tips',
    q: 'What does each application status mean?',
    a: 'In Review: employer is reviewing your application. Interviewing: you have been selected for an interview. Assessment: a test or challenge is required. Offered: you received a job offer. Hired: you got the job. Unsuitable: not selected this time.',
    date: '2024-07-08',
  },
  {
    id: 10,
    category: 'Job Alerts',
    q: 'How do I set up job alerts?',
    a: 'Job alerts can be configured in Settings → Notifications. Enable the Recommendations toggle to receive personalized job alerts based on your profile, skills, and past applications.',
    date: '2024-07-05',
  },
  {
    id: 11,
    category: 'Job Alerts',
    q: 'How do I stop receiving job alert emails?',
    a: 'Go to Settings → Notifications and toggle off the Recommendations option. You will no longer receive job alert emails. You can re-enable this at any time.',
    date: '2024-07-01',
  },
];

const categories = ['Getting Started', 'My Profile', 'Applying for a job', 'Job Search Tips', 'Job Alerts'];

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-24 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      {message}
    </div>
  );
}

function ContactModal({ onClose }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
        {sent ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Message Sent!</h3>
            <p className="text-sm text-gray-500 mb-5">Our support team will get back to you within 24 hours.</p>
            <button onClick={onClose} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">Close</button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-gray-900">Contact Customer Service</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Your Name</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" placeholder={user?.fullName || 'Your Name'} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Email</label>
                  <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" placeholder="you@email.com" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Subject</label>
                <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 bg-white">
                  <option value="">Select a topic</option>
                  <option>Application issue</option>
                  <option>Account & login</option>
                  <option>Job search help</option>
                  <option>Technical problem</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Message</label>
                <textarea required rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 resize-none"
                  placeholder="Describe your issue in detail..." />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-semibold transition">
                Send Message
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function ArticleMenu({ articleId, onClose, onCopyLink, onReport }) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute right-0 top-7 z-20 bg-white border border-gray-200 rounded-xl shadow-lg w-44 py-1 text-sm">
      <button onClick={onCopyLink} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Copy link
      </button>
      <button onClick={() => { navigator.share?.({ title: 'JobHuntly Help', url: window.location.href }); onClose(); }}
        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share article
      </button>
      <div className="border-t border-gray-100 my-1" />
      <button onClick={onReport} className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-500 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        Report issue
      </button>
    </div>
  );
}

export default function HelpCenter() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Getting Started');
  const [sort, setSort] = useState('Most relevant');
  const [helpful, setHelpful] = useState({});
  const [openMenu, setOpenMenu] = useState(null);
  const [showContact, setShowContact] = useState(false);
  const [toast, setToast] = useState(null);
  const [reported, setReported] = useState({});

  const showToast = (msg) => setToast(msg);

  // Filter: search overrides category
  const filtered = (() => {
    let list = search
      ? allArticles.filter(a =>
          a.q.toLowerCase().includes(search.toLowerCase()) ||
          a.a.toLowerCase().includes(search.toLowerCase())
        )
      : allArticles.filter(a => a.category === activeCategory);

    if (sort === 'Newest') list = [...list].sort((a, b) => b.date.localeCompare(a.date));
    else if (sort === 'Oldest') list = [...list].sort((a, b) => a.date.localeCompare(b.date));
    return list;
  })();

  const handleHelpful = (id, val) => {
    if (helpful[id]) return; // already voted
    setHelpful(h => ({ ...h, [id]: val }));
    showToast(val === 'yes' ? 'Thanks for your feedback! 👍' : 'Thanks! We\'ll work on improving this article.');
  };

  const handleCopyLink = (id) => {
    navigator.clipboard.writeText(`${window.location.origin}/dashboard/help#article-${id}`);
    showToast('Link copied to clipboard!');
    setOpenMenu(null);
  };

  const handleReport = (id) => {
    setReported(r => ({ ...r, [id]: true }));
    showToast('Article reported. Thank you for the feedback.');
    setOpenMenu(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <DashTopBar title="Help Center" />
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-72 flex-shrink-0 border-r border-gray-200 px-6 py-8 flex flex-col gap-6 overflow-y-auto">
          {/* Search */}
          <div>
            <p className="text-sm text-gray-500 mb-3">Type your question or search keyword</p>
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
              </svg>
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); }}
                className="w-full border border-gray-300 rounded-lg pl-9 pr-8 py-2 text-sm outline-none focus:border-indigo-500"
                placeholder="Search"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 text-base leading-none">✕</button>
              )}
            </div>
            {search && (
              <p className="text-xs text-gray-400 mt-2">{filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"</p>
            )}
          </div>

          {/* Categories */}
          <nav className="space-y-0.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setSearch(''); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition border-b border-gray-100 last:border-0 ${
                  activeCategory === cat && !search
                    ? 'text-indigo-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>

          {/* Contact card */}
          <div className="mt-auto bg-indigo-600 rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-500 rounded-full opacity-50" />
            <div className="absolute -bottom-8 right-8 w-16 h-16 bg-indigo-400 rounded-full opacity-40" />
            <p className="font-bold text-base leading-snug mb-1 relative z-10">Didn't find what you were looking for?</p>
            <p className="text-indigo-200 text-xs mb-4 relative z-10">Contact our customer service</p>
            <button
              onClick={() => setShowContact(true)}
              className="bg-white text-indigo-600 text-sm font-semibold px-5 py-2 rounded-lg hover:bg-indigo-50 relative z-10 transition"
            >
              Contact Us
            </button>
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1 px-8 py-8 overflow-y-auto">
          {/* Sort bar */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-gray-500">Sort by:</span>
            <div className="relative">
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="text-sm font-semibold text-gray-800 border-none outline-none bg-transparent pr-5 cursor-pointer appearance-none"
              >
                <option>Most relevant</option>
                <option>Newest</option>
                <option>Oldest</option>
              </select>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-600 absolute right-0 top-1 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Articles */}
          <div className="space-y-4">
            {filtered.map((article) => (
              <div key={article.id} id={`article-${article.id}`} className={`border rounded-xl p-6 transition ${reported[article.id] ? 'border-red-200 bg-red-50/30' : 'border-gray-200'}`}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900 text-base pr-4">{article.q}</h3>
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setOpenMenu(openMenu === article.id ? null : article.id)}
                      className="text-gray-400 hover:text-gray-700 text-lg leading-none px-1 py-0.5 rounded hover:bg-gray-100 transition"
                    >
                      •••
                    </button>
                    {openMenu === article.id && (
                      <ArticleMenu
                        articleId={article.id}
                        onClose={() => setOpenMenu(null)}
                        onCopyLink={() => handleCopyLink(article.id)}
                        onReport={() => handleReport(article.id)}
                      />
                    )}
                  </div>
                </div>

                {reported[article.id] && (
                  <p className="text-xs text-red-500 mb-2">⚠ You reported an issue with this article.</p>
                )}

                <p className="text-sm text-gray-500 leading-relaxed mb-5">{article.a}</p>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Was this article helpful?</span>
                  {helpful[article.id] ? (
                    <span className={`text-xs font-medium px-3 py-1.5 rounded-lg ${helpful[article.id] === 'yes' ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-500'}`}>
                      {helpful[article.id] === 'yes' ? '👍 Marked as helpful' : '👎 Feedback noted'}
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleHelpful(article.id, 'yes')}
                        className="flex items-center gap-1.5 border border-gray-300 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg px-3 py-1.5 text-sm transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        Yes
                      </button>
                      <button
                        onClick={() => handleHelpful(article.id, 'no')}
                        className="flex items-center gap-1.5 border border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg px-3 py-1.5 text-sm transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                        </svg>
                        No
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-400 text-sm mb-3">No articles found for "{search}"</p>
                <button onClick={() => { setSearch(''); setShowContact(true); }}
                  className="text-indigo-600 text-sm hover:underline">
                  Contact support instead →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <ChatBot />
    </div>
  );
}
