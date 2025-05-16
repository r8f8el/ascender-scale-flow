
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
  const { isAdminAuthenticated, admin } = useAdminAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!isAdminAuthenticated) {
      toast({
        title: "Acesso Negado",
        description: "Você precisa estar autenticado para acessar esta área.",
        variant: "destructive"
      });
    } else if (
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
  }, [isAdminAuthenticated, admin, requiredRole, toast]);

  // Autenticação simulada para desenvolvimento - REMOVER EM PRODUÇÃO
  if (process.env.NODE_ENV === 'development') {
    return <>{children}</>;
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
