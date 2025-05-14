
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'super_admin';
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAdminAuthenticated, admin } = useAdminAuth();

  // Not authenticated at all
  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check role-based permissions if requiredRole is specified
  if (requiredRole && admin && admin.role !== requiredRole && admin.role !== 'super_admin') {
    // If specific role is required and user doesn't have it (or isn't super_admin)
    return <Navigate to="/admin/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
