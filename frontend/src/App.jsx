import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DashboardSidebar from './components/DashboardSidebar';
import ProtectedRoute, { JobseekerRoute, CompanyRoute } from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

import Home from './pages/Home';
import FindJobs from './pages/FindJobs';
import BrowseCompanies from './pages/BrowseCompanies';
import JobDetail from './pages/JobDetail';
import ApplicationDetail from './pages/ApplicationDetail';
import CompanyProfile from './pages/CompanyProfile';
import CompanyJobDetail from './pages/CompanyJobDetail';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/SitePrivacy';

import DashboardHome from './pages/dashboard/DashboardHome';
import Messages from './pages/dashboard/Messages';
import MyApplications from './pages/dashboard/MyApplications';
import DashFindJobs from './pages/dashboard/DashFindJobs';
import DashCompanies from './pages/dashboard/DashCompanies';
import DashCompanyProfile from './pages/dashboard/DashCompanyProfile';
import DashNetwork from './pages/dashboard/DashNetwork';
import Profile from './pages/dashboard/Profile';
import Settings from './pages/dashboard/Settings';
import HelpCenter from './pages/dashboard/HelpCenter';
import Notifications from './pages/dashboard/Notifications';
import DashJobDetail from './pages/dashboard/DashJobDetail';
import UserProfile from './pages/dashboard/UserProfile';
import JobActionsManager from './components/JobActionsManager';

import CompanySidebar from './components/CompanySidebar';
import CompanyDashboard from './pages/company/CompanyDashboard';
import CompanyMessages from './pages/company/CompanyMessages';
import CompanyProfilePage from './pages/company/CompanyProfile';
import AllApplicants from './pages/company/AllApplicants';
import ApplicantProfile from './pages/company/ApplicantProfile';
import JobListing from './pages/company/JobListing';
import MySchedule from './pages/company/MySchedule';
import PostJob from './pages/company/PostJob';
import CompanySettings from './pages/company/CompanySettings';
import SeekerProfile from './pages/company/SeekerProfile';

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function CompanyLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <CompanySidebar />
      <div className="flex min-h-screen flex-col lg:ml-60">
        {children}
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

export default function App() {
  const { loading, user } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes key={user ? 'authenticated' : 'unauthenticated'}>
        {/* Public */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/find-jobs" element={<PublicLayout><FindJobs /></PublicLayout>} />
        <Route path="/browse-companies" element={<PublicLayout><BrowseCompanies /></PublicLayout>} />
        <Route path="/jobs/:id" element={<PublicLayout><JobDetail /></PublicLayout>} />
        <Route path="/applications/:applicationId" element={<ProtectedRoute><DashboardLayout><ApplicationDetail /></DashboardLayout></ProtectedRoute>} />
        <Route path="/companies/:id" element={<PublicLayout><CompanyProfile /></PublicLayout>} />
        <Route path="/companies/:companyId/jobs/:jobId" element={<PublicLayout><CompanyJobDetail /></PublicLayout>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
        <Route path="/terms" element={<PublicLayout><TermsOfService /></PublicLayout>} />
        <Route path="/privacy" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />

        {/* Dashboard — jobseeker only */}
        <Route path="/dashboard" element={<JobseekerRoute><DashboardLayout><DashboardHome /></DashboardLayout></JobseekerRoute>} />
        <Route path="/dashboard/messages" element={<JobseekerRoute><DashboardLayout><Messages /></DashboardLayout></JobseekerRoute>} />
        <Route path="/dashboard/network" element={<JobseekerRoute><DashboardLayout><DashNetwork /></DashboardLayout></JobseekerRoute>} />
        <Route path="/dashboard/applications" element={<JobseekerRoute><DashboardLayout><MyApplications /></DashboardLayout></JobseekerRoute>} />
        <Route path="/dashboard/applications/:applicationId" element={<JobseekerRoute><DashboardLayout><ApplicationDetail /></DashboardLayout></JobseekerRoute>} />
        <Route path="/dashboard/find-jobs" element={<JobseekerRoute><DashboardLayout><DashFindJobs /></DashboardLayout></JobseekerRoute>} />
        <Route path="/dashboard/companies" element={<JobseekerRoute><DashboardLayout><DashCompanies /></DashboardLayout></JobseekerRoute>} />
        <Route path="/dashboard/companies/:id" element={<JobseekerRoute><DashboardLayout><DashCompanyProfile /></DashboardLayout></JobseekerRoute>} />
        <Route path="/dashboard/profile" element={<JobseekerRoute><DashboardLayout><Profile /></DashboardLayout></JobseekerRoute>} />
        <Route path="/dashboard/profile/experience" element={<JobseekerRoute><DashboardLayout><Profile /></DashboardLayout></JobseekerRoute>} />
        <Route path="/dashboard/profile/:userId" element={<JobseekerRoute><DashboardLayout><UserProfile /></DashboardLayout></JobseekerRoute>} />
        <Route path="/dashboard/settings" element={<JobseekerRoute><DashboardLayout><Settings /></DashboardLayout></JobseekerRoute>} />
        <Route path="/dashboard/help" element={<JobseekerRoute><DashboardLayout><HelpCenter /></DashboardLayout></JobseekerRoute>} />
        <Route path="/dashboard/notifications" element={<JobseekerRoute><DashboardLayout><Notifications /></DashboardLayout></JobseekerRoute>} />
        <Route path="/dashboard/job-actions" element={<JobseekerRoute><DashboardLayout><JobActionsManager /></DashboardLayout></JobseekerRoute>} />
        <Route path="/dashboard/jobs/:id" element={<JobseekerRoute><DashboardLayout><DashJobDetail /></DashboardLayout></JobseekerRoute>} />

        {/* Company Dashboard — company only */}
        <Route path="/company/dashboard" element={<CompanyRoute><CompanyLayout><CompanyDashboard /></CompanyLayout></CompanyRoute>} />
        <Route path="/company/messages" element={<CompanyRoute><CompanyLayout><CompanyMessages /></CompanyLayout></CompanyRoute>} />
        <Route path="/company/profile" element={<CompanyRoute><CompanyLayout><CompanyProfilePage /></CompanyLayout></CompanyRoute>} />
        <Route path="/company/applicants" element={<CompanyRoute><CompanyLayout><AllApplicants /></CompanyLayout></CompanyRoute>} />
        <Route path="/company/applicants/:id" element={<CompanyRoute><CompanyLayout><ApplicantProfile /></CompanyLayout></CompanyRoute>} />
        <Route path="/company/jobs" element={<CompanyRoute><CompanyLayout><JobListing /></CompanyLayout></CompanyRoute>} />
        <Route path="/company/jobs/post" element={<CompanyRoute><CompanyLayout><PostJob /></CompanyLayout></CompanyRoute>} />
        <Route path="/company/jobs/:id/applicants" element={<CompanyRoute><CompanyLayout><JobListing /></CompanyLayout></CompanyRoute>} />
        <Route path="/company/jobs/:id/detail" element={<CompanyRoute><CompanyLayout><JobListing /></CompanyLayout></CompanyRoute>} />
        <Route path="/company/jobs/:id/analytics" element={<CompanyRoute><CompanyLayout><JobListing /></CompanyLayout></CompanyRoute>} />
        <Route path="/company/schedule" element={<CompanyRoute><CompanyLayout><MySchedule /></CompanyLayout></CompanyRoute>} />
        <Route path="/company/settings" element={<CompanyRoute><CompanyLayout><CompanySettings /></CompanyLayout></CompanyRoute>} />
        <Route path="/company/seeker/:seekerId" element={<CompanyRoute><CompanyLayout><SeekerProfile /></CompanyLayout></CompanyRoute>} />
      </Routes>
    </BrowserRouter>
    </ToastProvider>
  );
}
