import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import CompanyProfileDetails from '../../components/CompanyProfileDetails';
import { getCompanyRouteId } from '../../data/discoveryData';
import DashTopBar from '../../components/DashTopBar';
import apiService from '../../services/api';

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

const BACK_NAVIGATION_ORIGINS = new Set([
  'application-detail',
  'job-detail',
  'my-applications',
  'dashboard-home',
]);

export default function DashCompanyProfile() {
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
  const canNavigateBack = BACK_NAVIGATION_ORIGINS.has(location.state?.origin);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col h-full bg-gray-50">
        <DashTopBar>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <button
              onClick={() => navigate(canNavigateBack ? -1 : '/dashboard/companies')}
              className="font-medium hover:text-blue-600"
            >
              ← Back
            </button>
          </div>
        </DashTopBar>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (!companyDetails || companyDetails.jobs.length === 0) {
    return (
      <div className="flex-1 flex flex-col h-full bg-gray-50">
        <DashTopBar>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <button
              onClick={() => navigate(canNavigateBack ? -1 : '/dashboard/companies')}
              className="font-medium hover:text-blue-600"
            >
              ← Back
            </button>
          </div>
        </DashTopBar>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-lg font-semibold">No company jobs posted yet</p>
            <p className="text-sm mt-1">This company has not posted any roles.</p>
          </div>
        </div>
      </div>
    );
  }

  const { company, jobs: realJobs } = companyDetails;
  const browseJobsHref = `/dashboard/find-jobs?company=${encodeURIComponent(company.name)}&origin=company-profile`;

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      <DashTopBar>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button
            onClick={() => navigate(canNavigateBack ? -1 : '/dashboard/companies')}
            className="font-medium hover:text-blue-600"
          >
            ← Back
          </button>
        </div>
      </DashTopBar>

      <div className="flex-1 overflow-y-auto">
        <CompanyProfileDetails
          company={company}
          jobs={realJobs}
          browseJobsHref={browseJobsHref}
          jobHrefBuilder={(job) => `/dashboard/jobs/${job.id}`}
        />
      </div>
    </div>
  );
}
