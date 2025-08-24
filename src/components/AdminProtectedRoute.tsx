
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
  const [hasShownError, setHasShownError] = useState(false);

  useEffect(() => {
    if (!loading && !isAdminAuthenticated && !hasShownError) {
      setHasShownError(true);
      toast({
        title: "Acesso Negado",
        description: "Você precisa estar autenticado como administrador.",
        variant: "destructive"
      });
    } else if (
      !loading &&
      isAdminAuthenticated &&
      requiredRole && 
      admin && 
      admin.role !== requiredRole && 
      admin.role !== 'super_admin' &&
      !hasShownError
    ) {
      setHasShownError(true);
      toast({
        title: "Permissão Insuficiente",
        description: `Você precisa ter o papel de ${requiredRole} para acessar este recurso.`,
        variant: "destructive"
      });
    }
  }, [isAdminAuthenticated, admin, requiredRole, toast, loading, hasShownError]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-lg text-gray-600">Verificando autenticação...</div>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    console.log('🚫 Redirecting to admin login - not authenticated');
    return <Navigate to="/admin/login" replace />;
  }

  if (requiredRole && admin && admin.role !== requiredRole && admin.role !== 'super_admin') {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  console.log('✅ Admin access granted for:', admin?.email);
  return <>{children}</>;
};

export default AdminProtectedRoute;
