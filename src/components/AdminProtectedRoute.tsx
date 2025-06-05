
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useEffect } from 'react';
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
  
  useEffect(() => {
    if (!loading && !isAdminAuthenticated) {
      toast({
        title: "Acesso Negado",
        description: "Você precisa estar autenticado para acessar esta área.",
        variant: "destructive"
      });
    } else if (
      !loading &&
      requiredRole && 
      admin && 
      admin.role !== requiredRole && 
      admin.role !== 'super_admin'
    ) {
      toast({
        title: "Permissão Insuficiente",
        description: "Você não tem permissão para acessar este recurso.",
        variant: "destructive"
      });
    }
  }, [isAdminAuthenticated, admin, requiredRole, toast, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requiredRole && admin && admin.role !== requiredRole && admin.role !== 'super_admin') {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
