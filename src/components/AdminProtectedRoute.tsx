
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
  const [hasTimeout, setHasTimeout] = useState(false);

  console.log('🔐 AdminProtectedRoute:', {
    loading,
    isAdminAuthenticated,
    hasAdmin: !!admin,
    adminEmail: admin?.email,
    adminRole: admin?.role,
    hasTimeout
  });

  // Timeout para evitar loading infinito
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('⏰ AdminProtectedRoute: Loading timeout reached');
        setHasTimeout(true);
      }
    }, 10000); // 10 segundos de timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  useEffect(() => {
    if (!loading && !isAdminAuthenticated && !hasTimeout) {
      console.log('🚫 AdminProtectedRoute: Access denied - not authenticated');
      toast({
        title: "Acesso Negado",
        description: "Você precisa estar autenticado como administrador para acessar esta área.",
        variant: "destructive"
      });
    } else if (
      !loading &&
      requiredRole && 
      admin && 
      admin.role !== requiredRole && 
      admin.role !== 'super_admin'
    ) {
      console.log('🚫 AdminProtectedRoute: Access denied - insufficient role');
      toast({
        title: "Permissão Insuficiente",
        description: "Você não tem permissão para acessar este recurso.",
        variant: "destructive"
      });
    }
  }, [isAdminAuthenticated, admin, requiredRole, toast, loading, hasTimeout]);

  // Se houve timeout, redirecionar para login
  if (hasTimeout) {
    console.log('⏰ AdminProtectedRoute: Timeout - redirecting to login');
    return <Navigate to="/admin/login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-lg text-gray-600">Carregando...</div>
          <div className="text-sm text-gray-500">Verificando permissões de acesso</div>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    console.log('🔄 AdminProtectedRoute: Redirecting to admin login');
    return <Navigate to="/admin/login" replace />;
  }

  if (requiredRole && admin && admin.role !== requiredRole && admin.role !== 'super_admin') {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  console.log('✅ AdminProtectedRoute: Access granted');
  return <>{children}</>;
};

export default AdminProtectedRoute;
