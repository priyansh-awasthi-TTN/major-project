import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCompanyRouteId } from '../data/discoveryData';
import { useAuth } from '../context/AuthContext';
import ApplicationModal from '../components/ApplicationModal';
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

const buildCompanyFromJob = (job, jobs, companyId) => {
  const companyName = (job?.company || '').trim();
  const companyJobs = companyName
    ? jobs.filter((item) => (item.company || '').trim() === companyName)
    : [];
  const categories = normalizeDelimitedList(job?.categories);

  return {
    id: companyId || companyName,
    name: companyName || 'Company',
    description: job?.companyDescription || `${companyName || 'Company'} is hiring right now.`,
    logo: job?.logo || (companyName || 'CO').slice(0, 2).toUpperCase(),
    color: job?.color || 'bg-blue-600',
    industry: categories[0] || 'Hiring',
    size: job?.companySize || '1-50',
    tags: categories,
    officeLocations: job?.location ? [job.location] : [],
    jobs: companyJobs.length || (job ? 1 : 0),
  };
};

export default function CompanyJobDetail() {
  const { companyId, jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [job, setJob] = useState(null);
  const [allJobs, setAllJobs] = useState([]);
  const [loadedJobId, setLoadedJobId] = useState(null);

  const company = useMemo(
    () => (job ? buildCompanyFromJob(job, allJobs, companyId) : null),
    [job, allJobs, companyId],
  );

  const similarJobs = useMemo(() => {
    if (!job || !allJobs.length) return [];
    const companyName = job.company || '';
    return allJobs
      .filter((item) => String(item.id) !== String(job.id) && item.company === companyName)
      .concat(allJobs.filter((item) => String(item.id) !== String(job.id) && item.company !== companyName))
      .slice(0, 4);
  }, [allJobs, job]);

  useEffect(() => {
    let active = true;
    const requestedId = String(jobId);

    Promise.all([
      apiService.getJob(jobId).catch(() => null),
      apiService.getJobs().catch(() => []),
    ]).then(([jobData, jobsData]) => {
      if (!active) return;

      if (jobData) {
        setJob({ ...jobData, categories: normalizeDelimitedList(jobData.categories) });
      } else {
        setJob(null);
      }

      setAllJobs(
        (Array.isArray(jobsData) ? jobsData : []).map((item) => ({
          ...item,
          categories: normalizeDelimitedList(item.categories),
        })),
      );
    }).finally(() => {
      if (!active) return;
      setLoadedJobId(requestedId);
    });

    return () => {
      active = false;
    };
  }, [jobId]);

  const isLoading = loadedJobId !== String(jobId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!job || !company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-lg font-semibold">Job not found</p>
          <p className="text-sm mt-1">This job may have been removed.</p>
          <button onClick={() => navigate('/browse-companies')} className="mt-4 text-sm text-blue-600 hover:underline">Back to companies</button>
        </div>
      </div>
    );
  }

  const companyRouteId = getCompanyRouteId(company);

  const categories = normalizeDelimitedList(job.categories);
  const jobTypes = normalizeDelimitedList(job.type);
  const descriptionSections = parseDescriptionSections(job.description);
  const descriptionText = descriptionSections.Description || job.description || '';
  const responsibilities = splitLines(descriptionSections.Responsibilities) || [];
  const whoYouAre = splitLines(descriptionSections['Who You Are']) || [];
  const niceToHaves = splitLines(descriptionSections['Nice-To-Haves']) || [];
  const perks = splitCommas(descriptionSections.Perks) || [];
  const requiredSkills = splitCommas(descriptionSections['Required Skills']) || [];
  const postedDate = new Date(job.createdAt);
  const postedDateLabel = Number.isNaN(postedDate.getTime())
    ? 'Recently'
    : postedDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  const handleApply = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Breadcrumb */}
        <p className="text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          {' / '}
          <Link to="/browse-companies" className="hover:text-blue-600">Companies</Link>
          {' / '}
          <Link to={`/companies/${companyRouteId}`} className="hover:text-blue-600">{company.name}</Link>
          {' / '}
          <span className="text-gray-700">{job.title}</span>
        </p>

        {/* Header */}
        <div className="bg-white rounded-xl p-6 flex items-start justify-between mb-6 border border-gray-200">
          <div className="flex items-start gap-4">
            <div className={`${job.color} text-white rounded-xl w-16 h-16 flex items-center justify-center font-bold text-2xl`}>{job.logo}</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-gray-500 text-sm">{job.company} • {job.location} • {jobTypes.join(', ') || 'Full-Time'}</p>
              <div className="flex gap-2 mt-2">
                {categories.map(c => (
                  <span key={c} className="text-xs bg-orange-50 text-orange-600 border border-orange-200 rounded px-2 py-0.5">{c}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">🔗</button>
            <button onClick={handleApply} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 font-medium">Apply</button>
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
                  {categories.map(c => (
                    <span key={c} className="text-xs bg-orange-50 text-orange-600 border border-orange-200 rounded px-2 py-0.5">{c}</span>
                  ))}
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
              <div className={`${company.color} text-white rounded-xl w-12 h-12 flex items-center justify-center font-bold text-xl mb-3`}>{company.logo}</div>
              <h3 className="font-semibold text-gray-900">{company.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{company.description}</p>
              <Link to={`/companies/${companyRouteId}`} className="text-blue-600 text-sm mt-3 block hover:underline">
                Read more about {company.name} →
              </Link>
            </div>
          </div>
        </div>

        {/* Similar Jobs */}
        <div className="mt-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Similar Jobs</h2>
            <Link to="/find-jobs" className="text-blue-600 text-sm hover:underline">Show all jobs →</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {similarJobs.length ? similarJobs.map((item) => (
              <Link
                key={item.id}
                to={`/companies/${getCompanyRouteId({ name: item.company })}/jobs/${item.id}`}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition block"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`${item.color} text-white rounded-xl w-11 h-11 flex items-center justify-center font-bold text-base flex-shrink-0`}>
                    {item.logo}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{item.company} • {item.location}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {normalizeDelimitedList(item.categories).map((category) => (
                    <span key={category} className="text-xs bg-orange-50 text-orange-600 border border-orange-200 rounded px-2 py-0.5">
                      {category}
                    </span>
                  ))}
                </div>
              </Link>
            )) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
                Similar jobs will appear once more company jobs are posted.
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && <ApplicationModal job={job} onClose={() => setShowModal(false)} />}
    </div>
  );
}
