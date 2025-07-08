import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff } from 'lucide-react';

const ClientLogin = () => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, signup, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/cliente');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Campos vazios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(loginEmail, loginPassword);
      
      if (success) {
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo à Área do Cliente Ascalate."
        });
        navigate('/cliente');
      } else {
        toast({
          title: "Falha no login",
          description: "Email ou senha inválidos.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao realizar o login. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupEmail || !signupPassword || !signupName || !confirmPassword) {
      toast({
        title: "Campos vazios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    if (signupPassword !== confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "A senha e confirmação devem ser iguais.",
        variant: "destructive"
      });
      return;
    }

    if (signupPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await signup(signupEmail, signupPassword, signupName);
      
      if (result.success) {
        toast({
          title: "Cadastro realizado com sucesso",
          description: "Verifique seu email para confirmar a conta."
        });
        // Reset form
        setSignupEmail('');
        setSignupPassword('');
        setSignupName('');
        setConfirmPassword('');
      } else {
        toast({
          title: "Falha no cadastro",
          description: result.error || "Erro ao criar conta.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar a conta. Tente novamente mais tarde.",
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
            Área do Cliente
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Acesse sua área exclusiva de serviços Ascalate
          </p>
        </div>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Cadastro</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form className="mt-8 space-y-6" onSubmit={handleLogin}>
              <div className="space-y-4 rounded-md shadow-sm">
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
                    Senha
                  </label>
                  <div className="mt-1 relative">
                    <Input
                      id="login-password"
                      name="password"
                      type={showLoginPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-1 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                    >
                      {showLoginPassword ? (
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
                  className="w-full bg-[#0056b3] hover:bg-[#003d7f]"
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form className="mt-8 space-y-6" onSubmit={handleSignup}>
              <div className="space-y-4 rounded-md shadow-sm">
                <div>
                  <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700">
                    Nome completo
                  </label>
                  <div className="mt-1">
                    <Input
                      id="signup-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">
                    Senha
                  </label>
                  <div className="mt-1 relative">
                    <Input
                      id="signup-password"
                      name="password"
                      type={showSignupPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-1 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                    >
                      {showSignupPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres</p>
                </div>
                
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                    Confirmar senha
                  </label>
                  <div className="mt-1 relative">
                    <Input
                      id="confirm-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-1 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
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
                  className="w-full bg-[#0056b3] hover:bg-[#003d7f]"
                  disabled={isLoading}
                >
                  {isLoading ? "Criando conta..." : "Criar conta"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
        
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