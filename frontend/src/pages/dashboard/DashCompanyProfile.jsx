import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import CompanyProfileDetails from '../../components/CompanyProfileDetails';
import {
  buildBrowseCompanyDetailsFromJobs,
} from '../../data/discoveryData';
import DashTopBar from '../../components/DashTopBar';
import apiService from '../../services/api';

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
  const [companyDetails, setCompanyDetails] = useState(() => buildBrowseCompanyDetailsFromJobs(id));

  useEffect(() => {
    apiService.getJobs()
      .then((jobsData) => {
        if (jobsData?.length) {
          setCompanyDetails(buildBrowseCompanyDetailsFromJobs(id, jobsData));
        } else {
          setCompanyDetails(buildBrowseCompanyDetailsFromJobs(id));
        }
      })
      .catch(() => {
        setCompanyDetails(buildBrowseCompanyDetailsFromJobs(id));
      });
  }, [id]);

  const { company, jobs: realJobs } = companyDetails;
  const browseJobsHref = `/dashboard/find-jobs?company=${encodeURIComponent(company.name)}&origin=company-profile`;
  const canNavigateBack = BACK_NAVIGATION_ORIGINS.has(location.state?.origin);

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
