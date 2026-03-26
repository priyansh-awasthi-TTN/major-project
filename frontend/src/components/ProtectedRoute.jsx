import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
  </div>
);

// Generic auth guard — just checks logged in
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Guards jobseeker-only routes — company users get redirected to their dashboard
export function JobseekerRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.userType === 'COMPANY') return <Navigate to="/company/dashboard" replace />;
  return children;
}

// Guards company-only routes — jobseekers get redirected to their dashboard
export function CompanyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.userType !== 'COMPANY') return <Navigate to="/dashboard" replace />;
  return children;
}
