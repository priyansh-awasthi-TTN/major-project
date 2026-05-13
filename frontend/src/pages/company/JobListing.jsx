import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  AdjustmentsHorizontalIcon,
  ArrowLeftIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  TableCellsIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import CompanyTopBar from '../../components/CompanyTopBar';
import apiService from '../../services/api';
import {
  buildJobAnalytics,
  buildJobsById,
  COMPANY_STAGE_OPTIONS,
  filterApplications,
  filterJobs,
  formatCurrency,
  formatDateTime,
  formatFullDate,
  formatNumber,
  formatShortDate,
  getAvatarTone,
  getInitials,
  getPresetRange,
  JOB_DATE_FILTERS,
  normalizeApplication,
  normalizeJob,
  parseJobDescription,
} from '../../utils/companyData';

function getTabFromPath(pathname) {
  if (pathname.endsWith('/analytics')) return 'analytics';
  if (pathname.endsWith('/applicants')) return 'applicants';
  return 'detail';
}

function buildJobRoute(jobId, tab = 'detail', source = '') {
  let path;
  if (tab === 'analytics') path = `/company/jobs/${jobId}/analytics`;
  else if (tab === 'applicants') path = `/company/jobs/${jobId}/applicants`;
  else path = `/company/jobs/${jobId}/detail`;

  if (!source) return path;

  const params = new URLSearchParams({ from: source });
  return `${path}?${params.toString()}`;
}

function LoadingState() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
        <p className="mt-3 text-sm text-slate-500">Loading jobs...</p>
      </div>
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

function MetricCard({ icon: Icon, label, value, helper }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{formatNumber(value)}</p>
          {helper ? <p className="mt-1 text-xs text-slate-400">{helper}</p> : null}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function ApplicationsChart({ series }) {
  const maxValue = Math.max(1, ...series.map((item) => item.value));

  return (
    <div>
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${series.length || 1}, minmax(0, 1fr))` }}>
        {series.map((item) => (
          <div key={item.key} className="flex min-w-0 flex-col items-center gap-3">
            <div className="flex h-56 w-full items-end rounded-[28px] bg-slate-50 px-2 pb-3 pt-6">
              <div className="w-full rounded-t-[18px] bg-indigo-600" style={{ height: `${Math.max(12, (item.value / maxValue) * 100)}%` }} />
            </div>
            <span className="truncate text-xs font-medium text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApplicantCard({ application }) {
  return (
    <Link
      to={`/company/applicants/${application.id}`}
      className="block rounded-[18px] border border-slate-200 bg-white p-4 transition hover:border-indigo-300"
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold text-white ${application.avatarTone}`}>
          {getInitials(application.candidateName)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{application.candidateName}</p>
          <p className="truncate text-xs text-slate-500">{application.candidateEmail}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">{application.jobTitle}</p>
          <p className="mt-1 text-xs text-slate-400">{application.dateAppliedLabel}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
          {application.stage}
        </span>
      </div>
    </Link>
  );
}

function JobDetailsPanel({ job }) {
  const parsed = useMemo(() => parseJobDescription(job?.description), [job?.description]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_320px]">
      <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <section>
          <h3 className="text-lg font-semibold text-slate-900">Description</h3>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{parsed.summary || 'No description has been added yet.'}</p>
        </section>

        {parsed.responsibilities.length > 0 ? (
          <section>
            <h3 className="text-lg font-semibold text-slate-900">Responsibilities</h3>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
              {parsed.responsibilities.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </section>
        ) : null}

        {parsed.qualifications.length > 0 ? (
          <section>
            <h3 className="text-lg font-semibold text-slate-900">Who You Are</h3>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
              {parsed.qualifications.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </section>
        ) : null}

        {parsed.niceToHaves.length > 0 ? (
          <section>
            <h3 className="text-lg font-semibold text-slate-900">Nice-To-Haves</h3>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
              {parsed.niceToHaves.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </section>
        ) : null}
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">About this role</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-slate-500">Status</dt>
              <dd className="font-medium text-slate-900">{job.status}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-slate-500">Date posted</dt>
              <dd className="font-medium text-slate-900">{job.createdAt ? formatFullDate(job.createdAt) : 'N/A'}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-slate-500">Type</dt>
              <dd className="font-medium text-slate-900">{job.displayType}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-slate-500">Salary</dt>
              <dd className="font-medium text-slate-900">{job.salaryLabel}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Categories</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(job.categories || []).length === 0 ? (
              <span className="text-sm text-slate-500">No categories set.</span>
            ) : (
              job.categories.map((category) => (
                <span key={category} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                  {category}
                </span>
              ))
            )}
          </div>
        </div>

        {(parsed.requiredSkills.length > 0 || parsed.perks.length > 0) ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            {parsed.requiredSkills.length > 0 ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Required Skills</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {parsed.requiredSkills.map((skill) => (
                    <span key={skill} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                      {skill}
                    </span>
                  ))}
                </div>
              </>
            ) : null}

            {parsed.perks.length > 0 ? (
              <>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Perks</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {parsed.perks.map((perk) => (
                    <span key={perk} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                      {perk}
                    </span>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </aside>
    </div>
  );
}

export default function JobListing() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const routeJobId = Number(id);
  const hasFocusedJob = Number.isFinite(routeJobId) && routeJobId > 0;

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ status: 'all', jobType: 'all' });
  const [jobCurrentPage, setJobCurrentPage] = useState(1);
  const [jobItemsPerPage, setJobItemsPerPage] = useState(10);

  const [applicantView, setApplicantView] = useState('table');
  const [applicantSearch, setApplicantSearch] = useState('');
  const [applicantStageFilter, setApplicantStageFilter] = useState('all');
  const [applicantPage, setApplicantPage] = useState(1);
  const [applicantItemsPerPage, setApplicantItemsPerPage] = useState(10);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
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
          setError(loadError.message || 'Failed to load job listings.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeTab = getTabFromPath(location.pathname);
  const visitSource = useMemo(() => new URLSearchParams(location.search).get('from') || '', [location.search]);
  const isFromDashboard = visitSource === 'dashboard';
  const dateRange = useMemo(() => getPresetRange(dateFilter), [dateFilter]);
  const filteredJobs = useMemo(
    () => filterJobs(jobs, { search, status: filters.status, jobType: filters.jobType, range: dateRange }),
    [dateRange, filters.jobType, filters.status, jobs, search],
  );

  const selectedJob = useMemo(() => {
    if (!hasFocusedJob) return null;
    return jobs.find((job) => job.id === routeJobId) || null;
  }, [hasFocusedJob, jobs, routeJobId]);

  const jobTypeOptions = useMemo(() => {
    const unique = [...new Set(jobs.flatMap((job) => job.types || []).filter(Boolean))];
    return ['all', ...unique];
  }, [jobs]);

  const totalJobPages = Math.max(1, Math.ceil(filteredJobs.length / jobItemsPerPage));
  const safeJobCurrentPage = Math.min(jobCurrentPage, totalJobPages);
  const paginatedJobs = useMemo(() => {
    const startIndex = (safeJobCurrentPage - 1) * jobItemsPerPage;
    return filteredJobs.slice(startIndex, startIndex + jobItemsPerPage);
  }, [filteredJobs, jobItemsPerPage, safeJobCurrentPage]);

  const selectedJobApplications = useMemo(
    () => applications.filter((application) => application.jobId === selectedJob?.id),
    [applications, selectedJob?.id],
  );

  const filteredApplicants = useMemo(
    () => filterApplications(selectedJobApplications, { search: applicantSearch, stage: applicantStageFilter }),
    [applicantSearch, applicantStageFilter, selectedJobApplications],
  );

  const totalApplicantPages = Math.max(1, Math.ceil(filteredApplicants.length / applicantItemsPerPage));
  const safeApplicantPage = Math.min(applicantPage, totalApplicantPages);
  const paginatedApplicants = useMemo(() => {
    const startIndex = (safeApplicantPage - 1) * applicantItemsPerPage;
    return filteredApplicants.slice(startIndex, startIndex + applicantItemsPerPage);
  }, [applicantItemsPerPage, filteredApplicants, safeApplicantPage]);

  const analytics = useMemo(() => buildJobAnalytics(selectedJob, selectedJobApplications), [selectedJob, selectedJobApplications]);

  useEffect(() => {
    setJobCurrentPage(1);
  }, [search, filters.status, filters.jobType, dateFilter]);

  useEffect(() => {
    setApplicantPage(1);
  }, [applicantSearch, applicantStageFilter, applicantView]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-1 flex-col bg-[#f5f7fb]">
        <CompanyTopBar title="Job Listing" subtitle="Loading company jobs..." />
        <div className="px-4 pb-8 pt-20 sm:px-6 lg:px-8">
          <LoadingState />
        </div>
      </div>
    );
  }

  if (hasFocusedJob && !selectedJob) {
    return (
      <div className="flex min-h-screen flex-1 flex-col bg-[#f5f7fb]">
        <CompanyTopBar title="Job Listing" subtitle="Requested job could not be found." />
        <div className="px-4 pb-8 pt-20 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-900">This job is no longer available.</p>
            <button
              type="button"
              onClick={() => navigate(isFromDashboard ? '/company/dashboard' : '/company/jobs')}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              {isFromDashboard ? 'Back to dashboard' : 'Back to job list'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[#f5f7fb]">
      <CompanyTopBar
        title={hasFocusedJob ? selectedJob.title : 'Job Listing'}
        subtitle={hasFocusedJob ? 'Backend-driven job details, applicants, and analytics.' : 'Every listing and filter is now driven from backend data.'}
      />

      <div className="px-4 pb-8 pt-20 sm:px-6 lg:px-8">
        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {!hasFocusedJob ? (
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Job List</h2>
                <p className="mt-1 text-sm text-slate-500">Search, filter, and review jobs posted from this company account.</p>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative w-full lg:w-80">
                  <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search jobs by title, location, category"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-indigo-400"
                  />
                </div>

                <select
                  value={dateFilter}
                  onChange={(event) => setDateFilter(event.target.value)}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                >
                  {JOB_DATE_FILTERS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>

                <button
                  type="button"
                  onClick={() => setShowFilters((current) => !current)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700"
                >
                  <AdjustmentsHorizontalIcon className="h-4 w-4" />
                  Filters
                </button>
              </div>
            </div>

            {showFilters ? (
              <div className="grid gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 md:grid-cols-3">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Status</span>
                  <select
                    value={filters.status}
                    onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
                  >
                    <option value="all">All statuses</option>
                    <option value="Live">Live</option>
                    <option value="Closed">Closed</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Job Type</span>
                  <select
                    value={filters.jobType}
                    onChange={(event) => setFilters((current) => ({ ...current, jobType: event.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
                  >
                    {jobTypeOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All job types' : option}</option>)}
                  </select>
                </label>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      setFilters({ status: 'all', jobType: 'all' });
                      setDateFilter('all');
                      setSearch('');
                    }}
                    className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white"
                  >
                    Reset filters
                  </button>
                </div>
              </div>
            ) : null}

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
                  <tr>
                    <th className="px-5 py-4 text-left font-semibold">Role</th>
                    <th className="px-5 py-4 text-left font-semibold">Status</th>
                    <th className="px-5 py-4 text-left font-semibold">Date Posted</th>
                    <th className="px-5 py-4 text-left font-semibold">Job Type</th>
                    <th className="px-5 py-4 text-left font-semibold">Applicants</th>
                    <th className="px-5 py-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedJobs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <p className="text-sm font-medium text-slate-500">No jobs match the current search and filter state.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedJobs.map((job) => (
                      <tr key={job.id} className="transition hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <Link to={buildJobRoute(job.id, 'detail')} className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold text-white ${getAvatarTone(job.title)}`}>
                              {getInitials(job.title)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">{job.title}</p>
                              <p className="truncate text-xs text-slate-500">{job.location || 'Location not set'}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${job.status === 'Live' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-600">{job.createdAt ? formatFullDate(job.createdAt) : 'N/A'}</td>
                        <td className="px-5 py-4 text-slate-600">{job.displayType}</td>
                        <td className="px-5 py-4 font-semibold text-slate-900">{formatNumber(job.applied)}</td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            to={buildJobRoute(job.id, 'detail')}
                            className="inline-flex rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            Open
                          </Link>
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
                  onClick={() => setJobCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={safeJobCurrentPage === 1}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <span className="px-3 text-sm font-medium text-slate-700">
                  {safeJobCurrentPage} / {totalJobPages}
                </span>
                <button
                  type="button"
                  onClick={() => setJobCurrentPage((page) => Math.min(totalJobPages, page + 1))}
                  disabled={safeJobCurrentPage === totalJobPages}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-5">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex flex-col gap-4">
                  {isFromDashboard ? (
                    <div>
                      <button
                        type="button"
                        onClick={() => navigate('/company/dashboard')}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white"
                        aria-label="Go back to dashboard"
                      >
                        <ArrowLeftIcon className="h-5 w-5" />
                        <span>Back to dashboard</span>
                      </button>
                    </div>
                  ) : null}

                  <div className="flex items-start gap-4">
                    {!isFromDashboard ? (
                      <button
                        type="button"
                        onClick={() => navigate('/company/jobs')}
                        className="mt-0.5 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                        aria-label="Go back to job list"
                      >
                        <ArrowLeftIcon className="h-5 w-5" />
                        <span>Back to job list</span>
                      </button>
                    ) : null}
                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl text-xl font-semibold text-white ${getAvatarTone(selectedJob.title)}`}>
                      {getInitials(selectedJob.title)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{selectedJob.title}</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {selectedJob.location || 'Location not set'} • {selectedJob.displayType}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(selectedJob.categories || []).map((category) => (
                          <span key={category} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right text-sm text-slate-500">
                  <p>Posted {selectedJob.createdAt ? formatShortDate(selectedJob.createdAt) : 'N/A'}</p>
                  <p className="mt-1 font-semibold text-slate-900">{formatNumber(selectedJob.applied)} applicants</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-6 border-b border-slate-200">
                <SectionTabLink to={buildJobRoute(selectedJob.id, 'applicants', visitSource)} active={activeTab === 'applicants'}>
                  Applicants
                </SectionTabLink>
                <SectionTabLink to={buildJobRoute(selectedJob.id, 'detail', visitSource)} active={activeTab === 'detail'}>
                  Job Details
                </SectionTabLink>
                <SectionTabLink to={buildJobRoute(selectedJob.id, 'analytics', visitSource)} active={activeTab === 'analytics'}>
                  Analytics
                </SectionTabLink>
              </div>
            </div>

            <div className="bg-[#fbfcfe] p-5">
              {activeTab === 'detail' ? <JobDetailsPanel job={selectedJob} /> : null}

              {activeTab === 'analytics' ? (
                <div className="space-y-6">
                  <div className="grid gap-4 xl:grid-cols-4">
                    <MetricCard icon={UsersIcon} label="Total applicants" value={analytics.totalApplicants} helper="All applicants received" />
                    <MetricCard icon={DocumentTextIcon} label="In review" value={analytics.stageCounts.find((item) => item.stage === 'In Review')?.count || 0} />
                    <MetricCard icon={CalendarDaysIcon} label="Interview stages" value={analytics.stageCounts.filter((item) => item.stage.includes('Interview')).reduce((sum, item) => sum + item.count, 0)} />
                    <MetricCard icon={BriefcaseIcon} label="Hired" value={analytics.stageCounts.find((item) => item.stage === 'Hired')?.count || 0} />
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_320px]">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-slate-900">Application trend</h3>
                          <p className="mt-1 text-sm text-slate-500">Application volume over the selected job lifetime.</p>
                        </div>
                      </div>

                      <div className="mt-6">
                        <ApplicationsChart series={analytics.series} />
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <h3 className="text-base font-semibold text-slate-900">Stage breakdown</h3>
                      <div className="mt-5 space-y-4">
                        {analytics.stageCounts.map((entry) => {
                          const width = analytics.totalApplicants > 0 ? (entry.count / analytics.totalApplicants) * 100 : 0;
                          return (
                            <div key={entry.stage}>
                              <div className="flex items-center justify-between gap-4 text-sm">
                                <span className="font-medium text-slate-700">{entry.stage}</span>
                                <span className="text-slate-500">{formatNumber(entry.count)}</span>
                              </div>
                              <div className="mt-2 h-2 rounded-full bg-slate-100">
                                <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${width}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {activeTab === 'applicants' ? (
                <div className="space-y-5">
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Applicants for this role</h3>
                        <p className="mt-1 text-sm text-slate-500">Search by candidate name, email, or role and switch views as needed.</p>
                      </div>

                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className="relative lg:w-80">
                          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={applicantSearch}
                            onChange={(event) => setApplicantSearch(event.target.value)}
                            placeholder="Search applicants"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-indigo-400"
                          />
                        </div>

                        <select
                          value={applicantStageFilter}
                          onChange={(event) => setApplicantStageFilter(event.target.value)}
                          className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                        >
                          {COMPANY_STAGE_OPTIONS.map((option) => (
                            <option key={option} value={option}>{option === 'all' ? 'All stages' : option}</option>
                          ))}
                        </select>

                        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
                          <button
                            type="button"
                            onClick={() => setApplicantView('table')}
                            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${applicantView === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
                          >
                            <TableCellsIcon className="h-4 w-4" />
                            Table
                          </button>
                          <button
                            type="button"
                            onClick={() => setApplicantView('pipeline')}
                            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${applicantView === 'pipeline' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
                          >
                            <Squares2X2Icon className="h-4 w-4" />
                            Pipeline
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {applicantView === 'table' ? (
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
                            <tr>
                              <th className="px-5 py-4 text-left font-semibold">Candidate</th>
                              <th className="px-5 py-4 text-left font-semibold">Applied</th>
                              <th className="px-5 py-4 text-left font-semibold">Stage</th>
                              <th className="px-5 py-4 text-left font-semibold">Score</th>
                              <th className="px-5 py-4 text-right font-semibold">Profile</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {paginatedApplicants.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="px-5 py-16 text-center">
                                  <p className="text-sm font-medium text-slate-500">No applicants match the current search and filter state.</p>
                                </td>
                              </tr>
                            ) : (
                              paginatedApplicants.map((application) => (
                                <tr key={application.id}>
                                  <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold text-white ${application.avatarTone}`}>
                                        {getInitials(application.candidateName)}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="truncate font-semibold text-slate-900">{application.candidateName}</p>
                                        <p className="truncate text-xs text-slate-500">{application.candidateEmail}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-5 py-4 text-slate-600">{application.dateAppliedLabel}</td>
                                  <td className="px-5 py-4">
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                      {application.stage}
                                    </span>
                                  </td>
                                  <td className="px-5 py-4 text-slate-600">{application.score.toFixed(1)}</td>
                                  <td className="px-5 py-4 text-right">
                                    <Link
                                      to={`/company/applicants/${application.id}`}
                                      className="inline-flex rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                    >
                                      Open
                                    </Link>
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
                          <span>applicants per page</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setApplicantPage((page) => Math.max(1, page - 1))}
                            disabled={safeApplicantPage === 1}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40"
                          >
                            <ChevronLeftIcon className="h-5 w-5" />
                          </button>
                          <span className="px-3 text-sm font-medium text-slate-700">
                            {safeApplicantPage} / {totalApplicantPages}
                          </span>
                          <button
                            type="button"
                            onClick={() => setApplicantPage((page) => Math.min(totalApplicantPages, page + 1))}
                            disabled={safeApplicantPage === totalApplicantPages}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40"
                          >
                            <ChevronRightIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4 xl:grid-cols-3">
                      {COMPANY_STAGE_OPTIONS.slice(1).map((stage) => {
                        const stageApplicants = filteredApplicants.filter((application) => application.stage === stage);

                        return (
                          <div key={stage} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-3">
                              <h4 className="text-sm font-semibold text-slate-900">{stage}</h4>
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                                {formatNumber(stageApplicants.length)}
                              </span>
                            </div>

                            <div className="space-y-3">
                              {stageApplicants.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-xs text-slate-500">
                                  No applicants in this stage.
                                </div>
                              ) : (
                                stageApplicants.map((application) => <ApplicantCard key={application.id} application={application} />)
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
