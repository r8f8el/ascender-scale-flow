
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
  const { adminLogin, loading: contextLoading } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔑 AdminLogin: Form submitted');
    
    if (!email || !password) {
      toast({
        title: "Campos vazios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    if (!email.includes('@ascalate.com.br')) {
      toast({
        title: "Email inválido",
        description: "Use um email @ascalate.com.br para acessar o painel administrativo.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('🔑 AdminLogin: Calling adminLogin...');
      const success = await adminLogin(email, password);
      
      if (success) {
        console.log('✅ AdminLogin: Login successful');
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo ao Painel Administrativo Ascalate."
        });
        
        // Aguardar um pouco para garantir que o contexto seja atualizado
        setTimeout(() => {
          navigate('/admin');
        }, 1000);
      } else {
        console.log('❌ AdminLogin: Login failed');
        toast({
          title: "Falha no login",
          description: "Email ou senha inválidos, ou você não tem permissão de administrador.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ AdminLogin: Exception:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao realizar o login. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = isLoading || contextLoading;

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
                  disabled={isButtonDisabled}
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
                  disabled={isButtonDisabled}
                />
              </div>
            </div>
          </div>
          
          <div>
            <Button
              type="submit"
              className="w-full bg-[#0056b3] hover:bg-[#003d7f]"
              disabled={isButtonDisabled}
            >
              {isButtonDisabled ? "Entrando..." : "Entrar"}
            </Button>
          </div>

          <div className="mt-4 text-center text-sm text-gray-600">
            <p>Entre com suas credenciais de administrador.</p>
            <p>Apenas usuários com email @ascalate.com.br podem acessar.</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
