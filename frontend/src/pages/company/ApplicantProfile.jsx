import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  DocumentArrowDownIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  MapPinIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import CompanyTopBar from '../../components/CompanyTopBar';
import apiService from '../../services/api';
import { useToast } from '../../components/Toast';
import {
  buildJobsById,
  COMPANY_STAGE_OPTIONS,
  formatDateTime,
  formatFullDate,
  getInitials,
  normalizeApplication,
  normalizeJob,
} from '../../utils/companyData';

function LoadingState() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
        <p className="mt-3 text-sm text-slate-500">Loading applicant profile...</p>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, href }) {
  if (!value) return null;

  const content = href ? (
    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="text-sm text-indigo-600">
      {value}
    </a>
  ) : (
    <span className="text-sm text-slate-700">{value}</span>
  );

  return (
    <div className="flex gap-3">
      <div className="mt-0.5 text-slate-400">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <div className="mt-1">{content}</div>
      </div>
    </div>
  );
}

export default function ApplicantProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const applicationId = Number(id);
  const { showToast } = useToast();
  const [application, setApplication] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('In Review');

  useEffect(() => {
    let cancelled = false;

    const loadApplicant = async () => {
      setLoading(true);
      setError('');

      try {
        const [jobsResponse, applicationsResponse] = await Promise.all([
          apiService.getCompanyJobs(),
          apiService.getCompanyApplications(),
        ]);

        if (cancelled) return;

        const jobs = (jobsResponse || []).map(normalizeJob);
        const jobsById = buildJobsById(jobs);
        const applications = (applicationsResponse || []).map((item) => normalizeApplication(item, jobsById));
        const selectedApplication = applications.find((item) => item.id === applicationId);

        if (!selectedApplication) {
          throw new Error('Applicant not found');
        }

        const candidateProfile = await apiService.getNetworkUser(selectedApplication.candidateId);
        if (cancelled) return;

        setApplication(selectedApplication);
        setCandidate(candidateProfile);
        setStatus(selectedApplication.stage);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || 'Failed to load applicant.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadApplicant();
    return () => {
      cancelled = true;
    };
  }, [applicationId]);

  const candidateSkills = useMemo(() => candidate?.skills || [], [candidate?.skills]);
  const candidateExperiences = useMemo(() => candidate?.experiences || [], [candidate?.experiences]);
  const candidateEducations = useMemo(() => candidate?.educations || [], [candidate?.educations]);

  const handleStatusUpdate = async () => {
    if (!application || status === application.stage) return;

    setSaving(true);
    setError('');

    try {
      await apiService.updateCompanyApplicationStatus(application.id, status);
      setApplication((current) => current ? { ...current, stage: status, status } : current);
      showToast(`Status updated to ${status}.`, 'success');
    } catch (updateError) {
      const message = updateError.message || 'Failed to update applicant status.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const candidateName = candidate?.fullName || application?.candidateName || '';
  const stageLabel = application?.stage || '';
  const candidateEmail = candidate?.email || application?.candidateEmail || '';

  const handleMessageApplicant = () => {
    if (!application) return;
    const params = new URLSearchParams({
      user: String(application.candidateId),
      name: candidateName,
      email: candidateEmail,
      type: 'JOBSEEKER',
    });
    navigate(`/company/messages?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-1 flex-col bg-[#f5f7fb]">
        <CompanyTopBar title="Applicant Profile" subtitle="Loading applicant data..." />
        <div className="px-5 pb-12 pt-20 sm:px-6 lg:px-8">
          <LoadingState />
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex min-h-screen flex-1 flex-col bg-[#f5f7fb]">
        <CompanyTopBar title="Applicant Profile" subtitle="Requested applicant could not be found." />
        <div className="px-5 pb-12 pt-20 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-900">Applicant not found.</p>
            <Link
              to="/company/applicants"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to applicants
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[#f5f7fb]">
      <CompanyTopBar title="Applicant Profile" subtitle="Live data for the selected company application." />

      <div className="px-5 pb-12 pt-20 sm:px-6 lg:px-8">
        {error ? (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="space-y-6">
          <Link to="/company/applicants" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to applicants
          </Link>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-3xl text-xl font-semibold text-white ${application.avatarTone}`}>
                  {getInitials(candidateName)}
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900">{candidateName}</h1>
                  <p className="mt-1 text-sm text-slate-500">{candidate?.title || candidate?.currentPosition || application.jobTitle}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {stageLabel}
                    </span>
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                      Applied for {application.jobTitle}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Applied date</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{application.dateAppliedLabel}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Match score</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{application.score.toFixed(1)}</p>
                </div>
                <button
                  type="button"
                  onClick={handleMessageApplicant}
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Message applicant
                </button>
                <Link
                  to={`/company/seeker/${application.candidateId}`}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  View full profile
                </Link>
              </div>
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Candidate summary</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                  {candidate?.description || 'The candidate has not filled in an about section yet.'}
                </p>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Application details</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Role</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{application.jobTitle}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Job type</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{application.jobType}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Location</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{application.location}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Last loaded</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{formatDateTime(new Date())}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-slate-900">Cover letter</h3>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                    {application.coverLetter || 'No cover letter was submitted for this application.'}
                  </p>
                </div>
              </section>

              {candidateSkills.length > 0 ? (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">Skills</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {candidateSkills.map((skill) => (
                      <span key={skill} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}

              {candidateExperiences.length > 0 ? (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">Experience</h2>
                  <div className="mt-4 space-y-4">
                    {candidateExperiences.map((item, index) => (
                      <div key={`${item.title || item.company || 'experience'}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <p className="text-sm font-semibold text-slate-900">{item.title || 'Role not specified'}</p>
                        <p className="mt-1 text-sm text-slate-600">{item.company || 'Company not specified'}</p>
                        <p className="mt-1 text-xs text-slate-400">{item.startDate || 'N/A'} - {item.endDate || 'Present'}</p>
                        {item.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p> : null}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {candidateEducations.length > 0 ? (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">Education</h2>
                  <div className="mt-4 space-y-4">
                    {candidateEducations.map((item, index) => (
                      <div key={`${item.school || item.degree || 'education'}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <p className="text-sm font-semibold text-slate-900">{item.school || 'School not specified'}</p>
                        <p className="mt-1 text-sm text-slate-600">{item.degree || 'Degree not specified'}</p>
                        <p className="mt-1 text-xs text-slate-400">{item.startDate || 'N/A'} - {item.endDate || 'Present'}</p>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>

            <aside className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Contact</h2>
                <div className="mt-5 space-y-4">
                  <DetailRow icon={EnvelopeIcon} label="Email" value={candidate?.email || application.candidateEmail} href={`mailto:${candidate?.email || application.candidateEmail}`} />
                  <DetailRow icon={PhoneIcon} label="Phone" value={candidate?.phone} href={candidate?.phone ? `tel:${candidate.phone}` : null} />
                  <DetailRow icon={MapPinIcon} label="Location" value={candidate?.location || application.location} />
                  <DetailRow icon={GlobeAltIcon} label="Website" value={candidate?.website} href={candidate?.website?.startsWith('http') ? candidate.website : `https://${candidate?.website}`} />
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Application status</h2>
                <label className="mt-4 block">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Current stage</span>
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
                  >
                    {COMPANY_STAGE_OPTIONS.slice(1).map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={handleStatusUpdate}
                  disabled={saving || status === application.stage}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-indigo-300"
                >
                  {saving ? 'Saving...' : 'Update status'}
                </button>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Files</h2>
                <div className="mt-4 space-y-3">
                  {application.resumeUrl ? (
                    <a
                      href={apiService.resolveFileUrl(application.resumeUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                      <span className="flex items-center gap-2">
                        <DocumentArrowDownIcon className="h-5 w-5 text-slate-400" />
                        Resume
                      </span>
                      <span className="text-xs text-indigo-600">Open</span>
                    </a>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                      No resume uploaded.
                    </div>
                  )}

                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Application record</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">Created {formatFullDate(application.dateApplied)}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Quick facts</h2>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <span className="text-sm text-slate-600">Candidate profile</span>
                    <Link to={`/company/seeker/${application.candidateId}`} className="text-sm font-semibold text-indigo-600">
                      Open
                    </Link>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <span className="flex items-center gap-2 text-sm text-slate-600">
                      <BriefcaseIcon className="h-4 w-4" />
                      Role
                    </span>
                    <span className="text-sm font-semibold text-slate-900">{application.jobTitle}</span>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
