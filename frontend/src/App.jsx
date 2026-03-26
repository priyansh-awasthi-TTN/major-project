import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DashboardSidebar from './components/DashboardSidebar';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

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
import UserProfile from './pages/dashboard/UserProfile';

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
    <BrowserRouter>
      <Routes key={user ? 'authenticated' : 'unauthenticated'}>
        {/* Public */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/find-jobs" element={<PublicLayout><FindJobs /></PublicLayout>} />
        <Route path="/browse-companies" element={<PublicLayout><BrowseCompanies /></PublicLayout>} />
        <Route path="/jobs/:id" element={<PublicLayout><JobDetail /></PublicLayout>} />
        <Route path="/companies/:id" element={<PublicLayout><CompanyProfile /></PublicLayout>} />
        <Route path="/companies/:companyId/jobs/:jobId" element={<PublicLayout><CompanyJobDetail /></PublicLayout>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><DashboardHome /></DashboardLayout></ProtectedRoute>} />
        <Route path="/dashboard/messages" element={<ProtectedRoute><DashboardLayout><Messages /></DashboardLayout></ProtectedRoute>} />
        <Route path="/dashboard/applications" element={<ProtectedRoute><DashboardLayout><MyApplications /></DashboardLayout></ProtectedRoute>} />
        <Route path="/dashboard/find-jobs" element={<ProtectedRoute><DashboardLayout><DashFindJobs /></DashboardLayout></ProtectedRoute>} />
        <Route path="/dashboard/companies" element={<ProtectedRoute><DashboardLayout><DashCompanies /></DashboardLayout></ProtectedRoute>} />
        <Route path="/dashboard/companies/:id" element={<ProtectedRoute><DashboardLayout><DashCompanyProfile /></DashboardLayout></ProtectedRoute>} />
        <Route path="/dashboard/profile" element={<ProtectedRoute><DashboardLayout><Profile /></DashboardLayout></ProtectedRoute>} />
        <Route path="/dashboard/profile/:userId" element={<ProtectedRoute><DashboardLayout><UserProfile /></DashboardLayout></ProtectedRoute>} />
        <Route path="/dashboard/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />
        <Route path="/dashboard/help" element={<ProtectedRoute><DashboardLayout><HelpCenter /></DashboardLayout></ProtectedRoute>} />
        <Route path="/dashboard/notifications" element={<ProtectedRoute><DashboardLayout><Notifications /></DashboardLayout></ProtectedRoute>} />
        <Route path="/dashboard/jobs/:id" element={<ProtectedRoute><DashboardLayout><DashJobDetail /></DashboardLayout></ProtectedRoute>} />

        {/* Company Dashboard */}
        <Route path="/company/dashboard" element={<ProtectedRoute><CompanyLayout><CompanyDashboard /></CompanyLayout></ProtectedRoute>} />
        <Route path="/company/messages" element={<ProtectedRoute><CompanyLayout><CompanyMessages /></CompanyLayout></ProtectedRoute>} />
        <Route path="/company/profile" element={<ProtectedRoute><CompanyLayout><CompanyProfilePage /></CompanyLayout></ProtectedRoute>} />
        <Route path="/company/applicants" element={<ProtectedRoute><CompanyLayout><AllApplicants /></CompanyLayout></ProtectedRoute>} />
        <Route path="/company/applicants/:id" element={<ProtectedRoute><CompanyLayout><ApplicantProfile /></CompanyLayout></ProtectedRoute>} />
        <Route path="/company/jobs" element={<ProtectedRoute><CompanyLayout><JobListing /></CompanyLayout></ProtectedRoute>} />
        <Route path="/company/jobs/post" element={<ProtectedRoute><CompanyLayout><PostJob /></CompanyLayout></ProtectedRoute>} />
        <Route path="/company/jobs/:id/applicants" element={<ProtectedRoute><CompanyLayout><JobApplicantsKanban /></CompanyLayout></ProtectedRoute>} />
        <Route path="/company/jobs/:id/detail" element={<ProtectedRoute><CompanyLayout><CompanyDashJobDetail /></CompanyLayout></ProtectedRoute>} />
        <Route path="/company/jobs/:id/analytics" element={<ProtectedRoute><CompanyLayout><Analytics /></CompanyLayout></ProtectedRoute>} />
        <Route path="/company/schedule" element={<ProtectedRoute><CompanyLayout><MySchedule /></CompanyLayout></ProtectedRoute>} />
        <Route path="/company/settings" element={<ProtectedRoute><CompanyLayout><CompanySettings /></CompanyLayout></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
