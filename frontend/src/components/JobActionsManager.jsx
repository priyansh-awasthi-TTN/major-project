import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../services/api';
import DashTopBar from './DashTopBar';
import { useToast } from './Toast';

const TAB_META = {
  saved: {
    label: 'Saved Jobs',
    description: 'Roles you bookmarked to compare, revisit, and apply at the right moment.',
    icon: 'bookmark',
    ribbon: 'from-sky-500 via-blue-500 to-indigo-500',
    chip: 'bg-sky-100 text-sky-700 border border-sky-200',
    surface: 'bg-sky-50/80',
    border: 'border-sky-200/70',
    glow: 'rgba(56, 189, 248, 0.18)',
    emptyTitle: 'Your shortlist is still empty',
    emptyText: 'Save interesting roles while browsing and they will show up here with your notes.',
  },
  reading: {
    label: 'Reading List',
    description: 'Jobs you parked for a deeper look when you have time to review them properly.',
    icon: 'book',
    ribbon: 'from-teal-500 via-emerald-500 to-cyan-500',
    chip: 'bg-teal-100 text-teal-700 border border-teal-200',
    surface: 'bg-teal-50/80',
    border: 'border-teal-200/70',
    glow: 'rgba(20, 184, 166, 0.18)',
    emptyTitle: 'No roles in your reading queue',
    emptyText: 'Add jobs to reading list from the share modal to build a calm review queue.',
  },
  shared: {
    label: 'Shared Jobs',
    description: 'A record of the jobs you have shared or copied so you can retrace what you sent out.',
    icon: 'share',
    ribbon: 'from-amber-400 via-orange-500 to-rose-500',
    chip: 'bg-amber-100 text-amber-700 border border-amber-200',
    surface: 'bg-amber-50/80',
    border: 'border-amber-200/70',
    glow: 'rgba(251, 191, 36, 0.2)',
    emptyTitle: 'Nothing has been shared yet',
    emptyText: 'Shared links, copied job URLs, and sent postings will start collecting here.',
  },
  reports: {
    label: 'Reports',
    description: 'The jobs you flagged so you can track what has already been submitted for review.',
    icon: 'shield',
    ribbon: 'from-rose-500 via-red-500 to-orange-500',
    chip: 'bg-rose-100 text-rose-700 border border-rose-200',
    surface: 'bg-rose-50/80',
    border: 'border-rose-200/70',
    glow: 'rgba(244, 63, 94, 0.18)',
    emptyTitle: 'No reports submitted',
    emptyText: 'If you report suspicious or misleading roles, they will be grouped here.',
  },
};

function ActionIcon({ name, className = 'w-5 h-5' }) {
  switch (name) {
    case 'bookmark':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 5a2 2 0 012-2h6a2 2 0 012 2v15l-5-3-5 3V5z" />
        </svg>
      );
    case 'book':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6.75A2.75 2.75 0 016.75 4h11.5A1.75 1.75 0 0120 5.75v12.5A1.75 1.75 0 0118.25 20H7a3 3 0 01-3-3V6.75z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 4v13a3 3 0 003 3" />
        </svg>
      );
    case 'share':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 8l-6 4 6 4" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18 5a3 3 0 11-6 0 3 3 0 016 0zM9 15a3 3 0 11-6 0 3 3 0 016 0zm9 4a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case 'shield':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3l7 3v5c0 4.5-2.9 8.7-7 10-4.1-1.3-7-5.5-7-10V6l7-3z" />
        </svg>
      );
    case 'spark':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
        </svg>
      );
    case 'refresh':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h5M20 20v-5h-5" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 9a7 7 0 00-12-3L4 9m16 6l-3 3a7 7 0 01-12-3" />
        </svg>
      );
    case 'search':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.35-4.35M10.75 18a7.25 7.25 0 100-14.5 7.25 7.25 0 000 14.5z" />
        </svg>
      );
    case 'arrow':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 17L17 7M9 7h8v8" />
        </svg>
      );
    case 'check':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'trash':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-8 0l1 12a1 1 0 001 1h6a1 1 0 001-1l1-12" />
        </svg>
      );
    case 'clock':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 7v5l3 3" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return null;
  }
}

function parseActionMetadata(metadata) {
  if (!metadata) return {};

  if (typeof metadata !== 'string') {
    return metadata;
  }

  try {
    return JSON.parse(metadata);
  } catch {
    return { value: metadata };
  }
}

function normalizeJobAction(item, type) {
  const metadata = parseActionMetadata(item.metadata);

  if (type === 'saved') {
    return {
      ...item,
      notes: item.notes || metadata.notes || metadata.value || '',
    };
  }

  if (type === 'reading') {
    return {
      ...item,
      addedAt: item.addedAt || item.createdAt,
      isRead: item.isRead || metadata.isRead || false,
    };
  }

  if (type === 'reports') {
    return {
      ...item,
      reason: item.reason || metadata.reason || 'Reported job',
      description: item.description || metadata.description || '',
      reportedAt: item.reportedAt || item.createdAt,
    };
  }

  if (type === 'shared') {
    return {
      ...item,
      sharedAt: item.createdAt,
      shareMethod: item.shareMethod || metadata.shareMethod || 'link',
    };
  }

  return item;
}

function normalizeJobActionList(response, type) {
  return Array.isArray(response) ? response.map((item) => normalizeJobAction(item, type)) : [];
}

function formatActionDate(value) {
  if (!value) return 'Recently';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCurrency(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;

  return `$${value.toLocaleString()}`;
}

function formatReportReason(value) {
  if (!value) return 'Reported job';

  return value
    .toString()
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatShareMethod(value) {
  if (!value) return 'Shared';

  return value
    .toString()
    .replace(/[_-]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeCategories(categories) {
  if (Array.isArray(categories)) return categories;
  if (typeof categories !== 'string') return [];

  return categories
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getTypeBadgeClass(type) {
  switch (type) {
    case 'Full-Time':
      return 'border-green-200 bg-green-50 text-green-700';
    case 'Part-Time':
      return 'border-blue-200 bg-blue-50 text-blue-700';
    case 'Remote':
      return 'border-cyan-200 bg-cyan-50 text-cyan-700';
    case 'Internship':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'Contract':
      return 'border-violet-200 bg-violet-50 text-violet-700';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700';
  }
}

function getActionCollection(items, activeTab) {
  switch (activeTab) {
    case 'saved':
      return items.savedJobs;
    case 'reading':
      return items.readingList;
    case 'shared':
      return items.sharedJobs;
    case 'reports':
      return items.reports;
    default:
      return [];
  }
}

function matchesQuery(item, activeTab, query) {
  if (!query) return true;

  const job = item.job || item;
  const pool = [
    job?.title,
    job?.company,
    job?.location,
    job?.type,
    item.notes,
    item.description,
    item.reason,
    item.shareMethod,
  ];

  if (activeTab === 'reports') {
    pool.push(formatReportReason(item.reason));
  }

  return pool.some((value) => value && value.toString().toLowerCase().includes(query));
}

function SummaryCard({ title, value, caption, tone, icon }) {
  return (
    <div className={`relative overflow-hidden rounded-3xl border p-5 ${tone.surface} ${tone.border}`}>
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl" style={{ backgroundColor: tone.glow }} />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{title}</p>
          <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
          <p className="mt-2 text-sm text-slate-600">{caption}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone.chip}`}>
          <ActionIcon name={icon} className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl bg-slate-200"></div>
          <div className="space-y-3">
            <div className="h-4 w-48 rounded-full bg-slate-200"></div>
            <div className="h-3 w-32 rounded-full bg-slate-100"></div>
          </div>
        </div>
        <div className="h-8 w-24 rounded-full bg-slate-100"></div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="h-16 rounded-2xl bg-slate-100"></div>
        <div className="h-16 rounded-2xl bg-slate-100"></div>
        <div className="h-16 rounded-2xl bg-slate-100"></div>
      </div>
      <div className="mt-6 h-20 rounded-2xl bg-slate-100"></div>
    </div>
  );
}

function EmptyState({ activeTab, hasQuery }) {
  const meta = TAB_META[activeTab];

  return (
    <div className={`rounded-[2rem] border p-10 text-center ${meta.surface} ${meta.border}`}>
      <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${meta.chip}`}>
        <ActionIcon name={meta.icon} className="w-7 h-7" />
      </div>
      <h3 className="mt-5 text-2xl font-bold text-slate-900">
        {hasQuery ? 'No matching jobs found' : meta.emptyTitle}
      </h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
        {hasQuery ? 'Try a broader search phrase, or switch tabs to inspect a different action collection.' : meta.emptyText}
      </p>
      <div className="mt-6">
        <Link
          to="/dashboard/find-jobs"
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Browse Jobs
          <ActionIcon name="arrow" className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function ActionCard({ item, type, onUnsaveJob, onRemoveFromReadingList, onMarkAsRead }) {
  const meta = TAB_META[type];
  const job = item.job || item;
  const categories = normalizeCategories(job.categories);
  const applied = typeof job.applied === 'number' ? job.applied : 0;
  const capacity = typeof job.capacity === 'number' ? job.capacity : 0;
  const progress = capacity > 0 ? Math.min((applied / capacity) * 100, 100) : 0;
  const dateLabel =
    type === 'reading'
      ? formatActionDate(item.addedAt)
      : type === 'reports'
        ? formatActionDate(item.reportedAt)
        : type === 'shared'
          ? formatActionDate(item.sharedAt)
          : formatActionDate(item.createdAt);

  const descriptor =
    type === 'reading'
      ? (item.isRead ? 'Read' : 'Unread')
      : type === 'reports'
        ? formatReportReason(item.reason)
        : type === 'shared'
          ? formatShareMethod(item.shareMethod)
          : 'Saved';

  return (
    <article className="group relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 shadow-[0_22px_60px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${meta.ribbon}`}></div>
      <div className="absolute -right-8 -top-12 h-32 w-32 rounded-full blur-3xl" style={{ backgroundColor: meta.glow }}></div>
      <div className="relative p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className={`${job.color || 'bg-slate-800'} flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-lg`}>
              {job.logo || job.company?.slice(0, 2)?.toUpperCase() || 'J'}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${meta.chip}`}>
                  {descriptor}
                </span>
                {job.type && (
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getTypeBadgeClass(job.type)}`}>
                    {job.type}
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-xl font-bold text-slate-900 transition group-hover:text-blue-700">
                {job.title}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {job.company} {job.location ? `• ${job.location}` : ''}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:min-w-[18rem]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Captured</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{dateLabel}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Salary</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{formatCurrency(job.salary) || 'Not listed'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 col-span-2 sm:col-span-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Demand</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {capacity > 0 ? `${applied}/${capacity} filled` : `${applied} applied`}
              </p>
            </div>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {categories.slice(0, 4).map((category) => (
              <span key={category} className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                {category}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50/90 p-4">
          <div className="flex items-center justify-between gap-4 text-xs font-medium text-slate-500">
            <span>Application interest</span>
            <span>{capacity > 0 ? `${Math.round(progress)}% capacity used` : `${applied} applicants`}</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-white">
            <div
              className={`h-2 rounded-full bg-gradient-to-r ${meta.ribbon}`}
              style={{ width: `${Math.max(progress, capacity > 0 ? 6 : 18)}%` }}
            ></div>
          </div>
          {job.description && (
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {job.description.length > 180 ? `${job.description.slice(0, 180)}...` : job.description}
            </p>
          )}
        </div>

        {type === 'saved' && item.notes && (
          <div className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-600">Private note</p>
            <p className="mt-2 text-sm leading-6 text-amber-950">{item.notes}</p>
          </div>
        )}

        {type === 'reports' && (item.description || item.reason) && (
          <div className="mt-5 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-600">Report details</p>
            <p className="mt-2 text-sm font-semibold text-rose-900">{formatReportReason(item.reason)}</p>
            {item.description && <p className="mt-2 text-sm leading-6 text-rose-900/85">{item.description}</p>}
          </div>
        )}

        {type === 'shared' && (
          <div className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-600">Shared via</p>
            <p className="mt-2 text-sm font-semibold text-amber-900">{formatShareMethod(item.shareMethod)}</p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={`/dashboard/jobs/${job.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Open Job Posting
            <ActionIcon name="arrow" className="w-4 h-4" />
          </Link>

          {type === 'saved' && (
            <button
              onClick={() => onUnsaveJob(job.id)}
              className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100"
            >
              <ActionIcon name="trash" className="w-4 h-4" />
              Remove
            </button>
          )}

          {type === 'reading' && !item.isRead && (
            <button
              onClick={() => onMarkAsRead(job.id)}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
            >
              <ActionIcon name="check" className="w-4 h-4" />
              Mark as read
            </button>
          )}

          {type === 'reading' && (
            <button
              onClick={() => onRemoveFromReadingList(job.id)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <ActionIcon name="trash" className="w-4 h-4" />
              Remove
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function JobActionsManager() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('saved');
  const [savedJobs, setSavedJobs] = useState([]);
  const [readingList, setReadingList] = useState([]);
  const [sharedJobs, setSharedJobs] = useState([]);
  const [reports, setReports] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [savedResponse, readingResponse, sharedResponse, reportsResponse] = await Promise.all([
        ApiService.getSavedJobs(),
        ApiService.getReadingList(),
        ApiService.getSharedJobs(),
        ApiService.getUserReports(),
      ]);

      setSavedJobs(normalizeJobActionList(savedResponse, 'saved'));
      setReadingList(normalizeJobActionList(readingResponse, 'reading'));
      setSharedJobs(normalizeJobActionList(sharedResponse, 'shared'));
      setReports(normalizeJobActionList(reportsResponse, 'reports'));
    } catch (error) {
      console.error('Failed to load job actions:', error);
      showToast('Failed to load job actions', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleJobActionUpdated = () => {
      loadData({ silent: true });
    };

    window.addEventListener('job-actions:updated', handleJobActionUpdated);
    return () => window.removeEventListener('job-actions:updated', handleJobActionUpdated);
  }, []);

  const handleUnsaveJob = async (jobId) => {
    try {
      await ApiService.unsaveJob(jobId);
      setSavedJobs((prev) => prev.filter((item) => item.job.id !== jobId));
      showToast('Removed from saved jobs', 'success');
    } catch (error) {
      console.error('Failed to unsave job:', error);
      showToast('Failed to remove saved job', 'error');
    }
  };

  const handleRemoveFromReadingList = async (jobId) => {
    try {
      await ApiService.removeFromReadingList(jobId);
      setReadingList((prev) => prev.filter((item) => item.job.id !== jobId));
      showToast('Removed from reading list', 'success');
    } catch (error) {
      console.error('Failed to remove from reading list:', error);
      showToast('Failed to remove reading list item', 'error');
    }
  };

  const handleMarkAsRead = async (jobId) => {
    try {
      await ApiService.markAsRead(jobId);
      setReadingList((prev) => prev.map((item) => (
        item.job.id === jobId ? { ...item, isRead: true } : item
      )));
      showToast('Marked as read', 'success');
    } catch (error) {
      console.error('Failed to mark as read:', error);
      showToast('Failed to update reading status', 'error');
    }
  };

  const collections = { savedJobs, readingList, sharedJobs, reports };
  const activeItems = getActionCollection(collections, activeTab);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = activeItems.filter((item) => matchesQuery(item, activeTab, normalizedQuery));
  const totalActions = savedJobs.length + readingList.length + sharedJobs.length + reports.length;
  const unreadReading = readingList.filter((item) => !item.isRead).length;
  const savedWithNotes = savedJobs.filter((item) => item.notes).length;
  const latestActivityValue = [savedJobs, readingList, sharedJobs, reports]
    .flat()
    .map((item) => item.updatedAt || item.createdAt || item.addedAt || item.reportedAt || item.sharedAt)
    .filter(Boolean)
    .sort((a, b) => new Date(b) - new Date(a))[0];
  const activeMeta = TAB_META[activeTab];
  const tabs = [
    { id: 'saved', count: savedJobs.length },
    { id: 'reading', count: readingList.length },
    { id: 'shared', count: sharedJobs.length },
    { id: 'reports', count: reports.length },
  ];
  const summaryCards = [
    {
      title: 'Total Actions',
      value: totalActions,
      caption: latestActivityValue ? `Latest activity on ${formatActionDate(latestActivityValue)}` : 'Start saving or sharing jobs to build momentum.',
      tone: TAB_META.saved,
      icon: 'spark',
    },
    {
      title: 'Saved With Notes',
      value: savedWithNotes,
      caption: savedWithNotes > 0 ? 'Your annotated shortlist is ready for comparison.' : 'Add notes while saving roles to capture tradeoffs.',
      tone: TAB_META.saved,
      icon: 'bookmark',
    },
    {
      title: 'Unread Queue',
      value: unreadReading,
      caption: unreadReading > 0 ? 'These jobs are still waiting for a closer read.' : 'Your reading queue is currently cleared out.',
      tone: TAB_META.reading,
      icon: 'clock',
    },
    {
      title: 'Reports Sent',
      value: reports.length,
      caption: reports.length > 0 ? 'You already flagged suspicious listings for review.' : 'Nothing has been flagged from your side yet.',
      tone: TAB_META.reports,
      icon: 'shield',
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <DashTopBar title="Job Actions" />
      <div
        className="flex-1 overflow-y-auto"
        style={{
          backgroundImage: 'radial-gradient(circle at top left, rgba(56,189,248,0.12), transparent 24%), radial-gradient(circle at top right, rgba(251,191,36,0.14), transparent 18%), linear-gradient(180deg, #f8fafc 0%, #eef4ff 100%)',
        }}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-8 py-8">
          <section className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 px-8 py-8 text-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.85)]">
            <div className="absolute -left-14 top-0 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl"></div>
            <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-amber-400/15 blur-3xl"></div>
            <div className="relative grid gap-8 lg:grid-cols-[1.5fr_1fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">
                  <ActionIcon name="spark" className="w-4 h-4" />
                  Action Command Center
                </div>
                <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight">
                  Keep every saved, shared, queued, and reported job in one polished workspace.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                  This is your operations layer for job discovery. Review promising roles, clear reading debt, revisit shared postings, and keep reports organized without losing context.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <div className="flex flex-1 items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/80 backdrop-blur">
                    <ActionIcon name="search" className="w-4 h-4 text-sky-200" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={`Search inside ${activeMeta.label.toLowerCase()}`}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-white/45"
                    />
                  </div>
                  <Link
                    to="/dashboard/find-jobs"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                  >
                    Find More Jobs
                    <ActionIcon name="arrow" className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Live Overview</p>
                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-3xl font-bold">{totalActions}</p>
                      <p className="mt-1 text-xs text-slate-400">Total actions tracked</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{sharedJobs.length}</p>
                      <p className="mt-1 text-xs text-slate-400">Shared postings</p>
                    </div>
                  </div>
                  <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Focus right now</p>
                    <p className="mt-2 text-lg font-semibold text-white">{unreadReading} jobs waiting in reading queue</p>
                    <p className="mt-1 text-sm text-slate-400">Review them before they go stale.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <SummaryCard
                key={card.title}
                title={card.title}
                value={card.value}
                caption={card.caption}
                tone={card.tone}
                icon={card.icon}
              />
            ))}
          </section>

          <section className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-6 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.4)] backdrop-blur">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Collections</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">{activeMeta.label}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{activeMeta.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => loadData({ silent: true })}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <ActionIcon name="refresh" className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${activeMeta.chip}`}>
                  <ActionIcon name={activeMeta.icon} className="w-4 h-4" />
                  {filteredItems.length} visible
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {tabs.map((tab) => {
                const meta = TAB_META[tab.id];
                const active = tab.id === activeTab;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-3 rounded-full border px-4 py-3 text-sm font-medium transition ${
                      active
                        ? `${meta.chip} shadow-sm`
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    <ActionIcon name={meta.icon} className="w-4 h-4" />
                    <span>{meta.label}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${active ? 'bg-white/70 text-slate-900' : 'bg-slate-100 text-slate-600'}`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8">
              {loading ? (
                <div className="grid gap-5">
                  <LoadingCard />
                  <LoadingCard />
                </div>
              ) : filteredItems.length === 0 ? (
                <EmptyState activeTab={activeTab} hasQuery={Boolean(normalizedQuery)} />
              ) : (
                <div className="grid gap-5">
                  {filteredItems.map((item) => (
                    <ActionCard
                      key={`${activeTab}-${item.id}`}
                      item={item}
                      type={activeTab}
                      onUnsaveJob={handleUnsaveJob}
                      onRemoveFromReadingList={handleRemoveFromReadingList}
                      onMarkAsRead={handleMarkAsRead}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
