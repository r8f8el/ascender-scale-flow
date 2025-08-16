
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useSecurityContext } from '@/components/security/SecureAuthWrapper';
import { SecureForm } from '@/components/security/SecureForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AdminLogin: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { adminLogin, loading } = useAdminAuth();
  const { logSecurityEvent } = useSecurityContext();
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    const { email, password } = data;
    
    setIsLoading(true);
    try {
      const success = await adminLogin(email, password);
      
      if (success) {
        await logSecurityEvent('admin_login_success', 'auth', { email });
        navigate('/admin');
      } else {
        await logSecurityEvent('admin_login_failed', 'auth', { email });
        toast.error('Credenciais inválidas');
      }
    } catch (error) {
      console.error('Login error:', error);
      await logSecurityEvent('admin_login_error', 'auth', { email, error: String(error) });
      toast.error('Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4 text-center">Login Administrativo</h2>
        <SecureForm onSubmit={handleSubmit} formType="login">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="admin@ascalate.com.br"
                autoComplete="email"
                required
                disabled={isLoading || loading}
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                type="password"
                id="password"
                name="password"
                placeholder="Senha"
                autoComplete="current-password"
                required
                disabled={isLoading || loading}
              />
            </div>
            <div>
              <Button type="submit" className="w-full" disabled={isLoading || loading}>
                {isLoading || loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </div>
          </div>
        </SecureForm>
      </div>
    </div>
  );
};

export default AdminLogin;
