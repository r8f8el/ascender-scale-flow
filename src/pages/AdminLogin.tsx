
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Shield } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { adminLogin } = useAdminAuth();

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
          description: "Email ou senha inválidos.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error during login:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao realizar o login. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
          
          <div>
            <Button
              type="submit"
              className="w-full bg-[#0056b3] hover:bg-[#003d7f]"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
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
