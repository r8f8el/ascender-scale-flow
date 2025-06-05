
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, session } = useAuth();

  useEffect(() => {
    // Add timeout to handle edge cases where auth state is still loading
    const timer = setTimeout(() => {
      if (!session && !isAuthenticated) {
        // Auth state has had time to load, redirect if not authenticated
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [session, isAuthenticated]);

  // Show loading state briefly while auth state is determining
  if (session === null && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Verificando autenticação...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/cliente/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
