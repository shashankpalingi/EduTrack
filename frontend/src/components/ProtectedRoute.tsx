import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type ProtectedRouteProps = {
  requiredRole?: 'student' | 'teacher' | null;
};

const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps) => {
  const { user, userRole, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If not logged in, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If role is required and user doesn't have it, redirect to appropriate dashboard
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to={userRole === 'teacher' ? '/teacher-dashboard' : '/student-dashboard'} replace />;
  }

  // If all checks pass, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;