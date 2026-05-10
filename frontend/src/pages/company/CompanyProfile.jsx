import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BriefcaseIcon,
  BuildingOffice2Icon,
  EnvelopeIcon,
  GlobeAltIcon,
  MapPinIcon,
  PencilSquareIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import CompanyTopBar from '../../components/CompanyTopBar';
import apiService from '../../services/api';
import {
  formatNumber,
  formatShortDate,
  getAvatarTone,
  getInitials,
  normalizeJob,
} from '../../utils/companyData';

function LoadingState() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
        <p className="mt-3 text-sm text-slate-500">Loading company profile...</p>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, href }) {
  const content = href
    ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="text-sm font-medium text-indigo-600">{value}</a>
    : <p className="text-sm font-medium text-slate-900">{value}</p>;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <div className="mt-2">{content}</div>
    </div>
  );
}

export default function CompanyProfile() {
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      setLoading(true);
      setError('');

      try {
        const [profileResponse, jobsResponse] = await Promise.all([
          apiService.getMyProfile(),
          apiService.getCompanyJobs(),
        ]);

        if (cancelled) return;

        setProfile(profileResponse);
        setJobs((jobsResponse || []).map(normalizeJob));
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || 'Failed to load company profile.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const liveJobs = useMemo(() => jobs.filter((job) => job.status === 'Live'), [jobs]);
  const companyName = profile?.fullName || 'Company Workspace';
  const avatarTone = useMemo(() => getAvatarTone(companyName), [companyName]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-1 flex-col bg-[#f5f7fb]">
        <CompanyTopBar title="Company Profile" subtitle="Loading company profile..." />
        <div className="px-6 pb-10 pt-20">
          <LoadingState />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[#f5f7fb]">
      <CompanyTopBar title="Company Profile" subtitle="Company information and open roles are now loaded from the backend." />
      <div className="px-6 pb-10 pt-20">
        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className={`flex h-20 w-20 items-center justify-center rounded-3xl text-2xl font-semibold text-white ${avatarTone}`}>
                  {getInitials(companyName)}
                </div>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{companyName}</h1>
                  <p className="mt-2 text-sm text-slate-500">{profile?.industry || 'Industry not set'} • {profile?.location || 'Location not set'}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                      {formatNumber(liveJobs.length)} live roles
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {profile?.companySize || 'Company size not set'}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to="/company/settings"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
              >
                <PencilSquareIcon className="h-4 w-4" />
                Edit company details
              </Link>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
              <h2 className="text-lg font-semibold text-slate-900">About</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                {profile?.description || 'No company description has been added yet.'}
              </p>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard icon={EnvelopeIcon} label="Email" value={profile?.email || 'Not set'} href={profile?.email ? `mailto:${profile.email}` : undefined} />
            <InfoCard
              icon={GlobeAltIcon}
              label="Website"
              value={profile?.website || 'Not set'}
              href={profile?.website ? (profile.website.startsWith('http') ? profile.website : `https://${profile.website}`) : undefined}
            />
            <InfoCard icon={MapPinIcon} label="Location" value={profile?.location || 'Not set'} />
            <InfoCard icon={BuildingOffice2Icon} label="Industry" value={profile?.industry || 'Not set'} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Hiring overview</p>
                    <p className="mt-1 text-xs text-slate-400">Profile and job information from the backend</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                    <UserGroupIcon className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Total roles</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{formatNumber(jobs.length)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Live roles</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{formatNumber(liveJobs.length)}</p>
                  </div>
                </div>
              </div>
            </aside>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Open positions</h2>
                  <p className="mt-1 text-sm text-slate-500">These jobs are coming directly from your company job data.</p>
                </div>
                <Link to="/company/jobs" className="text-sm font-semibold text-indigo-600">
                  View all
                </Link>
              </div>

              <div className="mt-6 grid gap-4">
                {liveJobs.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-sm text-slate-500">
                    No live job roles are available yet.
                  </div>
                ) : (
                  liveJobs.map((job) => (
                    <Link
                      key={job.id}
                      to={`/company/jobs/${job.id}/detail`}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-300"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-semibold text-white ${getAvatarTone(job.title)}`}>
                            {getInitials(job.title)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{job.title}</p>
                            <p className="mt-1 text-xs text-slate-500">{job.location || 'Location not set'} • {job.displayType}</p>
                          </div>
                        </div>
                        <div className="text-sm text-slate-500">
                          <p className="font-semibold text-slate-900">{formatNumber(job.applied)} applicants</p>
                          <p className="mt-1">Posted {formatShortDate(job.createdAt)}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {job.categories.map((category) => (
                          <span key={category} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                            {category}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                        <BriefcaseIcon className="h-4 w-4" />
                        {job.salaryLabel}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
