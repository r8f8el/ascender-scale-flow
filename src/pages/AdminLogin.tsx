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
  const { adminLogin, loading: contextLoading } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔑 AdminLogin: ===== FORM SUBMITTED =====');
    console.log('🔑 AdminLogin: Email:', email);
    console.log('🔑 AdminLogin: Password length:', password?.length || 0);
    console.log('🔑 AdminLogin: Context loading:', contextLoading);
    console.log('🔑 AdminLogin: Form loading:', isLoading);
    
    if (!email || !password) {
      console.log('❌ AdminLogin: Validation failed - Empty fields');
      toast({
        title: "Campos vazios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    if (!email.includes('@ascalate.com.br')) {
      console.log('❌ AdminLogin: Validation failed - Invalid domain');
      toast({
        title: "Email inválido",
        description: "Use um email @ascalate.com.br para acessar o painel administrativo.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    console.log('🔑 AdminLogin: Starting login process...');
    
    try {
      console.log('🔑 AdminLogin: Calling adminLogin function...');
      console.log('🔑 AdminLogin: adminLogin function exists:', typeof adminLogin === 'function');
      
      const loginResult = await adminLogin(email, password);
      console.log('🔑 AdminLogin: Login result:', loginResult);
      console.log('🔑 AdminLogin: Login result type:', typeof loginResult);
      
      if (loginResult === true) {
        console.log('✅ AdminLogin: Login successful, showing success toast');
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo ao Painel Administrativo Ascalate."
        });
        
        // Aguardar um pouco para o contexto atualizar
        setTimeout(() => {
          console.log('✅ AdminLogin: Navigating to /admin');
          navigate('/admin');
        }, 100);
      } else {
        console.log('❌ AdminLogin: Login failed');
        console.log('❌ AdminLogin: Login result was:', loginResult);
        toast({
          title: "Falha no login",
          description: "Email ou senha inválidos, ou você não tem permissão de administrador.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ AdminLogin: Exception during login:');
      console.error('  - Error:', error);
      
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao realizar o login. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      console.log('🏁 AdminLogin: Setting loading to false');
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
        description: "Ocorreu um erro ao enviar o email. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

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
              disabled={isLoading || contextLoading}
            >
              {isLoading || contextLoading ? "Entrando..." : "Entrar"}
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

          <div className="mt-4 text-center text-sm text-gray-600">
            <p>Entre com suas credenciais de administrador.</p>
            <p>Apenas usuários com email @ascalate.com.br podem acessar.</p>
            <p className="mt-2">
              Não tem uma conta? 
              <a href="/admin/register" className="text-blue-600 hover:text-blue-500 ml-1">
                Cadastre-se aqui
              </a>
            </p>
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
