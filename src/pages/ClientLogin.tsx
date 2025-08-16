
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSecurityContext } from '@/components/security/SecureAuthWrapper';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ClientLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loading } = useAuth();
  const { logSecurityEvent } = useSecurityContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      const { error } = await login(email, password);
      
      if (!error) {
        await logSecurityEvent('client_login_success', 'auth', { email });
        navigate('/cliente');
      } else {
        await logSecurityEvent('client_login_failed', 'auth', { email });
        toast.error('Credenciais inválidas');
      }
    } catch (error) {
      console.error('Login error:', error);
      await logSecurityEvent('client_login_error', 'auth', { email, error: String(error) });
      toast.error('Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2">
            <div className="flex">
              <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
              <div className="w-4 h-4 bg-blue-500 rounded-full -ml-2"></div>
              <div className="w-4 h-4 bg-blue-700 rounded-full -ml-2"></div>
            </div>
            <span className="text-2xl font-bold text-gray-900">Ascalate</span>
          </div>
        </div>
        
        <h2 className="text-center text-2xl font-bold text-gray-900 mb-8">
          Área do Cliente
        </h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm rounded-lg border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full"
                required
                disabled={isLoading || loading}
              />
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="........"
                className="w-full"
                required
                disabled={isLoading || loading}
              />
            </div>

            <div>
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-medium"
                disabled={isLoading || loading}
              >
                {isLoading || loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-4 py-2 rounded-md w-full"
              >
                Esqueci minha senha
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>Entre com suas credenciais de cliente.</p>
            <p>Acesse sua área personalizada de gestão financeira.</p>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-blue-600">
              Não tem uma conta? <a href="#" className="underline">Cadastre-se aqui</a>
            </p>
          </div>
          
          <div className="mt-8 text-center text-xs text-gray-500">
            Área exclusiva para clientes. Suas informações estão protegidas e seguras.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientLogin;
