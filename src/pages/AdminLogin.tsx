
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Shield, Eye, EyeOff } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { adminLogin } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha.",
        variant: "destructive"
      });
      return;
    }

    if (!email.endsWith('@ascalate.com.br')) {
      toast({
        title: "Acesso restrito",
        description: "Apenas emails @ascalate.com.br são permitidos.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('🔐 Tentando login para:', email);
      
      const success = await adminLogin(email, password);
      
      if (success) {
        toast({
          title: "Login realizado com sucesso",
          description: "Redirecionando para o painel administrativo..."
        });
        
        // Pequeno delay para mostrar o toast
        setTimeout(() => {
          navigate('/admin');
        }, 1000);
      } else {
        toast({
          title: "Falha na autenticação",
          description: "Email ou senha incorretos. Verifique suas credenciais.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Erro durante login:', error);
      toast({
        title: "Erro no sistema",
        description: "Ocorreu um erro interno. Tente novamente em alguns instantes.",
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
                Email Corporativo
              </label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isLoading}
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
              <div className="mt-1 relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <Button
              type="submit"
              className="w-full bg-[#0056b3] hover:bg-[#003d7f] disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Autenticando...
                </div>
              ) : (
                "Entrar no Painel"
              )}
            </Button>
          </div>

          <div className="mt-4 text-center text-sm text-gray-600">
            <p>Sistema de Gestão Ascalate</p>
            <p className="mt-1 text-xs">
              Apenas colaboradores autorizados podem acessar
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
