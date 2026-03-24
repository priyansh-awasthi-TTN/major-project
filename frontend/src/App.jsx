import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DashboardSidebar from './components/DashboardSidebar';

import Home from './pages/Home';
import FindJobs from './pages/FindJobs';
import BrowseCompanies from './pages/BrowseCompanies';
import JobDetail from './pages/JobDetail';
import CompanyProfile from './pages/CompanyProfile';
import CompanyJobDetail from './pages/CompanyJobDetail';
import Login from './pages/Login';
import SignUp from './pages/SignUp';

import DashboardHome from './pages/dashboard/DashboardHome';
import Messages from './pages/dashboard/Messages';
import MyApplications from './pages/dashboard/MyApplications';
import DashFindJobs from './pages/dashboard/DashFindJobs';
import DashCompanies from './pages/dashboard/DashCompanies';
import DashCompanyProfile from './pages/dashboard/DashCompanyProfile';
import Profile from './pages/dashboard/Profile';
import Settings from './pages/dashboard/Settings';
import HelpCenter from './pages/dashboard/HelpCenter';
import Notifications from './pages/dashboard/Notifications';
import DashJobDetail from './pages/dashboard/DashJobDetail';

import CompanySidebar from './components/CompanySidebar';
import CompanyDashboard from './pages/company/CompanyDashboard';
import CompanyMessages from './pages/company/CompanyMessages';
import CompanyProfilePage from './pages/company/CompanyProfile';
import AllApplicants from './pages/company/AllApplicants';
import ApplicantProfile from './pages/company/ApplicantProfile';
import JobListing from './pages/company/JobListing';
import JobApplicantsKanban from './pages/company/JobApplicantsKanban';
import CompanyDashJobDetail from './pages/company/JobDetail';
import Analytics from './pages/company/Analytics';
import MySchedule from './pages/company/MySchedule';
import PostJob from './pages/company/PostJob';
import CompanySettings from './pages/company/CompanySettings';

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
    <div className="flex min-h-screen">
      <CompanySidebar />
      {children}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/find-jobs" element={<PublicLayout><FindJobs /></PublicLayout>} />
        <Route path="/browse-companies" element={<PublicLayout><BrowseCompanies /></PublicLayout>} />
        <Route path="/jobs/:id" element={<PublicLayout><JobDetail /></PublicLayout>} />
        <Route path="/companies/:id" element={<PublicLayout><CompanyProfile /></PublicLayout>} />
        <Route path="/companies/:companyId/jobs/:jobId" element={<PublicLayout><CompanyJobDetail /></PublicLayout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardLayout><DashboardHome /></DashboardLayout>} />
        <Route path="/dashboard/messages" element={<DashboardLayout><Messages /></DashboardLayout>} />
        <Route path="/dashboard/applications" element={<DashboardLayout><MyApplications /></DashboardLayout>} />
        <Route path="/dashboard/find-jobs" element={<DashboardLayout><DashFindJobs /></DashboardLayout>} />
        <Route path="/dashboard/companies" element={<DashboardLayout><DashCompanies /></DashboardLayout>} />
        <Route path="/dashboard/companies/:id" element={<DashboardLayout><DashCompanyProfile /></DashboardLayout>} />
        <Route path="/dashboard/profile" element={<DashboardLayout><Profile /></DashboardLayout>} />
        <Route path="/dashboard/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
        <Route path="/dashboard/help" element={<DashboardLayout><HelpCenter /></DashboardLayout>} />
        <Route path="/dashboard/notifications" element={<DashboardLayout><Notifications /></DashboardLayout>} />
        <Route path="/dashboard/jobs/:id" element={<DashboardLayout><DashJobDetail /></DashboardLayout>} />

        {/* Company Dashboard */}
        <Route path="/company/dashboard" element={<CompanyLayout><CompanyDashboard /></CompanyLayout>} />
        <Route path="/company/messages" element={<CompanyLayout><CompanyMessages /></CompanyLayout>} />
        <Route path="/company/profile" element={<CompanyLayout><CompanyProfilePage /></CompanyLayout>} />
        <Route path="/company/applicants" element={<CompanyLayout><AllApplicants /></CompanyLayout>} />
        <Route path="/company/applicants/:id" element={<CompanyLayout><ApplicantProfile /></CompanyLayout>} />
        <Route path="/company/jobs" element={<CompanyLayout><JobListing /></CompanyLayout>} />
        <Route path="/company/jobs/post" element={<CompanyLayout><PostJob /></CompanyLayout>} />
        <Route path="/company/jobs/:id/applicants" element={<CompanyLayout><JobApplicantsKanban /></CompanyLayout>} />
        <Route path="/company/jobs/:id/detail" element={<CompanyLayout><CompanyDashJobDetail /></CompanyLayout>} />
        <Route path="/company/jobs/:id/analytics" element={<CompanyLayout><Analytics /></CompanyLayout>} />
        <Route path="/company/schedule" element={<CompanyLayout><MySchedule /></CompanyLayout>} />
        <Route path="/company/settings" element={<CompanyLayout><CompanySettings /></CompanyLayout>} />
      </Routes>
    </BrowserRouter>
  );
}
