import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import CompanyProfileDetails from '../components/CompanyProfileDetails';
import { getCompanyRouteId } from '../data/discoveryData';
import apiService from '../services/api';

const normalizeDelimitedList = (value) => {
  if (Array.isArray(value)) return value;
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const unique = (values) => [...new Set(values.filter(Boolean))];

const buildCompanyDetailsFromJobs = (jobs, companyId) => {
  const companyJobs = (jobs || []).filter((job) =>
    getCompanyRouteId({ name: job.company }) === companyId,
  );

  if (!companyJobs.length) return null;

  const primaryJob = companyJobs[0] || {};
  const companyName = (primaryJob.company || '').trim() || companyId;
  const tags = unique(companyJobs.flatMap((job) => normalizeDelimitedList(job.categories)));
  const officeLocations = unique(companyJobs.map((job) => job.location));
  const company = {
    id: companyId || companyName,
    name: companyName,
    description: primaryJob.companyDescription || `${companyName} is hiring right now.`,
    logo: primaryJob.logo || companyName.slice(0, 2).toUpperCase(),
    color: primaryJob.color || 'bg-blue-600',
    industry: tags[0] || 'Hiring',
    size: primaryJob.companySize || '1-50',
    tags,
    officeLocations,
    jobs: companyJobs.length,
  };

  const normalizedJobs = companyJobs.map((job) => ({
    ...job,
    categories: normalizeDelimitedList(job.categories),
    logo: job.logo || company.logo,
    color: job.color || company.color,
  }));

  return { company, jobs: normalizedJobs };
};

export default function CompanyProfile() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [companyDetails, setCompanyDetails] = useState(null);
  const [loadedCompanyId, setLoadedCompanyId] = useState(null);

  useEffect(() => {
    let active = true;

    apiService.getJobs()
      .then((jobsData) => {
        if (!active) return;
        if (Array.isArray(jobsData) && jobsData.length) {
          setCompanyDetails(buildCompanyDetailsFromJobs(jobsData, id));
        } else {
          setCompanyDetails(null);
        }
      })
      .catch(() => {
        if (!active) return;
        setCompanyDetails(null);
      })
      .finally(() => {
        if (!active) return;
        setLoadedCompanyId(id);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const isLoading = loadedCompanyId !== id;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!companyDetails || companyDetails.jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-lg font-semibold">No company jobs posted yet</p>
          <p className="text-sm mt-1">This company has not posted any roles.</p>
          <button onClick={() => navigate('/browse-companies')} className="mt-4 text-sm text-blue-600 hover:underline">Back to companies</button>
        </div>
      </div>
    );
  }

  const { company, jobs: openJobs } = companyDetails;
  const companyRouteId = getCompanyRouteId(company);
  const browseJobsHref = `/find-jobs?company=${encodeURIComponent(company.name)}`;
  const hasOriginBackState = Boolean(location.state?.backTo);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-8 pt-8">
        {hasOriginBackState ? (
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-sm font-medium text-gray-500 hover:text-blue-600"
          >
            ← Back
          </button>
        ) : null}
        <p className="mb-6 text-sm text-gray-400">
          Home / <Link to="/browse-companies" className="hover:text-blue-600">Companies</Link> / <span className="text-gray-700">{company.name}</span>
        </p>
      </div>

      <CompanyProfileDetails
        company={company}
        jobs={openJobs}
        browseJobsHref={browseJobsHref}
        jobHrefBuilder={(job) => `/companies/${companyRouteId}/jobs/${job.id}`}
      />
    </div>
  );
}
