
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Shield } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { adminLogin, isAdminAuthenticated, loading } = useAdminAuth();

  // Redirect if already authenticated
  if (isAdminAuthenticated && !loading) {
    navigate('/admin');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos vazios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    if (!email.endsWith('@ascalate.com.br')) {
      toast({
        title: "Email inválido",
        description: "Apenas emails @ascalate.com.br são permitidos no painel administrativo.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await adminLogin(email, password);
      
      if (success) {
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo ao Painel Administrativo Ascalate."
        });
        navigate('/admin');
      } else {
        toast({
          title: "Falha no login",
          description: "Email ou senha inválidos. Verifique suas credenciais.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error during login:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao realizar o login. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast({
        title: "Email necessário",
        description: "Por favor, informe seu email para redefinir a senha.",
        variant: "destructive"
      });
      return;
    }

    if (!email.endsWith('@ascalate.com.br')) {
      toast({
        title: "Email inválido",
        description: "Apenas emails @ascalate.com.br são permitidos.",
        variant: "destructive"
      });
      return;
    }

    setIsResettingPassword(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/login`
      });

      if (error) {
        console.error('Password reset error:', error);
        toast({
          title: "Erro ao redefinir senha",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Email enviado",
          description: "Verifique sua caixa de entrada para redefinir sua senha."
        });
      }
    } catch (error) {
      console.error('Error during password reset:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar o email. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Logo className="h-12 w-auto" />
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Painel Administrativo
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <Shield size={18} className="text-red-600" />
            <p className="text-center text-sm text-gray-600">
              Acesso restrito à equipe Ascalate
            </p>
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@ascalate.com.br"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button
              type="submit"
              className="w-full bg-[#0056b3] hover:bg-[#003d7f]"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handlePasswordReset}
              disabled={isResettingPassword}
            >
              {isResettingPassword ? "Enviando..." : "Esqueci minha senha"}
            </Button>
          </div>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Área restrita a administradores. Em caso de problemas, contate o suporte técnico.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
