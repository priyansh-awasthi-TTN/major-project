import { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { getCompanyRouteId } from '../data/discoveryData';
import { useAuth } from '../context/AuthContext';
import ApplicationModal from '../components/ApplicationModal';
import ShareModal from '../components/ShareModal';
import apiService from '../services/api';

const normalizeDelimitedList = (value) => {
  if (Array.isArray(value)) return value;
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const splitLines = (text) => {
  if (!text) return null;
  const items = String(text)
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length ? items : null;
};

const splitCommas = (text) => {
  if (!text) return null;
  const items = String(text)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length ? items : null;
};

const parseDescriptionSections = (description) => {
  const sections = {};
  const blocks = String(description || '')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  blocks.forEach((block) => {
    const match = block.match(/^([A-Za-z\s-]+):\s*/);
    if (match) {
      const key = match[1].trim();
      const value = block.slice(match[0].length).trim();
      if (value) {
        sections[key] = value;
      }
    } else if (block) {
      sections.Description = sections.Description ? `${sections.Description}\n\n${block}` : block;
    }
  });

  return sections;
};

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadedJobId, setLoadedJobId] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    let active = true;
    const requestedId = String(id);

    setLoading(true);
    setHasApplied(false);

    Promise.all([
      apiService.getJob(id),
      user ? apiService.checkApplicationStatus(id).catch(() => ({ applied: false })) : Promise.resolve({ applied: false }),
    ])
      .then(([jobData, applicationStatus]) => {
        if (active) {
          setJob(jobData);
          setHasApplied(Boolean(applicationStatus?.applied));
        }
      })
      .catch(() => {
        if (active) {
          setJob(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoadedJobId(requestedId);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id, user]);

  const handleApply = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowModal(true);
  };

  if (loading || loadedJobId !== String(id)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-lg font-semibold">Job not found</p>
          <p className="text-sm mt-1">This job may have been removed.</p>
          <button onClick={() => navigate('/find-jobs')} className="mt-4 text-sm text-blue-600 hover:underline">Back to jobs</button>
        </div>
      </div>
    );
  }

  const companyProfileHref = `/companies/${getCompanyRouteId({ name: job.company })}`;
  const companyProfileState = {
    backTo: `${location.pathname}${location.search}${location.hash}`,
    origin: 'job-detail',
  };
  const categories = normalizeDelimitedList(job.categories);
  const jobTypes = normalizeDelimitedList(job.type);
  const descriptionSections = parseDescriptionSections(job.description);
  const descriptionText = descriptionSections.Description || job.description || '';

  const responsibilities = splitLines(descriptionSections.Responsibilities) || [];
  const whoYouAre = splitLines(descriptionSections['Who You Are']) || [];
  const niceToHaves = splitLines(descriptionSections['Nice-To-Haves']) || [];
  const perks = splitCommas(descriptionSections.Perks) || [];
  const requiredSkills = splitCommas(descriptionSections['Required Skills']) || [];

  const messageCompanyHref = hasApplied && job.postedByUserId
    ? `/dashboard/messages?${new URLSearchParams({
        user: String(job.postedByUserId),
        name: job.company || 'Company',
        type: 'COMPANY',
      }).toString()}`
    : null;

  const postedDate = new Date(job.createdAt);
  const isNew = Boolean(job.isNew);
  const postedDateLabel = Number.isNaN(postedDate.getTime())
    ? 'Recently'
    : postedDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-8 py-8">
        <p className="text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          {' / '}
          <Link to="/find-jobs" className="hover:text-blue-600">Find Jobs</Link>
          {' / '}
          <span className="text-gray-700">{job.title}</span>
        </p>

        {/* Header */}
        <div className="bg-white rounded-xl p-6 flex items-start justify-between mb-6 border border-gray-200">
          <div className="flex items-start gap-4">
            <div className={`${job.color} text-white rounded-xl w-16 h-16 flex items-center justify-center font-bold text-2xl`}>{job.logo}</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {isNew && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">New</span>
                )}
                <p className="text-gray-500 text-sm">
                  <Link
                    to={companyProfileHref}
                    state={companyProfileState}
                    className="transition-colors hover:text-blue-600 hover:underline underline-offset-4"
                  >
                    {job.company}
                  </Link>
                  {job.location ? ` • ${job.location}` : ''}
                  {jobTypes.length ? ` • ${jobTypes.join(', ')}` : ''}
                </p>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {categories.map(c => <span key={c} className="text-xs bg-orange-50 text-orange-600 border border-orange-200 rounded px-2 py-0.5">{c}</span>)}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            {messageCompanyHref && (
              <Link
                to={messageCompanyHref}
                className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2 transition"
              >
                <span>Message</span>
              </Link>
            )}
            <button
              onClick={() => setShowShareModal(true)}
              className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Share
            </button>
            <button onClick={handleApply} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700">Apply</button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-bold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {descriptionText || 'No description provided.'}
              </p>

              <h2 className="font-bold text-gray-900 mt-6 mb-3">Responsibilities</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                {responsibilities.length ? responsibilities.map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-500 mt-0.5">✓</span>{item}</li>
                )) : (
                  <li className="text-gray-400">No responsibilities listed.</li>
                )}
              </ul>

              <h2 className="font-bold text-gray-900 mt-6 mb-3">Who You Are</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                {whoYouAre.length ? whoYouAre.map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-500 mt-0.5">✓</span>{item}</li>
                )) : (
                  <li className="text-gray-400">No candidate profile listed.</li>
                )}
              </ul>

              <h2 className="font-bold text-gray-900 mt-6 mb-3">Nice-To-Haves</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                {niceToHaves.length ? niceToHaves.map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-gray-400 mt-0.5">✓</span>{item}</li>
                )) : (
                  <li className="text-gray-400">No extra requirements listed.</li>
                )}
              </ul>

              <h2 className="font-bold text-gray-900 mt-6 mb-3">Perks & Benefits</h2>
              <p className="text-sm text-gray-500 mb-4">This job comes with several perks and benefits</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {perks.length ? perks.map(perk => (
                  <div key={perk} className="text-center p-3 border border-gray-200 rounded-lg">
                    <div className="text-2xl mb-1">🎁</div>
                    <p className="text-xs text-gray-600">{perk}</p>
                  </div>
                )) : (
                  <div className="col-span-2 md:col-span-4 text-sm text-gray-400">No perks listed.</div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">About this role</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Date Posted</span><span className="font-medium">{postedDateLabel}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Job Type</span><span className="font-medium">{jobTypes.length ? jobTypes.join(', ') : 'Full Time'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Salary</span><span className="font-medium">{job.salary ? `$${job.salary}` : 'Not disclosed'}</span></div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map(c => <span key={c} className="text-xs bg-orange-50 text-orange-600 border border-orange-200 rounded px-2 py-0.5">{c}</span>)}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {requiredSkills.length ? requiredSkills.map(s => (
                    <span key={s} className="text-xs bg-blue-50 text-blue-600 rounded px-2 py-0.5">{s}</span>
                  )) : (
                    <span className="text-xs text-gray-400">No skills listed.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className={`${job.color} text-white rounded-xl w-12 h-12 flex items-center justify-center font-bold text-xl mb-3`}>{job.logo}</div>
              <h3 className="font-semibold text-gray-900">{job.company}</h3>
              <p className="text-sm text-gray-500 mt-1">{job.description || 'No company description provided.'}</p>
              <Link to={`/companies/${getCompanyRouteId({ name: job.company })}`} className="text-blue-600 text-sm mt-3 block hover:underline">Read more about {job.company} →</Link>
              {messageCompanyHref && (
                <Link
                  to={messageCompanyHref}
                  className="mt-3 inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Message {job.company}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Similar Jobs */}
        <div className="mt-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Similar Jobs</h2>
            <Link to="/find-jobs" className="text-blue-600 text-sm hover:underline">Show all jobs →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
              Similar jobs will appear once more company jobs are posted.
            </div>
          </div>
        </div>
      </div>
      {showModal && <ApplicationModal job={job} onClose={() => setShowModal(false)} />}
      <ShareModal 
        isOpen={showShareModal} 
        onClose={() => setShowShareModal(false)} 
        job={job}
        url={window.location.href}
      />
    </div>
  );
}
