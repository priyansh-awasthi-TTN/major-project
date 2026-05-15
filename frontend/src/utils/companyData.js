const DAY_MS = 24 * 60 * 60 * 1000;

export const JOB_DATE_FILTERS = [
  { value: 'all', label: 'All time' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

export const COMPANY_STAGE_OPTIONS = ['all', 'In Review', 'Assessment', 'Shortlisted', 'Interview', 'Interviewed', 'Offered', 'Hired', 'Declined'];

export function getInitials(value) {
  const cleaned = String(value || '').trim();
  if (!cleaned) return 'CO';
  return cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function getAvatarTone(seedValue) {
  const tones = [
    'bg-sky-500',
    'bg-violet-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
    'bg-indigo-500',
    'bg-pink-500',
  ];

  const seed = String(seedValue || 'company')
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0);

  return tones[seed % tones.length];
}

export function toDate(value) {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function startOfDay(value) {
  const date = toDate(value);
  if (!date) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

export function endOfDay(value) {
  const date = toDate(value);
  if (!date) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

export function normalizeDateRange(range) {
  const fallbackEnd = endOfDay(new Date());
  const fallbackStart = startOfDay(new Date(Date.now() - 6 * DAY_MS));

  const start = startOfDay(range?.start) || fallbackStart;
  const end = endOfDay(range?.end) || fallbackEnd;

  return start <= end
    ? { start, end }
    : { start: startOfDay(end), end: endOfDay(start) };
}

export function getPresetRange(filterValue) {
  if (!filterValue || filterValue === 'all') return null;

  const today = new Date();
  const end = endOfDay(today);
  const days = Number.parseInt(filterValue.replace('d', ''), 10);
  if (Number.isNaN(days)) return null;

  const start = startOfDay(new Date(today.getTime() - (days - 1) * DAY_MS));
  return { start, end };
}

export function isWithinRange(value, range) {
  if (!range) return true;
  const date = toDate(value);
  if (!date) return false;
  const normalizedRange = normalizeDateRange(range);
  return date >= normalizedRange.start && date <= normalizedRange.end;
}

export function formatShortDate(value) {
  const date = toDate(value);
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

export function formatFullDate(value) {
  const date = toDate(value);
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
}

export function formatDateTime(value) {
  const date = toDate(value);
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Number(value) || 0);
}

export function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return 'N/A';
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return String(value);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(numeric);
}

export function normalizeTags(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean);
  }

  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeJob(job) {
  const types = normalizeTags(job?.type);
  const createdAt = toDate(job?.createdAt);
  const applied = Number(job?.applied) || 0;

  return {
    ...job,
    createdAt,
    categories: normalizeTags(job?.categories),
    types,
    displayType: types.join(', ') || 'Not specified',
    status: job?.status || 'Live',
    applied,
    capacity: Number(job?.capacity) || 0,
    salaryLabel: formatCurrency(job?.salary),
    createdAtLabel: createdAt ? formatShortDate(createdAt) : 'N/A',
    initials: getInitials(job?.title || job?.company),
  };
}

export function normalizeApplication(application, jobsById = new Map()) {
  const job = jobsById.get(application?.jobId);
  const dateApplied = toDate(application?.dateApplied);
  const score = Number(application?.score);

  return {
    ...application,
    dateApplied,
    dateAppliedLabel: dateApplied ? formatFullDate(dateApplied) : 'N/A',
    score: Number.isNaN(score) ? 0 : score,
    stage: application?.status || 'In Review',
    candidateName: application?.candidateName || 'Unknown Candidate',
    jobTitle: application?.title || job?.title || 'Untitled Role',
    jobType: job?.displayType || normalizeTags(application?.type).join(', ') || 'Not specified',
    location: job?.location || application?.location || 'Not specified',
    avatarTone: getAvatarTone(application?.candidateName || application?.candidateEmail || application?.id),
  };
}

export function buildJobsById(jobs) {
  return new Map((jobs || []).map((job) => [job.id, job]));
}

export function filterJobs(jobs, options = {}) {
  const { search = '', status = 'all', jobType = 'all', range = null } = options;
  const query = String(search || '').trim().toLowerCase();

  return (jobs || []).filter((job) => {
    if (status !== 'all' && job.status !== status) return false;
    if (jobType !== 'all' && !job.displayType.toLowerCase().includes(String(jobType).toLowerCase())) return false;
    if (range && !isWithinRange(job.createdAt, range)) return false;

    if (!query) return true;

    return [
      job.title,
      job.company,
      job.location,
      job.displayType,
      ...(job.categories || []),
    ]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });
}

export function filterApplications(applications, options = {}) {
  const { search = '', stage = 'all', range = null } = options;
  const query = String(search || '').trim().toLowerCase();

  return (applications || []).filter((application) => {
    if (stage === 'Interview Stages') {
      if (!application.stage.includes('Interview')) return false;
    } else if (stage !== 'all' && application.stage !== stage) {
      return false;
    }
    if (range && !isWithinRange(application.dateApplied, range)) return false;

    if (!query) return true;

    return [
      application.candidateName,
      application.candidateEmail,
      application.jobTitle,
      application.jobType,
      application.location,
    ]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });
}

function startOfWeek(value) {
  const date = startOfDay(value);
  if (!date) return null;
  const offset = date.getDay();
  date.setDate(date.getDate() - offset);
  return startOfDay(date);
}

function startOfMonth(value) {
  const date = startOfDay(value);
  if (!date) return null;
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(value, count) {
  const date = startOfDay(value);
  date.setDate(date.getDate() + count);
  return date;
}

function addMonths(value, count) {
  const date = startOfMonth(value);
  date.setMonth(date.getMonth() + count);
  return date;
}

export function buildTimeBuckets(range) {
  const normalizedRange = normalizeDateRange(range);
  const totalDays = Math.max(1, Math.ceil((normalizedRange.end - normalizedRange.start) / DAY_MS));

  if (totalDays <= 14) {
    return Array.from({ length: totalDays }, (_, index) => {
      const bucketStart = addDays(normalizedRange.start, index);
      return {
        key: bucketStart.toISOString(),
        label: formatShortDate(bucketStart),
        start: startOfDay(bucketStart),
        end: endOfDay(bucketStart),
      };
    });
  }

  if (totalDays <= 90) {
    const buckets = [];
    let cursor = startOfWeek(normalizedRange.start);
    while (cursor <= normalizedRange.end) {
      const bucketStart = new Date(cursor);
      const bucketEnd = endOfDay(addDays(bucketStart, 6));
      buckets.push({
        key: bucketStart.toISOString(),
        label: formatShortDate(bucketStart),
        start: bucketStart,
        end: bucketEnd,
      });
      cursor = addDays(cursor, 7);
    }
    return buckets;
  }

  const buckets = [];
  let cursor = startOfMonth(normalizedRange.start);
  while (cursor <= normalizedRange.end) {
    const bucketStart = new Date(cursor);
    const bucketEnd = endOfDay(new Date(bucketStart.getFullYear(), bucketStart.getMonth() + 1, 0));
    buckets.push({
      key: bucketStart.toISOString(),
      label: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(bucketStart),
      start: bucketStart,
      end: bucketEnd,
    });
    cursor = addMonths(cursor, 1);
  }
  return buckets;
}

export function buildSeries(range, items, getDate) {
  return buildTimeBuckets(range).map((bucket) => ({
    ...bucket,
    value: items.filter((item) => {
      const date = toDate(getDate(item));
      return date && date >= bucket.start && date <= bucket.end;
    }).length,
  }));
}

export function parseJobDescription(description) {
  const source = String(description || '').trim();
  if (!source) {
    return {
      summary: '',
      responsibilities: [],
      qualifications: [],
      niceToHaves: [],
      requiredSkills: [],
      perks: [],
      raw: '',
    };
  }

  const sections = {
    summary: '',
    responsibilities: [],
    qualifications: [],
    niceToHaves: [],
    requiredSkills: [],
    perks: [],
    raw: source,
  };

  const patterns = [
    ['summary', 'Description:'],
    ['responsibilities', 'Responsibilities:'],
    ['qualifications', 'Who You Are:'],
    ['niceToHaves', 'Nice-To-Haves:'],
  ];

  patterns.forEach(([key, marker], index) => {
    const start = source.indexOf(marker);
    if (start === -1) return;

    const contentStart = start + marker.length;
    const nextMarker = patterns.slice(index + 1).map(([, value]) => source.indexOf(value, contentStart)).filter((value) => value >= 0);
    const requiredSkillsStart = source.indexOf('Required Skills:', contentStart);
    const perksStart = source.indexOf('Perks:', contentStart);
    const stopCandidates = [...nextMarker, requiredSkillsStart, perksStart].filter((value) => value >= 0);
    const contentEnd = stopCandidates.length > 0 ? Math.min(...stopCandidates) : source.length;
    const content = source.slice(contentStart, contentEnd).trim();

    if (key === 'summary') {
      sections.summary = content;
      return;
    }

    sections[key] = content
      .split('\n')
      .map((item) => item.replace(/^[\-\u2022]\s*/, '').trim())
      .filter(Boolean);
  });

  const requiredSkillsMatch = source.match(/Required Skills:\s*([^\n]+)/i);
  const perksMatch = source.match(/Perks:\s*([^\n]+)/i);
  sections.requiredSkills = requiredSkillsMatch ? normalizeTags(requiredSkillsMatch[1]) : [];
  sections.perks = perksMatch ? normalizeTags(perksMatch[1]) : [];

  if (!sections.summary && sections.raw) {
    sections.summary = sections.raw;
  }

  return sections;
}

export function buildStageCounts(applications) {
  return COMPANY_STAGE_OPTIONS.slice(1).map((stage) => ({
    stage,
    count: (applications || []).filter((application) => application.stage === stage).length,
  }));
}

export function buildDashboardMetrics(jobs, applications, unreadMessages, dateRange) {
  const scopedJobs = (jobs || []).filter((job) => isWithinRange(job.createdAt, dateRange));
  const scopedApplications = (applications || []).filter((application) => isWithinRange(application.dateApplied, dateRange));
  const applicationSeries = buildSeries(dateRange, scopedApplications, (item) => item.dateApplied);
  const jobSeries = buildSeries(dateRange, scopedJobs, (item) => item.createdAt);
  const stageCounts = buildStageCounts(applications);
  const totalApplicants = (applications || []).length;
  const openJobs = (jobs || []).filter((job) => job.status === 'Live').length;
  const reviewCount = (applications || []).filter((application) => application.stage === 'In Review').length;
  const interviewCount = (applications || []).filter((application) => application.stage.includes('Interview')).length;
  const latestJobs = [...(jobs || [])]
    .sort((left, right) => (right.createdAt?.getTime() || 0) - (left.createdAt?.getTime() || 0))
    .slice(0, 4);

  return {
    scopedJobs,
    scopedApplications,
    latestJobs,
    openJobs,
    totalApplicants,
    reviewCount,
    interviewCount,
    unreadMessages,
    applicationSeries,
    jobSeries,
    stageCounts,
  };
}

export function buildJobAnalytics(job, applications, dateRange = null) {
  const jobApplications = (applications || []).filter((application) => application.jobId === job?.id);
  const scopedApplications = dateRange
    ? jobApplications.filter((application) => isWithinRange(application.dateApplied, dateRange))
    : jobApplications;

  const fallbackRange = dateRange
    ? normalizeDateRange(dateRange)
    : normalizeDateRange({
        start: job?.createdAt || new Date(Date.now() - 29 * DAY_MS),
        end: new Date(),
      });

  return {
    totalApplicants: jobApplications.length,
    scopedApplicants: scopedApplications.length,
    stageCounts: buildStageCounts(jobApplications),
    series: buildSeries(fallbackRange, scopedApplications, (item) => item.dateApplied),
    latestApplicants: [...jobApplications]
      .sort((left, right) => (right.dateApplied?.getTime() || 0) - (left.dateApplied?.getTime() || 0))
      .slice(0, 5),
  };
}
