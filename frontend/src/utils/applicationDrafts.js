const LS_APPLICATION_DRAFTS = 'jh_application_drafts_v1';
const LS_SUBMITTED_APPLICATIONS = 'jh_submitted_applications_v1';

const TRACKED_FIELDS = [
  'fullName',
  'email',
  'phone',
  'currentRole',
  'linkedin',
  'portfolio',
  'coverLetter',
];

const TOTAL_TRACKED_ITEMS = TRACKED_FIELDS.length + 1;

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readStorage(key) {
  if (!canUseStorage()) return {};

  try {
    return JSON.parse(window.localStorage.getItem(key)) || {};
  } catch {
    return {};
  }
}

function writeStorage(key, value) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function getOwnerKey(user) {
  const identity = user?.id ?? user?.email;
  return identity == null ? '' : String(identity);
}

function getJobKey(jobId) {
  return String(jobId);
}

function normalizeText(value) {
  return typeof value === 'string' ? value : '';
}

function normalizeResume(resume) {
  if (!resume?.url) return null;

  return {
    url: resume.url,
    name: resume.name || 'Resume',
    uploadedAt: resume.uploadedAt || new Date().toISOString(),
  };
}

export function createApplicationBaseForm(user) {
  return {
    fullName: normalizeText(user?.fullName),
    email: normalizeText(user?.email),
    phone: '',
    currentRole: '',
    linkedin: '',
    portfolio: '',
    coverLetter: '',
  };
}

function normalizeForm(user, form = {}) {
  const base = createApplicationBaseForm(user);

  TRACKED_FIELDS.forEach((field) => {
    if (field in form) {
      base[field] = normalizeText(form[field]);
    }
  });

  return base;
}

export function hasMeaningfulApplicationDraft(user, draft) {
  if (!draft) return false;

  const base = createApplicationBaseForm(user);
  const form = normalizeForm(user, draft.form);

  const hasTypedValue = TRACKED_FIELDS.some((field) => {
    if (field === 'fullName' || field === 'email') {
      return form[field].trim() !== base[field].trim();
    }

    return Boolean(form[field].trim());
  });

  return hasTypedValue || Boolean(draft.resume?.url);
}

export function calculateApplicationDraftProgress(user, draft) {
  const form = normalizeForm(user, draft?.form);

  let completed = TRACKED_FIELDS.reduce((count, field) => {
    return count + (form[field].trim() ? 1 : 0);
  }, 0);

  if (draft?.resume?.url) {
    completed += 1;
  }

  return {
    completed,
    total: TOTAL_TRACKED_ITEMS,
    progress: Math.round((completed / TOTAL_TRACKED_ITEMS) * 100),
  };
}

export function getApplicationDraft(user, jobId) {
  const ownerKey = getOwnerKey(user);
  if (!ownerKey || jobId == null) return null;

  const drafts = readStorage(LS_APPLICATION_DRAFTS);
  return drafts[ownerKey]?.[getJobKey(jobId)] || null;
}

export function getApplicationDrafts(user) {
  const ownerKey = getOwnerKey(user);
  if (!ownerKey) return {};

  const drafts = readStorage(LS_APPLICATION_DRAFTS);
  return drafts[ownerKey] || {};
}

export function saveApplicationDraft(user, jobId, draft) {
  const ownerKey = getOwnerKey(user);
  if (!ownerKey || jobId == null) return;

  const drafts = readStorage(LS_APPLICATION_DRAFTS);
  const ownerDrafts = { ...(drafts[ownerKey] || {}) };

  ownerDrafts[getJobKey(jobId)] = {
    form: normalizeForm(user, draft.form),
    resume: normalizeResume(draft.resume),
    updatedAt: draft.updatedAt || new Date().toISOString(),
  };

  drafts[ownerKey] = ownerDrafts;
  writeStorage(LS_APPLICATION_DRAFTS, drafts);
}

export function clearApplicationDraft(user, jobId) {
  const ownerKey = getOwnerKey(user);
  if (!ownerKey || jobId == null) return;

  const drafts = readStorage(LS_APPLICATION_DRAFTS);
  if (!drafts[ownerKey]) return;

  const ownerDrafts = { ...drafts[ownerKey] };
  delete ownerDrafts[getJobKey(jobId)];

  if (Object.keys(ownerDrafts).length === 0) {
    delete drafts[ownerKey];
  } else {
    drafts[ownerKey] = ownerDrafts;
  }

  writeStorage(LS_APPLICATION_DRAFTS, drafts);
}

export function getSubmittedApplications(user) {
  const ownerKey = getOwnerKey(user);
  if (!ownerKey) return {};

  const submitted = readStorage(LS_SUBMITTED_APPLICATIONS);
  return submitted[ownerKey] || {};
}

export function getSubmittedApplicationIds(user) {
  return new Set(Object.keys(getSubmittedApplications(user)));
}

export function syncSubmittedApplications(user, applications = []) {
  const ownerKey = getOwnerKey(user);
  if (!ownerKey) return new Set();

  const submitted = readStorage(LS_SUBMITTED_APPLICATIONS);
  const nextSubmitted = {};

  applications.forEach((application) => {
    if (application?.jobId == null) return;

    nextSubmitted[getJobKey(application.jobId)] = {
      applicationId: application.id || null,
      status: application.status || 'In Review',
      submittedAt: application.createdAt || new Date().toISOString(),
    };
  });

  submitted[ownerKey] = nextSubmitted;
  writeStorage(LS_SUBMITTED_APPLICATIONS, submitted);

  return new Set(Object.keys(nextSubmitted));
}

export function markApplicationSubmitted(user, jobId, metadata = {}) {
  const ownerKey = getOwnerKey(user);
  if (!ownerKey || jobId == null) return;

  clearApplicationDraft(user, jobId);

  const submitted = readStorage(LS_SUBMITTED_APPLICATIONS);
  const ownerSubmitted = { ...(submitted[ownerKey] || {}) };

  ownerSubmitted[getJobKey(jobId)] = {
    status: metadata.status || 'In Review',
    submittedAt: metadata.submittedAt || new Date().toISOString(),
    applicationId: metadata.applicationId || null,
  };

  submitted[ownerKey] = ownerSubmitted;
  writeStorage(LS_SUBMITTED_APPLICATIONS, submitted);
}

export function buildApplicationProgressMap(user, jobIds, submittedIds = []) {
  const progressMap = {};
  if (!user) return progressMap;

  const drafts = getApplicationDrafts(user);
  const submitted = getSubmittedApplications(user);
  const submittedSet = new Set([
    ...Object.keys(submitted),
    ...submittedIds.map((jobId) => getJobKey(jobId)),
  ]);

  jobIds.forEach((jobId) => {
    const jobKey = getJobKey(jobId);

    if (submittedSet.has(jobKey)) {
      progressMap[jobKey] = {
        status: 'submitted',
        progress: 100,
        completed: TOTAL_TRACKED_ITEMS,
        total: TOTAL_TRACKED_ITEMS,
        summary: '100% completed',
        detail: 'Application submitted',
      };
      return;
    }

    const draft = drafts[jobKey];
    if (!hasMeaningfulApplicationDraft(user, draft)) return;

    const progress = calculateApplicationDraftProgress(user, draft);
    if (progress.progress <= 0) return;

    progressMap[jobKey] = {
      status: 'draft',
      ...progress,
      summary: `${progress.progress}% completed`,
      detail: `${progress.completed} of ${progress.total} completed`,
    };
  });

  return progressMap;
}
