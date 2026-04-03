import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import CompanyProfileDetails from '../components/CompanyProfileDetails';
import {
  buildBrowseCompanyDetailsFromJobs,
  getCompanyRouteId,
} from '../data/discoveryData';
import apiService from '../services/api';

export default function CompanyProfile() {
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
