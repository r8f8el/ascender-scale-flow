
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';

const ClientLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🔄 Usuário já autenticado, redirecionando...');
      navigate('/cliente/chamados', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
      console.log('🚀 Iniciando processo de login com:', email);
      const success = await login(email, password);
      
      if (success) {
        console.log('✅ Login bem-sucedido!');
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo à Área do Cliente Ascalate."
        });
        // O redirecionamento será feito pelo useEffect quando isAuthenticated for true
      } else {
        console.log('❌ Login falhou');
        toast({
          title: "Falha no login",
          description: "Email ou senha inválidos. Verifique suas credenciais.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('💥 Erro durante o login:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao realizar o login. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogin = (testEmail: string, testPassword: string) => {
    setEmail(testEmail);
    setPassword(testPassword);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Logo className="h-12 w-auto" />
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Área do Cliente
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Acesse sua área exclusiva de serviços Ascalate
          </p>
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
                  placeholder="Digite seu email"
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
                  placeholder="Digite sua senha"
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
        </form>
        
        <div className="mt-6 space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              <strong>Credenciais de teste:</strong>
            </p>
          </div>
          
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleTestLogin('cliente@portobello.com.br', 'portobello123')}
              className="w-full text-left px-3 py-2 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            >
              <strong>Portobello:</strong> cliente@portobello.com.br / portobello123
            </button>
            
            <button
              type="button"
              onClick={() => handleTestLogin('cliente@jassy.com.br', 'jassy123')}
              className="w-full text-left px-3 py-2 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            >
              <strong>J.Assy:</strong> cliente@jassy.com.br / jassy123
            </button>
            
            <button
              type="button"
              onClick={() => handleTestLogin('teste@ascalate.com.br', 'teste123')}
              className="w-full text-left px-3 py-2 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            >
              <strong>Teste:</strong> teste@ascalate.com.br / teste123
            </button>
          </div>
        </div>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Em caso de dificuldades no acesso, entre em contato com nossa equipe pelo email:
          <br />
          <a href="mailto:rafael.gontijo@ascalate.com.br" className="font-medium text-[#0056b3] hover:text-[#003d7f]">
            rafael.gontijo@ascalate.com.br
          </a>
        </p>
      </div>
    </div>
  );
};

export default ClientLogin;
