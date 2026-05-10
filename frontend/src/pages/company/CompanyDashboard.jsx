import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BellIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ChatBubbleLeftEllipsisIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  EyeIcon,
  PlusIcon,
  UserGroupIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useMessaging } from '../../context/MessagingContext';
import { useNotifications } from '../../context/NotificationContext';
import apiService from '../../services/api';
import {
  buildDashboardMetrics,
  buildJobsById,
  formatFullDate,
  formatNumber,
  formatShortDate,
  getInitials,
  getAvatarTone,
  normalizeApplication,
  normalizeDateRange,
  normalizeJob,
} from '../../utils/companyData';

const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getStoredDateRange() {
  const today = new Date();
  const fallback = {
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6),
    end: today,
  };

  try {
    const stored = localStorage.getItem('company_dashboard_date_range');
    if (!stored) return fallback;
    const parsed = JSON.parse(stored);
    return normalizeDateRange(parsed);
  } catch {
    return fallback;
  }
}

function storeDateRange(dateRange) {
  localStorage.setItem(
    'company_dashboard_date_range',
    JSON.stringify({
      start: dateRange.start.toISOString(),
      end: dateRange.end.toISOString(),
    }),
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
        <p className="mt-3 text-sm text-slate-500">Loading company dashboard...</p>
      </div>
    </div>
  );
}

function SummaryCard({ to, icon: Icon, title, value, tone }) {
  return (
    <Link
      to={to}
      className={`rounded-[28px] bg-gradient-to-br p-5 text-white shadow-[0_20px_45px_rgba(79,70,229,0.18)] transition hover:-translate-y-0.5 ${tone}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[38px] font-semibold leading-none">{formatNumber(value)}</p>
          <p className="mt-3 max-w-[180px] text-sm font-medium text-white/90">{title}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Link>
  );
}

function ChangeLabel({ value, label }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{formatNumber(value)}</p>
    </div>
  );
}

function Calendar({ isOpen, onClose, onDateSelect, selectedRange }) {
  const [currentDate, setCurrentDate] = useState(selectedRange.start);
  const [selectingStart, setSelectingStart] = useState(true);
  const [tempRange, setTempRange] = useState(normalizeDateRange(selectedRange));

  useEffect(() => {
    setCurrentDate(selectedRange.start);
    setTempRange(normalizeDateRange(selectedRange));
    setSelectingStart(true);
  }, [selectedRange, isOpen]);

  if (!isOpen) return null;

  const getDaysInMonth = (dateValue) => {
    const year = dateValue.getFullYear();
    const month = dateValue.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const days = [];

    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let index = startingDayOfWeek - 1; index >= 0; index -= 1) {
      days.push({ date: new Date(year, month - 1, prevMonthLastDate - index), isCurrentMonth: false });
    }

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }

    while (days.length < 42) {
      const day = days.length - (startingDayOfWeek + lastDay.getDate()) + 1;
      days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false });
    }

    return days;
  };

  const handleDateClick = (date) => {
    if (selectingStart) {
      setTempRange({ start: date, end: date });
      setSelectingStart(false);
      return;
    }

    const normalized = normalizeDateRange({ start: tempRange.start, end: date });
    setTempRange(normalized);
    onDateSelect(normalized);
    onClose();
  };

  const isToday = (date) => date.toDateString() === new Date().toDateString();
  const isSelected = (date) => date.toDateString() === tempRange.start.toDateString() || date.toDateString() === tempRange.end.toDateString();
  const isInRange = (date) => date >= tempRange.start && date <= tempRange.end;

  return (
    <div className="absolute right-0 top-full z-30 mt-3 w-80 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
            {formatShortDate(tempRange.start)} - {formatShortDate(tempRange.end)}
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-slate-400 transition hover:bg-white hover:text-slate-700">
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <h3 className="text-sm font-semibold text-slate-900">
            {MONTHS_LONG[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button
            type="button"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {DAYS_OF_WEEK.map((day) => <div key={day} className="py-1">{day}</div>)}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-1">
          {getDaysInMonth(currentDate).map(({ date, isCurrentMonth }, index) => (
            <button
              key={`${date.toISOString()}-${index}`}
              type="button"
              onClick={() => handleDateClick(date)}
              className={`h-9 rounded-2xl text-xs font-medium transition ${
                isSelected(date)
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isInRange(date)
                    ? 'bg-indigo-50 text-indigo-700'
                    : isToday(date)
                      ? 'border border-indigo-200 bg-white text-indigo-700'
                      : isCurrentMonth
                        ? 'text-slate-700 hover:bg-slate-100'
                        : 'text-slate-300 hover:bg-slate-50'
              }`}
            >
              {date.getDate()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DateRangePicker({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
      >
        <span>{formatShortDate(value.start)} - {formatShortDate(value.end)}</span>
        <CalendarDaysIcon className="h-4 w-4 text-slate-400" />
      </button>

      <Calendar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onDateSelect={(nextRange) => {
          onChange(nextRange);
          storeDateRange(nextRange);
          setIsOpen(false);
        }}
        selectedRange={value}
      />
    </div>
  );
}

function ActivityChart({ applicationsSeries, jobsSeries }) {
  const maxValue = Math.max(
    1,
    ...applicationsSeries.map((item) => item.value),
    ...jobsSeries.map((item) => item.value),
  );

  return (
    <div>
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${applicationsSeries.length || 1}, minmax(0, 1fr))` }}>
        {applicationsSeries.map((item, index) => {
          const jobValue = jobsSeries[index]?.value || 0;
          const applicationHeight = `${Math.max(12, (item.value / maxValue) * 100)}%`;
          const jobHeight = `${Math.max(12, (jobValue / maxValue) * 100)}%`;

          return (
            <div key={item.key} className="flex min-w-0 flex-col items-center gap-3">
              <div className="flex h-56 w-full items-end justify-center gap-1 rounded-[28px] bg-slate-50 px-2 pb-3 pt-6">
                <div className="flex w-full flex-col justify-end">
                  <div className="rounded-t-[18px] bg-indigo-600" style={{ height: applicationHeight }} />
                </div>
                <div className="flex w-full flex-col justify-end">
                  <div className="rounded-t-[18px] bg-amber-400" style={{ height: jobHeight }} />
                </div>
              </div>
              <span className="truncate text-xs font-medium text-slate-500">{item.label}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-5 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <span className="h-3 w-3 rounded-full bg-indigo-600" />
          Applications received
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          Jobs posted
        </div>
      </div>
    </div>
  );
}

export default function CompanyDashboard() {
  const { user } = useAuth();
  const { totalUnreadCount = 0 } = useMessaging();
  const { unreadCount = 0 } = useNotifications();
  const [dateRange, setDateRange] = useState(getStoredDateRange);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      setLoading(true);
      setError('');

      try {
        const [jobsResponse, applicationsResponse] = await Promise.all([
          apiService.getCompanyJobs(),
          apiService.getCompanyApplications(),
        ]);

        if (cancelled) return;

        const normalizedJobs = (jobsResponse || []).map(normalizeJob);
        const jobsById = buildJobsById(normalizedJobs);
        const normalizedApplications = (applicationsResponse || []).map((item) => normalizeApplication(item, jobsById));

        setJobs(normalizedJobs);
        setApplications(normalizedApplications);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || 'Failed to load company dashboard.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  const companyName = user?.companyName || user?.fullName || 'Company Workspace';
  const greetingName = user?.fullName?.split(' ')[0] || 'Team';
  const normalizedRange = useMemo(() => normalizeDateRange(dateRange), [dateRange]);
  const metrics = useMemo(
    () => buildDashboardMetrics(jobs, applications, totalUnreadCount, normalizedRange),
    [applications, jobs, normalizedRange, totalUnreadCount],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fb]">
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <div className="fixed inset-x-0 top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur lg:left-60">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Company</p>
            <div className="mt-0.5 flex items-center gap-2">
              <h1 className="truncate text-sm font-semibold text-slate-900 sm:text-base">{companyName}</h1>
              <ChevronDownIcon className="h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="notifications"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
            >
              <BellIcon className="h-5 w-5" />
              {unreadCount > 0 ? <span className="absolute right-2 top-2 flex h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" /> : null}
            </button>
            <Link
              to="/company/jobs/post"
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <PlusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Post a job</span>
              <span className="sm:hidden">Post</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">Good morning, {greetingName}</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Company activity from {formatFullDate(normalizedRange.start)} to {formatFullDate(normalizedRange.end)}.
            </p>
          </div>
          <DateRangePicker value={normalizedRange} onChange={setDateRange} />
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <SummaryCard to="/company/applicants" icon={UsersIcon} title="Candidates waiting for review" value={metrics.reviewCount} tone="from-[#5448f5] to-[#3b82f6]" />
          <SummaryCard to="/company/applicants" icon={CalendarDaysIcon} title="Candidates in interview stages" value={metrics.interviewCount} tone="from-[#4ecdc4] to-[#34d399]" />
          <SummaryCard to="/company/messages" icon={ChatBubbleLeftEllipsisIcon} title="Unread messages" value={metrics.unreadMessages} tone="from-[#34a3ff] to-[#3b82f6]" />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,2fr)_320px]">
          <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Hiring activity</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Applications and job posting activity for the selected range.
                </p>
              </div>

              <div className="inline-flex rounded-2xl bg-slate-100 p-1">
                <div className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm">
                  {metrics.applicationSeries.length} points
                </div>
              </div>
            </div>

            <div className="mt-6">
              <ActivityChart applicationsSeries={metrics.applicationSeries} jobsSeries={metrics.jobSeries} />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <ChangeLabel value={metrics.scopedApplications.length} label="Applications in range" />
              <ChangeLabel value={metrics.scopedJobs.length} label="Jobs posted in range" />
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Live job openings</p>
                  <p className="mt-1 text-xs text-slate-400">Roles currently visible to candidates</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <BriefcaseIcon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-8 flex items-end gap-3">
                <span className="text-5xl font-semibold tracking-tight text-slate-900">{formatNumber(metrics.openJobs)}</span>
                <span className="pb-2 text-sm text-slate-500">open roles</span>
              </div>
            </section>

            <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Applicant stages</p>
                  <p className="mt-1 text-xs text-slate-400">Counts for the selected date range</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                  <UserGroupIcon className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {metrics.stageCounts.map((item) => (
                  <div key={item.stage}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-600">{item.stage}</span>
                      <span className="font-semibold text-slate-900">{formatNumber(item.count)}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-indigo-600"
                        style={{ width: `${metrics.totalApplicants > 0 ? (item.count / metrics.totalApplicants) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>

        <section className="mt-6 rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Recent job updates</h3>
              <p className="mt-1 text-sm text-slate-500">Current openings populated directly from the backend.</p>
            </div>
            <Link to="/company/jobs" className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700">
              View all
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.latestJobs.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500 sm:col-span-2 xl:col-span-4">
                No jobs have been posted yet.
              </div>
            ) : (
              metrics.latestJobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/company/jobs/${job.id}/detail?from=dashboard`}
                  className="block rounded-[28px] border border-slate-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-[0_16px_30px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold text-white ${getAvatarTone(job.title)}`}>
                        {getInitials(job.title)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{job.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{job.location || 'Location not set'}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${job.status === 'Live' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {job.status}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(job.categories || []).slice(0, 3).map((category) => (
                      <span key={category} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                        {category}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-500">
                    <span className="font-semibold text-slate-900">{formatNumber(job.applied)} applicants</span> • posted {job.createdAtLabel}
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
