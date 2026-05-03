import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  AcademicCapIcon,
  AdjustmentsHorizontalIcon,
  ArrowLeftIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  EllipsisHorizontalIcon,
  GiftIcon,
  HeartIcon,
  HomeModernIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  SunIcon,
  TableCellsIcon,
  TruckIcon,
  UserGroupIcon,
  UsersIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import CompanyTopBar from '../../components/CompanyTopBar';
import {
  APPLICANT_STAGE_ORDER,
  companyJobSectionJobs,
  DATE_RANGE_OPTIONS,
} from '../../data/companyJobSectionData';

const JOB_STATUS_OPTIONS = ['all', 'Live', 'Closed'];
const JOB_TYPE_OPTIONS = ['all', 'Full-Time', 'Freelance', 'Part-Time', 'Contract'];

const stageBadgeClasses = {
  'In Review': 'border-amber-200 bg-amber-50 text-amber-700',
  Shortlisted: 'border-violet-200 bg-violet-50 text-violet-700',
  Interview: 'border-sky-200 bg-sky-50 text-sky-700',
  Hired: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

const stageColumnAccent = {
  'In Review': 'border-t-amber-400',
  Shortlisted: 'border-t-violet-500',
  Interview: 'border-t-sky-500',
  Hired: 'border-t-emerald-500',
};

const perkIcons = {
  heart: HeartIcon,
  sun: SunIcon,
  academic: AcademicCapIcon,
  users: UsersIcon,
  home: HomeModernIcon,
  truck: TruckIcon,
  gift: GiftIcon,
  clock: ClockIcon,
};

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value);
}

function getTabFromPath(pathname) {
  if (pathname.endsWith('/analytics')) return 'analytics';
  if (pathname.endsWith('/applicants')) return 'applicants';
  return 'detail';
}

function buildJobRoute(jobId, tab = 'detail') {
  if (tab === 'analytics') return `/company/jobs/${jobId}/analytics`;
  if (tab === 'applicants') return `/company/jobs/${jobId}/applicants`;
  return `/company/jobs/${jobId}/detail`;
}

function parseDisplayDate(value) {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? value : parsed;
}

function getStatusBadgeClasses(status) {
  return status === 'Live'
    ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border border-rose-200 bg-rose-50 text-rose-700';
}

function getJobTypeBadgeClasses(type) {
  const tones = {
    'Full-Time': 'border border-indigo-200 bg-indigo-50 text-indigo-700',
    Freelance: 'border border-amber-200 bg-amber-50 text-amber-700',
    'Part-Time': 'border border-sky-200 bg-sky-50 text-sky-700',
    Contract: 'border border-orange-200 bg-orange-50 text-orange-700',
  };
  return tones[type] || 'border border-slate-200 bg-slate-50 text-slate-700';
}

function getApplicantInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getApplicantAvatarTone(name) {
  const tones = [
    'bg-sky-500',
    'bg-violet-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-cyan-500',
    'bg-rose-500',
  ];
  const seed = name.charCodeAt(0) + name.charCodeAt(name.length - 1);
  return tones[seed % tones.length];
}

function getTrafficBackground(traffic) {
  let start = 0;
  const segments = traffic.map((channel) => {
    const segment = `${channel.color} ${start}% ${start + channel.value}%`;
    start += channel.value;
    return segment;
  });
  return `conic-gradient(${segments.join(', ')})`;
}

function getLineChartMeta(values, width = 760, height = 240, padding = 28) {
  const max = Math.ceil(Math.max(...values) / 250) * 250;
  const min = 0;
  const xStep = (width - padding * 2) / Math.max(values.length - 1, 1);
  const yRange = Math.max(max - min, 1);

  const points = values
    .map((value, index) => {
      const x = padding + index * xStep;
      const y = height - padding - ((value - min) / yRange) * (height - padding * 2);
      return { x, y, value, index };
    });

  return {
    width,
    height,
    padding,
    maxValue: max,
    points,
    polyline: points.map((point) => `${point.x},${point.y}`).join(' '),
  };
}

function ScoreCell({ value }) {
  return (
    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
      <svg viewBox="0 0 20 20" className="h-4 w-4 text-amber-400" fill="currentColor" aria-hidden="true">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      {Number(value).toFixed(1)}
    </div>
  );
}

function SectionTabLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center border-b-2 px-1 py-3 text-sm font-medium transition ${
        active
          ? 'border-indigo-600 text-slate-900'
          : 'border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-700'
      }`}
    >
      {children}
    </Link>
  );
}

function MetricCard({ title, value, delta, positive, icon }) {
  const TrendIcon = positive ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  const MetricIcon = icon;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-3xl font-semibold tracking-tight text-slate-900">{formatNumber(value)}</span>
            <span className={`inline-flex items-center gap-1 text-sm font-medium ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>
              <TrendIcon className="h-4 w-4" />
              {Math.abs(delta)}%
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">vs last 7 days</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
          <MetricIcon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function JobDetailsPanel({ job }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_320px]">
      <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <section>
          <h3 className="text-lg font-semibold text-slate-900">Description</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">{job.description}</p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-slate-900">Responsibilities</h3>
          <ul className="mt-3 space-y-3">
            {job.responsibilities.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-6 text-slate-600">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-slate-900">Who You Are</h3>
          <ul className="mt-3 space-y-3">
            {job.whoYouAre.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-6 text-slate-600">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-slate-900">Nice-To-Haves</h3>
          <ul className="mt-3 space-y-3">
            {job.niceToHaves.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-6 text-slate-600">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="flex items-end justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Perks & Benefits</h3>
              <p className="mt-1 text-sm text-slate-500">This role comes with several team-wide benefits.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {job.perks.map((perk) => {
              const Icon = perkIcons[perk.icon] || GiftIcon;
              return (
                <div key={perk.title} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-900">{perk.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{perk.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">About this role</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-slate-500">Applied</dt>
              <dd className="font-medium text-slate-900">{job.applications} candidates</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-slate-500">Date Posted</dt>
              <dd className="font-medium text-slate-900">{job.aboutPosted}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-slate-500">Job Type</dt>
              <dd className="font-medium text-slate-900">{job.jobType}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-slate-500">Salary</dt>
              <dd className="font-medium text-slate-900">{job.salary}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Categories</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {job.categories.map((category) => (
              <span key={category} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                {category}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Required Skills</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {job.requiredSkills.map((skill) => (
              <span key={skill} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function AnalyticsPanel({ analytics }) {
  const chart = getLineChartMeta(analytics.dailyViews);
  const highlightedPoint = chart.points.find((point) => point.value === analytics.highlightedValue) || chart.points[chart.points.length - 2];
  const days = ['19 Jul', '20 Jul', '21 Jul', '22 Jul', '23 Jul', '24 Jul', '25 Jul'];
  const yAxisLabels = Array.from({ length: 5 }, (_, index) => Math.round((chart.maxValue / 4) * index));
  const chartHeight = chart.height - chart.padding * 2;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_320px]">
        <MetricCard title="Total Views" value={analytics.totalViews} delta={analytics.viewsDelta} positive={analytics.viewsDelta >= 0} icon={EyeIcon} />
        <MetricCard title="Total Applied" value={analytics.totalApplied} delta={analytics.appliedDelta} positive={analytics.appliedDelta >= 0} icon={UserGroupIcon} />

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Traffic Channel</p>
          <div className="mt-4 flex items-center gap-5">
            <div className="relative h-36 w-36 flex-shrink-0">
              <div
                className="h-full w-full rounded-full"
                style={{ background: getTrafficBackground(analytics.traffic) }}
                aria-hidden="true"
              />
              <div className="absolute inset-[22px] rounded-full bg-white" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="rounded-full bg-slate-900 px-2 py-1 text-xs font-semibold text-white">{analytics.highlightedValue}</span>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              {analytics.traffic.map((channel) => (
                <div key={channel.label} className="flex items-center gap-2 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: channel.color }} />
                  <span className="font-medium text-slate-900">{channel.label}</span>
                  <span>{channel.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_320px]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Job Listing View Stats</h3>
              <p className="mt-1 text-sm text-slate-500">Daily traffic trend for the selected job listing.</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600">
              Last 7 days
              <ChevronDownIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 overflow-x-auto">
            <div className="min-w-[640px]">
              <div className="relative" style={{ height: chart.height }}>
                {yAxisLabels.map((label) => {
                  const top = chart.padding + chartHeight - (label / yAxisLabels[yAxisLabels.length - 1]) * chartHeight;
                  return (
                    <div key={label} className="absolute inset-x-0 flex items-center gap-3" style={{ top }}>
                      <span className="w-8 text-[11px] text-slate-400">{label}</span>
                      <div className="h-px flex-1 bg-slate-100" />
                    </div>
                  );
                })}

                <svg
                  viewBox={`0 0 ${chart.width} ${chart.height}`}
                  className="absolute inset-0 h-full w-full"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <polyline
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={chart.polyline}
                  />
                  {chart.points.map((point, index) => (
                    <circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r={point === highlightedPoint ? 5 : 3}
                      fill={point === highlightedPoint ? '#111827' : '#34d399'}
                    />
                  ))}
                </svg>

                <div
                  className="absolute -translate-x-1/2 -translate-y-full rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-white shadow-lg"
                  style={{ left: highlightedPoint.x, top: highlightedPoint.y - 10 }}
                >
                  {analytics.chartLabel}: {analytics.highlightedValue}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-7 gap-2 pl-11 text-xs text-slate-400">
                {days.map((day) => (
                  <span key={day} className="text-center">
                    {day}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Visitors by Country</h3>
          <div className="mt-5 space-y-4">
            {analytics.visitorsByCountry.map((entry) => {
              const maxCount = analytics.visitorsByCountry[0]?.count || 1;
              const width = `${(entry.count / maxCount) * 100}%`;
              return (
                <div key={entry.country}>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="font-medium text-slate-700">{entry.country}</span>
                    <span className="text-slate-500">{formatNumber(entry.count)}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full" style={{ width, backgroundColor: entry.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobListing() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const routeJobId = Number(id);
  const hasFocusedJob = Number.isFinite(routeJobId) && routeJobId > 0;

  const [dateRange, setDateRange] = useState(DATE_RANGE_OPTIONS[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(null);
  const [jobItemsPerPage, setJobItemsPerPage] = useState(10);
  const [jobCurrentPage, setJobCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'datePosted', direction: 'desc' });
  const [filters, setFilters] = useState({ status: 'all', jobType: 'all' });

  const [applicantView, setApplicantView] = useState('pipeline');
  const [applicantSearch, setApplicantSearch] = useState('');
  const [applicantStageFilter, setApplicantStageFilter] = useState('all');
  const [showApplicantFilterMenu, setShowApplicantFilterMenu] = useState(false);
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [applicantPage, setApplicantPage] = useState(1);
  const [applicantItemsPerPage, setApplicantItemsPerPage] = useState(10);
  const [applicantSortConfig, setApplicantSortConfig] = useState({ key: 'candidateName', direction: 'asc' });

  const activeTab = getTabFromPath(location.pathname);

  const filteredJobs = useMemo(() => {
    const list = companyJobSectionJobs.filter((job) => {
      if (filters.status !== 'all' && job.status !== filters.status) return false;
      if (filters.jobType !== 'all' && job.jobType !== filters.jobType) return false;
      return true;
    });

    const sorted = [...list].sort((left, right) => {
      if (!sortConfig.key) return 0;

      const leftValue = left[sortConfig.key];
      const rightValue = right[sortConfig.key];

      const normalizedLeft = sortConfig.key.toLowerCase().includes('date') ? parseDisplayDate(leftValue) : leftValue;
      const normalizedRight = sortConfig.key.toLowerCase().includes('date') ? parseDisplayDate(rightValue) : rightValue;

      if (normalizedLeft < normalizedRight) return sortConfig.direction === 'asc' ? -1 : 1;
      if (normalizedLeft > normalizedRight) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filters, sortConfig]);

  const selectedJob = useMemo(() => {
    const fromRoute = companyJobSectionJobs.find((job) => job.id === routeJobId);
    return fromRoute || companyJobSectionJobs[0];
  }, [routeJobId]);

  const totalJobPages = Math.max(1, Math.ceil(filteredJobs.length / jobItemsPerPage));
  const safeJobCurrentPage = Math.min(jobCurrentPage, totalJobPages);
  const paginatedJobs = useMemo(() => {
    const startIndex = (safeJobCurrentPage - 1) * jobItemsPerPage;
    return filteredJobs.slice(startIndex, startIndex + jobItemsPerPage);
  }, [filteredJobs, safeJobCurrentPage, jobItemsPerPage]);

  const filteredApplicants = useMemo(() => {
    let list = [...selectedJob.applicantsData];

    if (applicantStageFilter !== 'all') {
      list = list.filter((applicant) => applicant.status === applicantStageFilter);
    }

    if (applicantSearch.trim()) {
      const query = applicantSearch.toLowerCase();
      list = list.filter((applicant) => {
        return (
          applicant.candidateName.toLowerCase().includes(query) ||
          applicant.candidateEmail.toLowerCase().includes(query) ||
          applicant.title.toLowerCase().includes(query)
        );
      });
    }

    return list.sort((left, right) => {
      const leftValue = left[applicantSortConfig.key];
      const rightValue = right[applicantSortConfig.key];
      const normalizedLeft = applicantSortConfig.key === 'score' ? Number(leftValue) : leftValue;
      const normalizedRight = applicantSortConfig.key === 'score' ? Number(rightValue) : rightValue;

      if (normalizedLeft < normalizedRight) return applicantSortConfig.direction === 'asc' ? -1 : 1;
      if (normalizedLeft > normalizedRight) return applicantSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [applicantSearch, applicantSortConfig, applicantStageFilter, selectedJob]);

  const totalApplicantPages = Math.max(1, Math.ceil(filteredApplicants.length / applicantItemsPerPage));
  const safeApplicantPage = Math.min(applicantPage, totalApplicantPages);
  const paginatedApplicants = useMemo(() => {
    const startIndex = (safeApplicantPage - 1) * applicantItemsPerPage;
    return filteredApplicants.slice(startIndex, startIndex + applicantItemsPerPage);
  }, [applicantItemsPerPage, filteredApplicants, safeApplicantPage]);

  const handleJobSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
    setJobCurrentPage(1);
  };

  const handleApplicantSort = (key) => {
    setApplicantSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
    setApplicantPage(1);
    setSelectedApplicants([]);
  };

  const handleSelectJob = (jobId, nextTab = activeTab) => {
    navigate(buildJobRoute(jobId, hasFocusedJob ? nextTab || 'detail' : 'detail'));
    setShowActionsMenu(null);
  };

  const toggleApplicantSelection = (applicantId) => {
    setSelectedApplicants((current) =>
      current.includes(applicantId)
        ? current.filter((idValue) => idValue !== applicantId)
        : [...current, applicantId],
    );
  };

  const toggleSelectVisibleApplicants = () => {
    if (paginatedApplicants.length === 0) return;
    const visibleIds = paginatedApplicants.map((applicant) => applicant.id);
    const isAllSelected = visibleIds.every((applicantId) => selectedApplicants.includes(applicantId));

    setSelectedApplicants((current) => {
      if (isAllSelected) {
        return current.filter((applicantId) => !visibleIds.includes(applicantId));
      }
      const next = new Set([...current, ...visibleIds]);
      return [...next];
    });
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[#f5f7fb]">
      <CompanyTopBar title="Job Listing" subtitle={`Here is your jobs listing status from ${dateRange}.`} />

      <div className="px-4 pb-8 pt-20 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-none space-y-8">
          {!hasFocusedJob ? (
            <section className="flex min-h-[calc(100vh-12rem)] flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Job List</h2>
                <p className="mt-1 text-sm text-slate-500">Monitor role status, hiring progress, and candidate activity in one place.</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowDatePicker((value) => !value)}
                    className="inline-flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"
                  >
                    <CalendarDaysIcon className="h-4 w-4" />
                    {dateRange}
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>

                  {showDatePicker ? (
                    <div className="absolute right-0 z-10 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                      {DATE_RANGE_OPTIONS.map((range) => (
                        <button
                          key={range}
                          type="button"
                          onClick={() => {
                            setDateRange(range);
                            setShowDatePicker(false);
                          }}
                          className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                            range === dateRange ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => setShowFilters((value) => !value)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
                >
                  <AdjustmentsHorizontalIcon className="h-4 w-4" />
                  Filters
                </button>
              </div>
            </div>

            {showFilters ? (
              <div className="grid gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Status</span>
                  <select
                    value={filters.status}
                    onChange={(event) => {
                      setFilters((current) => ({ ...current, status: event.target.value }));
                      setJobCurrentPage(1);
                    }}
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
                  >
                    {JOB_STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option === 'all' ? 'All Statuses' : option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Job Type</span>
                  <select
                    value={filters.jobType}
                    onChange={(event) => {
                      setFilters((current) => ({ ...current, jobType: event.target.value }));
                      setJobCurrentPage(1);
                    }}
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
                  >
                    {JOB_TYPE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option === 'all' ? 'All Types' : option}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      setFilters({ status: 'all', jobType: 'all' });
                      setJobCurrentPage(1);
                    }}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            ) : null}

            <div className="min-h-0 flex-1 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
                  <tr>
                    <th className="px-5 py-4 text-left font-semibold">
                      <button type="button" onClick={() => handleJobSort('title')} className="inline-flex items-center gap-1">
                        Roles
                        <ChevronDownIcon className={`h-4 w-4 transition ${sortConfig.key === 'title' && sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                      </button>
                    </th>
                    <th className="px-5 py-4 text-left font-semibold">
                      <button type="button" onClick={() => handleJobSort('status')} className="inline-flex items-center gap-1">
                        Status
                        <ChevronDownIcon className={`h-4 w-4 transition ${sortConfig.key === 'status' && sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                      </button>
                    </th>
                    <th className="px-5 py-4 text-left font-semibold">
                      <button type="button" onClick={() => handleJobSort('datePosted')} className="inline-flex items-center gap-1">
                        Date Posted
                        <ChevronDownIcon className={`h-4 w-4 transition ${sortConfig.key === 'datePosted' && sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                      </button>
                    </th>
                    <th className="px-5 py-4 text-left font-semibold">Due Date</th>
                    <th className="px-5 py-4 text-left font-semibold">Job Type</th>
                    <th className="px-5 py-4 text-left font-semibold">
                      <button type="button" onClick={() => handleJobSort('applications')} className="inline-flex items-center gap-1">
                        Applicants
                        <ChevronDownIcon className={`h-4 w-4 transition ${sortConfig.key === 'applications' && sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                      </button>
                    </th>
                    <th className="px-5 py-4 text-left font-semibold">Needs</th>
                    <th className="px-5 py-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedJobs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-16 text-center">
                        <p className="text-sm font-medium text-slate-500">No job listings match the current filters.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedJobs.map((job) => {
                      const isSelected = hasFocusedJob && selectedJob.id === job.id;
                      return (
                        <tr
                          key={job.id}
                          className={`cursor-pointer transition hover:bg-slate-50 ${isSelected ? 'bg-indigo-50/60' : ''}`}
                          onClick={() => handleSelectJob(job.id, activeTab)}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${job.color} text-sm font-semibold text-white shadow-sm`}>
                                {job.title.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-900">{job.title}</p>
                                <p className="truncate text-xs text-slate-500">{job.department} · {job.location}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(job.status)}`}>
                              {job.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-600">{job.datePosted}</td>
                          <td className="px-5 py-4 text-slate-600">{job.dueDate}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getJobTypeBadgeClasses(job.jobType)}`}>
                              {job.jobType}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-semibold text-slate-900">{formatNumber(job.applications)}</td>
                          <td className="px-5 py-4 font-medium text-slate-900">{job.hired} / {job.needed}</td>
                          <td className="relative px-5 py-4 text-right" onClick={(event) => event.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setShowActionsMenu((current) => (current === job.id ? null : job.id))}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-slate-400 hover:border-slate-200 hover:bg-white hover:text-slate-600"
                            >
                              <EllipsisHorizontalIcon className="h-5 w-5" />
                            </button>

                            {showActionsMenu === job.id ? (
                              <div className="absolute right-5 top-14 z-10 w-48 rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
                                <button
                                  type="button"
                                  onClick={() => handleSelectJob(job.id, 'detail')}
                                  className="block w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
                                >
                                  Open Job Details
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSelectJob(job.id, 'applicants')}
                                  className="block w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
                                >
                                  Open Applicants
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSelectJob(job.id, 'analytics')}
                                  className="block w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
                                >
                                  Open Analytics
                                </button>
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>View</span>
                <select
                  value={jobItemsPerPage}
                  onChange={(event) => {
                    setJobItemsPerPage(Number(event.target.value));
                    setJobCurrentPage(1);
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>jobs per page</span>
              </div>

              <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setJobCurrentPage((page) => Math.max(1, Math.min(page, totalJobPages) - 1))}
                    disabled={safeJobCurrentPage === 1}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40"
                  >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                {Array.from({ length: Math.min(totalJobPages, 5) }, (_, index) => {
                  let pageNumber = index + 1;
                  if (totalJobPages > 5) {
                    if (safeJobCurrentPage > 3 && safeJobCurrentPage < totalJobPages - 1) {
                      pageNumber = safeJobCurrentPage - 2 + index;
                    } else if (safeJobCurrentPage >= totalJobPages - 1) {
                      pageNumber = totalJobPages - 4 + index;
                    }
                  }
                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setJobCurrentPage(pageNumber)}
                      className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium ${
                        safeJobCurrentPage === pageNumber
                          ? 'bg-indigo-600 text-white'
                          : 'border border-slate-200 text-slate-600'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                  <button
                    type="button"
                    onClick={() => setJobCurrentPage((page) => Math.min(totalJobPages, Math.min(page, totalJobPages) + 1))}
                    disabled={safeJobCurrentPage === totalJobPages}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40"
                  >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            </section>
          ) : null}

          {hasFocusedJob ? (
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    onClick={() => navigate('/company/jobs')}
                    className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                    aria-label="Go back to job list"
                  >
                    <ArrowLeftIcon className="h-5 w-5" />
                  </button>
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${selectedJob.color} text-xl font-semibold text-white shadow-sm`}>
                    {selectedJob.title.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{selectedJob.title}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedJob.department} · {selectedJob.jobType} · {selectedJob.hired} / {selectedJob.needed} Hired
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedJob.categories.map((category) => (
                        <span key={category} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600">
                    More Action
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-6 border-b border-slate-200">
                <SectionTabLink to={buildJobRoute(selectedJob.id, 'applicants')} active={activeTab === 'applicants'}>
                  Applicants
                </SectionTabLink>
                <SectionTabLink to={buildJobRoute(selectedJob.id, 'detail')} active={activeTab === 'detail'}>
                  Job Details
                </SectionTabLink>
                <SectionTabLink to={buildJobRoute(selectedJob.id, 'analytics')} active={activeTab === 'analytics'}>
                  Analytics
                </SectionTabLink>
              </div>
            </div>

            <div className="bg-[#fbfcfe] p-5">
              {activeTab === 'detail' ? (
                <JobDetailsPanel job={selectedJob} />
              ) : null}

              {activeTab === 'analytics' ? (
                <AnalyticsPanel analytics={selectedJob.analytics} />
              ) : null}

              {activeTab === 'applicants' ? (
                <div className="space-y-5">
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Total Applicants: {filteredApplicants.length}</h3>
                        <p className="mt-1 text-sm text-slate-500">Review candidates by hiring stage or switch to a sortable table view.</p>
                      </div>

                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className="relative">
                          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={applicantSearch}
                          onChange={(event) => {
                            setApplicantSearch(event.target.value);
                            setApplicantPage(1);
                            setSelectedApplicants([]);
                          }}
                            placeholder="Search applicants"
                            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none lg:w-72"
                          />
                        </div>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowApplicantFilterMenu((value) => !value)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
                          >
                            <AdjustmentsHorizontalIcon className="h-4 w-4" />
                            {applicantStageFilter === 'all' ? 'All Stages' : applicantStageFilter}
                          </button>

                          {showApplicantFilterMenu ? (
                            <div className="absolute right-0 z-10 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
                              <button
                                type="button"
                                onClick={() => {
                                  setApplicantStageFilter('all');
                                  setShowApplicantFilterMenu(false);
                                  setApplicantPage(1);
                                  setSelectedApplicants([]);
                                }}
                                className={`block w-full px-4 py-2 text-left text-sm ${applicantStageFilter === 'all' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                              >
                                All Stages
                              </button>
                              {APPLICANT_STAGE_ORDER.map((stage) => (
                                <button
                                  key={stage}
                                  type="button"
                                  onClick={() => {
                                    setApplicantStageFilter(stage);
                                    setShowApplicantFilterMenu(false);
                                    setApplicantPage(1);
                                    setSelectedApplicants([]);
                                  }}
                                  className={`block w-full px-4 py-2 text-left text-sm ${
                                    applicantStageFilter === stage ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                                  }`}
                                >
                                  {stage}
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </div>

                        <div className="inline-flex overflow-hidden rounded-lg border border-slate-200 bg-white">
                          <button
                            type="button"
                            onClick={() => setApplicantView('pipeline')}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium ${
                              applicantView === 'pipeline' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
                            }`}
                          >
                            <Squares2X2Icon className="h-4 w-4" />
                            Pipeline View
                          </button>
                          <button
                            type="button"
                            onClick={() => setApplicantView('table')}
                            className={`inline-flex items-center gap-2 border-l border-slate-200 px-4 py-2.5 text-sm font-medium ${
                              applicantView === 'table' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
                            }`}
                          >
                            <TableCellsIcon className="h-4 w-4" />
                            Table View
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {applicantView === 'pipeline' ? (
                    <div className="grid gap-5 xl:grid-cols-4 md:grid-cols-2">
                      {APPLICANT_STAGE_ORDER.map((stage) => {
                        const stageApplicants = filteredApplicants.filter((applicant) => applicant.status === stage);
                        return (
                          <div key={stage} className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${stageColumnAccent[stage]}`}>
                            <div className="border-b border-slate-200 bg-slate-50 px-4 py-4">
                              <div className="flex items-center justify-between gap-3">
                                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${stageBadgeClasses[stage]}`}>
                                  {stage}
                                </span>
                                <span className="text-sm font-semibold text-slate-500">{stageApplicants.length}</span>
                              </div>
                            </div>

                            <div className="space-y-3 p-4">
                              {stageApplicants.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
                                  No applicants in this stage
                                </div>
                              ) : (
                                stageApplicants.map((applicant) => (
                                  <div key={applicant.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <div className="flex items-start gap-3">
                                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${getApplicantAvatarTone(applicant.candidateName)} text-sm font-semibold text-white`}>
                                        {getApplicantInitials(applicant.candidateName)}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="truncate font-semibold text-slate-900">{applicant.candidateName}</p>
                                        <p className="truncate text-xs text-indigo-600">View Profile</p>
                                      </div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                                      <span>Applied on</span>
                                      <span>{applicant.dateApplied}</span>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
                                      <span>Score</span>
                                      <ScoreCell value={applicant.score} />
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
                            <tr>
                              <th className="px-5 py-4 text-left">
                                <input
                                  type="checkbox"
                                  checked={paginatedApplicants.length > 0 && paginatedApplicants.every((applicant) => selectedApplicants.includes(applicant.id))}
                                  onChange={toggleSelectVisibleApplicants}
                                  className="h-4 w-4 rounded border-slate-300"
                                />
                              </th>
                              <th className="px-5 py-4 text-left font-semibold">
                                <button type="button" onClick={() => handleApplicantSort('candidateName')} className="inline-flex items-center gap-1">
                                  Full Name
                                  <ChevronDownIcon className={`h-4 w-4 transition ${applicantSortConfig.key === 'candidateName' && applicantSortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                                </button>
                              </th>
                              <th className="px-5 py-4 text-left font-semibold">
                                <button type="button" onClick={() => handleApplicantSort('score')} className="inline-flex items-center gap-1">
                                  Score
                                  <ChevronDownIcon className={`h-4 w-4 transition ${applicantSortConfig.key === 'score' && applicantSortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                                </button>
                              </th>
                              <th className="px-5 py-4 text-left font-semibold">
                                <button type="button" onClick={() => handleApplicantSort('status')} className="inline-flex items-center gap-1">
                                  Hiring Stage
                                  <ChevronDownIcon className={`h-4 w-4 transition ${applicantSortConfig.key === 'status' && applicantSortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                                </button>
                              </th>
                              <th className="px-5 py-4 text-left font-semibold">
                                <button type="button" onClick={() => handleApplicantSort('dateApplied')} className="inline-flex items-center gap-1">
                                  Applied Date
                                  <ChevronDownIcon className={`h-4 w-4 transition ${applicantSortConfig.key === 'dateApplied' && applicantSortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                                </button>
                              </th>
                              <th className="px-5 py-4 text-left font-semibold">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {paginatedApplicants.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="px-5 py-16 text-center">
                                  <p className="text-sm font-medium text-slate-500">No applicants match the current search and filter state.</p>
                                </td>
                              </tr>
                            ) : (
                              paginatedApplicants.map((applicant) => (
                                <tr key={applicant.id} className="hover:bg-slate-50">
                                  <td className="px-5 py-4">
                                    <input
                                      type="checkbox"
                                      checked={selectedApplicants.includes(applicant.id)}
                                      onChange={() => toggleApplicantSelection(applicant.id)}
                                      className="h-4 w-4 rounded border-slate-300"
                                    />
                                  </td>
                                  <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${getApplicantAvatarTone(applicant.candidateName)} text-sm font-semibold text-white`}>
                                        {getApplicantInitials(applicant.candidateName)}
                                      </div>
                                      <span className="font-medium text-slate-900">{applicant.candidateName}</span>
                                    </div>
                                  </td>
                                  <td className="px-5 py-4">
                                    <ScoreCell value={applicant.score} />
                                  </td>
                                  <td className="px-5 py-4">
                                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${stageBadgeClasses[applicant.status]}`}>
                                      {applicant.status}
                                    </span>
                                  </td>
                                  <td className="px-5 py-4 text-slate-600">{applicant.dateApplied}</td>
                                  <td className="px-5 py-4">
                                    <button type="button" className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
                                      See Application
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <span>View</span>
                          <select
                            value={applicantItemsPerPage}
                            onChange={(event) => {
                              setApplicantItemsPerPage(Number(event.target.value));
                              setApplicantPage(1);
                            }}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
                          >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                          </select>
                          <span>Applicants per page</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setApplicantPage((page) => Math.max(1, Math.min(page, totalApplicantPages) - 1))}
                            disabled={safeApplicantPage === 1}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40"
                          >
                            <ChevronLeftIcon className="h-5 w-5" />
                          </button>
                          {Array.from({ length: Math.min(totalApplicantPages, 5) }, (_, index) => {
                            let pageNumber = index + 1;
                            if (totalApplicantPages > 5) {
                              if (safeApplicantPage > 3 && safeApplicantPage < totalApplicantPages - 1) {
                                pageNumber = safeApplicantPage - 2 + index;
                              } else if (safeApplicantPage >= totalApplicantPages - 1) {
                                pageNumber = totalApplicantPages - 4 + index;
                              }
                            }
                            return (
                              <button
                                key={pageNumber}
                                type="button"
                                onClick={() => setApplicantPage(pageNumber)}
                                className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium ${
                                  safeApplicantPage === pageNumber
                                    ? 'bg-indigo-600 text-white'
                                    : 'border border-slate-200 text-slate-600'
                                }`}
                              >
                                {pageNumber}
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => setApplicantPage((page) => Math.min(totalApplicantPages, Math.min(page, totalApplicantPages) + 1))}
                            disabled={safeApplicantPage === totalApplicantPages}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40"
                          >
                            <ChevronRightIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
