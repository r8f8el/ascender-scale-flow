
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'super_admin';
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAdminAuthenticated, admin, loading } = useAdminAuth();
  const { toast } = useToast();
  const [hasShownToast, setHasShownToast] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);

  console.log('🛡️ AdminProtectedRoute - Auth:', isAdminAuthenticated, 'Loading:', loading, 'Admin:', admin?.email);

  // Timeout para evitar loading infinito
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('⏰ Loading timeout reached');
        setTimeoutReached(true);
      }
    }, 10000); // 10 segundos

    return () => clearTimeout(timeout);
  }, [loading]);

  useEffect(() => {
    if (!loading && !isAdminAuthenticated && !hasShownToast) {
      console.log('🚫 Access denied - showing toast');
      toast({
        title: "Acesso Negado",
        description: "Você precisa estar autenticado para acessar esta área.",
        variant: "destructive"
      });
      setHasShownToast(true);
    } else if (
      !loading &&
      isAdminAuthenticated &&
      requiredRole && 
      admin && 
      admin.role !== requiredRole && 
      admin.role !== 'super_admin' &&
      !hasShownToast
    ) {
      console.log('🚫 Insufficient permissions - showing toast');
      toast({
        title: "Permissão Insuficiente",
        description: "Você não tem permissão para acessar este recurso.",
        variant: "destructive"
      });
      setHasShownToast(true);
    }
  }, [isAdminAuthenticated, admin, requiredRole, toast, loading, hasShownToast]);

  // Show loading while checking authentication (com timeout)
  if (loading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-lg text-gray-600">Verificando permissões...</div>
          <div className="text-sm text-gray-500">
            Auth: {isAdminAuthenticated ? '✅' : '❌'} | Admin: {admin?.email || 'None'}
          </div>
        </div>
      </div>
    );
  }

  // Se o loading timeout foi atingido ou não está autenticado
  if (timeoutReached || !isAdminAuthenticated) {
    console.log('🔄 Redirecting to admin login');
    return <Navigate to="/admin/login" replace />;
  }

  // Check role permissions
  if (requiredRole && admin && admin.role !== requiredRole && admin.role !== 'super_admin') {
    console.log('🔄 Redirecting to unauthorized');
    return <Navigate to="/admin/unauthorized" replace />;
  }

  console.log('✅ Access granted - rendering children');
  return <>{children}</>;
};

export default AdminProtectedRoute;
