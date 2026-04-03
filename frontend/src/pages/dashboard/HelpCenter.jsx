import { useEffect, useMemo, useRef, useState } from 'react';
import DashTopBar from '../../components/DashTopBar';
import ChatBot from '../../components/ChatBot';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';

const FALLBACK_ARTICLES = [
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

function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-24 right-6 z-50 flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm text-white shadow-lg">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      {message}
    </div>
  );
}

function ContactModal({ user, onClose, onSent, onToast }) {
  const [form, setForm] = useState({
    name: user?.fullName || '',
    email: user?.email || '',
    subject: '',
    message: '',
  });
  const [sentTicket, setSentTicket] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm({
      name: user?.fullName || '',
      email: user?.email || '',
      subject: '',
      message: '',
    });
    setSentTicket(null);
    setSubmitting(false);
    setError('');
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const ticket = await apiService.createHelpSupportTicket(form);
      setSentTicket(ticket);
      onSent?.(ticket);
    } catch (submitError) {
      setError(submitError.message || 'Failed to send your message.');
      onToast?.(submitError.message || 'Failed to send your message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        {sentTicket ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-900">Message Sent!</h3>
            <p className="mb-2 text-sm text-gray-500">Our support team will get back to you within 24 hours.</p>
            <p className="mb-5 text-xs text-indigo-600">Ticket #{sentTicket.id}</p>
            <button onClick={onClose} className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Contact Customer Service</h2>
              <button onClick={onClose} className="text-xl leading-none text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Your Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Email</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                    placeholder="you@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Subject</label>
                <select
                  required
                  value={form.subject}
                  onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
                >
                  <option value="">Select a topic</option>
                  <option value="Application issue">Application issue</option>
                  <option value="Account & login">Account & login</option>
                  <option value="Job search help">Job search help</option>
                  <option value="Technical problem">Technical problem</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Message</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                  placeholder="Describe your issue in detail..."
                />
              </div>

              {error ? <p className="text-sm text-red-500">{error}</p> : null}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function ArticleMenu({ onClose, onCopyLink, onShare, onReport, reportDisabled }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onClose();
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute right-0 top-7 z-20 w-44 rounded-xl border border-gray-200 bg-white py-1 text-sm shadow-lg">
      <button onClick={onCopyLink} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Copy link
      </button>
      <button onClick={onShare} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share article
      </button>
      <div className="my-1 border-t border-gray-100" />
      <button
        onClick={onReport}
        disabled={reportDisabled}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        Report issue
      </button>
    </div>
  );
}

function buildHelpfulMap(articles) {
  return articles.reduce((map, article) => {
    if (article.helpful) map[article.id] = article.helpful;
    return map;
  }, {});
}

function buildReportedMap(articles) {
  return articles.reduce((map, article) => {
    if (article.reported) map[article.id] = true;
    return map;
  }, {});
}

export default function HelpCenter() {
  const { user } = useAuth();
  const [articles, setArticles] = useState(FALLBACK_ARTICLES);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Getting Started');
  const [sort, setSort] = useState('Most relevant');
  const [helpful, setHelpful] = useState({});
  const [openMenu, setOpenMenu] = useState(null);
  const [showContact, setShowContact] = useState(false);
  const [toast, setToast] = useState(null);
  const [reported, setReported] = useState({});
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState({});
  const [openTicketCount, setOpenTicketCount] = useState(0);

  const showToast = (message) => setToast(message);

  useEffect(() => {
    let cancelled = false;

    const loadHelpCenterData = async () => {
      setLoading(true);

      try {
        const [articleData, ticketData] = await Promise.all([
          apiService.getHelpCenterArticles(),
          apiService.getHelpSupportTickets().catch(() => []),
        ]);

        if (cancelled) return;

        const nextArticles = Array.isArray(articleData) && articleData.length ? articleData : FALLBACK_ARTICLES;
        setArticles(nextArticles);
        setHelpful(buildHelpfulMap(nextArticles));
        setReported(buildReportedMap(nextArticles));
        setOpenTicketCount(Array.isArray(ticketData)
          ? ticketData.filter((ticket) => ticket.status !== 'RESOLVED').length
          : 0);
      } catch (error) {
        if (cancelled) return;
        console.error('Failed to load help center data:', error);
        setArticles(FALLBACK_ARTICLES);
        setHelpful({});
        setReported({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadHelpCenterData();

    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const source = articles.length ? articles : FALLBACK_ARTICLES;
    return [...new Set(source.map((article) => article.category).filter(Boolean))];
  }, [articles]);

  useEffect(() => {
    if (!categories.length) return;
    if (!categories.includes(activeCategory)) {
      setActiveCategory(categories[0]);
    }
  }, [activeCategory, categories]);

  const filtered = useMemo(() => {
    let list = search
      ? articles.filter((article) =>
          article.q.toLowerCase().includes(search.toLowerCase()) ||
          article.a.toLowerCase().includes(search.toLowerCase()),
        )
      : articles.filter((article) => article.category === activeCategory);

    if (sort === 'Newest') list = [...list].sort((a, b) => b.date.localeCompare(a.date));
    else if (sort === 'Oldest') list = [...list].sort((a, b) => a.date.localeCompare(b.date));

    return list;
  }, [activeCategory, articles, search, sort]);

  const setArticlePending = (articleId, isPending) => {
    setPendingAction((current) => ({ ...current, [articleId]: isPending }));
  };

  const handleHelpful = async (articleId, value) => {
    if (helpful[articleId] || pendingAction[articleId]) return;

    setArticlePending(articleId, true);

    try {
      await apiService.submitHelpArticleFeedback(articleId, value === 'yes');
      setHelpful((current) => ({ ...current, [articleId]: value }));
      showToast(value === 'yes' ? 'Thanks for your feedback! 👍' : "Thanks! We'll work on improving this article.");
    } catch (error) {
      showToast(error.message || 'Failed to save feedback.');
    } finally {
      setArticlePending(articleId, false);
    }
  };

  const handleCopyLink = async (articleId) => {
    const url = `${window.location.origin}/dashboard/help#article-${articleId}`;

    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard!');
    } catch {
      showToast('Failed to copy the link.');
    } finally {
      setOpenMenu(null);
    }
  };

  const handleShare = async (articleId) => {
    const url = `${window.location.origin}/dashboard/help#article-${articleId}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: 'JobHuntly Help', url });
      } else {
        await navigator.clipboard.writeText(url);
        showToast('Link copied to clipboard!');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        showToast('Failed to share the article.');
      }
    } finally {
      setOpenMenu(null);
    }
  };

  const handleReport = async (articleId) => {
    if (reported[articleId] || pendingAction[articleId]) return;

    setArticlePending(articleId, true);

    try {
      await apiService.reportHelpArticle(articleId);
      setReported((current) => ({ ...current, [articleId]: true }));
      showToast('Article reported. Thank you for the feedback.');
    } catch (error) {
      showToast(error.message || 'Failed to report the article.');
    } finally {
      setArticlePending(articleId, false);
      setOpenMenu(null);
    }
  };

  const handleTicketSent = () => {
    setOpenTicketCount((current) => current + 1);
    showToast('Support request submitted successfully.');
  };

  return (
    <div className="flex h-full flex-1 flex-col bg-white">
      <DashTopBar title="Help Center" />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-72 flex-shrink-0 flex-col gap-6 overflow-y-auto border-r border-gray-200 px-6 py-8">
          <div>
            <p className="mb-3 text-sm text-gray-500">Type your question or search keyword</p>
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
              </svg>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-8 text-sm outline-none focus:border-indigo-500"
                placeholder="Search"
              />
              {search ? (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-2 text-base leading-none text-gray-400 hover:text-gray-600">✕</button>
              ) : null}
            </div>
            {search ? (
              <p className="mt-2 text-xs text-gray-400">{filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"</p>
            ) : null}
          </div>

          <nav className="space-y-0.5">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  setSearch('');
                }}
                className={`w-full rounded-lg border-b border-gray-100 px-3 py-2.5 text-left text-sm transition last:border-0 ${
                  activeCategory === category && !search
                    ? 'font-semibold text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {category}
              </button>
            ))}
          </nav>

          <div className="relative mt-auto overflow-hidden rounded-2xl bg-indigo-600 p-5 text-white">
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-indigo-500 opacity-50" />
            <div className="absolute -bottom-8 right-8 h-16 w-16 rounded-full bg-indigo-400 opacity-40" />
            <p className="relative z-10 mb-1 text-base font-bold leading-snug">Didn't find what you were looking for?</p>
            <p className="relative z-10 mb-2 text-xs text-indigo-200">Contact our customer service</p>
            {openTicketCount > 0 ? (
              <p className="relative z-10 mb-4 text-xs text-indigo-100">
                You have {openTicketCount} open support request{openTicketCount === 1 ? '' : 's'}.
              </p>
            ) : (
              <div className="mb-4" />
            )}
            <button
              onClick={() => setShowContact(true)}
              className="relative z-10 rounded-lg bg-white px-5 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
            >
              Contact Us
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="mb-6 flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <div className="relative">
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="cursor-pointer appearance-none border-none bg-transparent pr-5 text-sm font-semibold text-gray-800 outline-none"
              >
                <option>Most relevant</option>
                <option>Newest</option>
                <option>Oldest</option>
              </select>
              <svg xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute right-0 top-1 h-3.5 w-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-gray-400">Loading help articles...</div>
          ) : (
            <div className="space-y-4">
              {filtered.map((article) => (
                <div
                  key={article.id}
                  id={`article-${article.id}`}
                  className={`rounded-xl border p-6 transition ${
                    reported[article.id] ? 'border-red-200 bg-red-50/30' : 'border-gray-200'
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <h3 className="pr-4 text-base font-semibold text-gray-900">{article.q}</h3>
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={() => setOpenMenu(openMenu === article.id ? null : article.id)}
                        className="rounded px-1 py-0.5 text-lg leading-none text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                      >
                        •••
                      </button>
                      {openMenu === article.id ? (
                        <ArticleMenu
                          onClose={() => setOpenMenu(null)}
                          onCopyLink={() => handleCopyLink(article.id)}
                          onShare={() => handleShare(article.id)}
                          onReport={() => handleReport(article.id)}
                          reportDisabled={Boolean(reported[article.id])}
                        />
                      ) : null}
                    </div>
                  </div>

                  {reported[article.id] ? (
                    <p className="mb-2 text-xs text-red-500">⚠ You reported an issue with this article.</p>
                  ) : null}

                  <p className="mb-5 text-sm leading-relaxed text-gray-500">{article.a}</p>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Was this article helpful?</span>
                    {helpful[article.id] ? (
                      <span className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                        helpful[article.id] === 'yes' ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-500'
                      }`}>
                        {helpful[article.id] === 'yes' ? '👍 Marked as helpful' : '👎 Feedback noted'}
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleHelpful(article.id, 'yes')}
                          disabled={pendingAction[article.id]}
                          className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                          Yes
                        </button>
                        <button
                          onClick={() => handleHelpful(article.id, 'no')}
                          disabled={pendingAction[article.id]}
                          className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 transition hover:border-red-400 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
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

              {filtered.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="mb-3 text-sm text-gray-400">No articles found for "{search}"</p>
                  <button onClick={() => { setSearch(''); setShowContact(true); }} className="text-sm text-indigo-600 hover:underline">
                    Contact support instead →
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {showContact ? (
        <ContactModal
          user={user}
          onClose={() => setShowContact(false)}
          onSent={handleTicketSent}
          onToast={showToast}
        />
      ) : null}
      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
      <ChatBot />
    </div>
  );
}
