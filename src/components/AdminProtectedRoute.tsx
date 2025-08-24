
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

  // Always call useEffect first - hooks must be called in consistent order
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

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-lg text-gray-600">Carregando...</div>
        </div>
      </div>
    );
  }

  // Verificação real de autenticação
  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Verificação de permissões baseada em função
  if (requiredRole && admin && admin.role !== requiredRole && admin.role !== 'super_admin') {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
