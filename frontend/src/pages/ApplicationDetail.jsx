import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DashTopBar from '../components/DashTopBar';
import { useToast } from '../components/Toast';
import apiService from '../services/api';

const statusStyle = {
  'In Review': 'border border-yellow-300 bg-yellow-50 text-yellow-700',
  'Interviewing': 'border border-orange-300 bg-orange-50 text-orange-700',
  'Assessment': 'border border-blue-300 bg-blue-50 text-blue-700',
  'Offered': 'border border-purple-300 bg-purple-50 text-purple-700',
  'Hired': 'border border-green-300 bg-green-50 text-green-700',
  'Unsuitable': 'border border-red-300 bg-red-50 text-red-700',
  'Shortlisted': 'border border-cyan-300 bg-cyan-50 text-cyan-700',
};

const statusCopy = {
  'In Review': 'Your application has been submitted and is currently being reviewed by the employer.',
  'Interviewing': 'You have moved into the interview stage. Keep an eye on messages and scheduling updates.',
  'Assessment': 'The company expects an assessment or screening step before the next round.',
  'Offered': 'An offer has been extended for this application. Review the details before responding.',
  'Hired': 'This application has been marked as hired.',
  'Unsuitable': 'The employer decided not to move forward with this application.',
  'Shortlisted': 'You have been shortlisted and may hear from the recruiter soon.',
};

function formatDate(value) {
  if (!value) return 'N/A';

  let date;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    date = new Date(year, month - 1, day);
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function normalizeCategories(categories) {
  if (Array.isArray(categories)) return categories;
  if (typeof categories !== 'string') return [];

  return categories
    .split(',')
    .map((category) => category.trim())
    .filter(Boolean);
}

export default function ApplicationDetail() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [application, setApplication] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadApplication = async () => {
      setLoading(true);
      setError(null);

      try {
        const applications = await apiService.getApplications();
        const match = (applications || []).find((item) => String(item.id) === String(applicationId));

        if (!match) {
          throw new Error('The selected application could not be found.');
        }

        if (cancelled) return;
        setApplication(match);

        if (match.jobId) {
          try {
            const jobData = await apiService.getJob(match.jobId);
            if (!cancelled) setJob(jobData);
          } catch {
            if (!cancelled) setJob(null);
          }
        } else if (!cancelled) {
          setJob(null);
        }
      } catch (loadError) {
        if (cancelled) return;

        const message = loadError?.message || 'Failed to load application details.';
        setError(message);
        showToast('Failed to load application details', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadApplication();

    return () => {
      cancelled = true;
    };
  }, [applicationId, showToast]);

  const categories = useMemo(() => normalizeCategories(job?.categories), [job?.categories]);
  const resumeUrl = application?.resumeUrl ? apiService.resolveFileUrl(application.resumeUrl) : '';
  const topBar = (
    <DashTopBar>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button onClick={() => navigate(-1)} className="hover:text-blue-600">← Back</button>
      </div>
    </DashTopBar>
  );

  if (loading) {
    return (
      <div className="flex-1 flex flex-col h-full bg-gray-50">
        {topBar}
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="flex-1 flex flex-col h-full bg-gray-50">
        {topBar}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Not Found</h1>
            <p className="text-gray-500 mb-5">{error || 'The requested application is unavailable.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const jobTitle = application.title || job?.title || 'Untitled Role';
  const companyName = application.company || job?.company || 'Unknown Company';
  const location = application.location || job?.location || 'Location not shared';
  const type = application.type || job?.type || 'Not specified';
  const salary = application.salary || (job?.salary ? `$${job.salary.toLocaleString()}` : 'Not shared');
  const applicationStatus = application.status || 'In Review';
  const hasJobPosting = Boolean(application.jobId);

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {topBar}
      <div className="overflow-y-auto flex-1">
        <div className="max-w-6xl mx-auto px-8 py-8 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className={`${application.color || 'bg-blue-600'} text-white rounded-2xl w-16 h-16 flex items-center justify-center font-bold text-xl flex-shrink-0`}>
                  {application.logo || companyName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  {hasJobPosting ? (
                    <h1 className="text-2xl font-bold">
                      <Link
                        to={`/dashboard/jobs/${application.jobId}`}
                        className="text-gray-900 transition-colors hover:text-blue-600 hover:underline underline-offset-4 focus:outline-none focus-visible:text-blue-600 focus-visible:underline"
                      >
                        {jobTitle}
                      </Link>
                    </h1>
                  ) : (
                    <h1 className="text-2xl font-bold text-gray-900">{jobTitle}</h1>
                  )}
                  <p className="text-gray-500 mt-1">{companyName} • {location}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="text-xs border border-gray-200 text-gray-600 rounded-full px-3 py-1">{type}</span>
                    <span className={`text-xs rounded-full px-3 py-1 font-medium ${statusStyle[applicationStatus] || 'border border-gray-200 bg-gray-50 text-gray-700'}`}>
                      {applicationStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Summary</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Application ID</p>
                    <p className="font-semibold text-gray-900">#{application.id}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Date Applied</p>
                    <p className="font-semibold text-gray-900">{formatDate(application.dateApplied)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Employment Type</p>
                    <p className="font-semibold text-gray-900">{type}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Salary</p>
                    <p className="font-semibold text-gray-900">{salary}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Submitted Materials</h2>
                <div className="space-y-4">
                  {resumeUrl ? (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">Resume</p>
                        <p className="text-sm text-gray-500">Attached to this application</p>
                      </div>
                      <div className="flex gap-3">
                        <a
                          href={resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Preview
                        </a>
                        <a
                          href={resumeUrl}
                          download
                          className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-500">
                      No resume file is attached to this application.
                    </div>
                  )}

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-medium text-gray-900 mb-2">Cover Letter</h3>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {application.coverLetter || 'No cover letter was submitted for this application.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Snapshot</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Company</p>
                      <p className="font-semibold text-gray-900">{companyName}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Location</p>
                      <p className="font-semibold text-gray-900">{location}</p>
                    </div>
                  </div>

                  {job?.description ? (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{job.description}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Job description details are not available for this posting.</p>
                  )}

                  {categories.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Categories</h3>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                          <span key={category} className="text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded-full px-3 py-1">
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h2>
                <span className={`inline-flex text-xs rounded-full px-3 py-1 font-medium ${statusStyle[applicationStatus] || 'border border-gray-200 bg-gray-50 text-gray-700'}`}>
                  {applicationStatus}
                </span>
                <p className="text-sm text-gray-600 mt-4">
                  {statusCopy[applicationStatus] || 'This application is active in your history.'}
                </p>

                <div className="mt-6 space-y-4">
                  <div className="flex gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-600 mt-1.5"></div>
                    <div>
                      <p className="font-medium text-gray-900">Application Submitted</p>
                      <p className="text-sm text-gray-500">{formatDate(application.dateApplied)}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-3 h-3 rounded-full bg-gray-300 mt-1.5"></div>
                    <div>
                      <p className="font-medium text-gray-900">Current Stage</p>
                      <p className="text-sm text-gray-500">{applicationStatus}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Notes</h2>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {application.note || 'No private notes were saved for this application.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
