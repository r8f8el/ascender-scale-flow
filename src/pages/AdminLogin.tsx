
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { adminLogin } = useAdminAuth();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const sanitizeInput = (input: string) => {
    return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);
    
    if (!sanitizedEmail || !sanitizedPassword) {
      toast({
        title: "Campos vazios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    if (!validateEmail(sanitizedEmail)) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive"
      });
      return;
    }

    if (!sanitizedEmail.includes('@ascalate.com.br')) {
      toast({
        title: "Acesso negado",
        description: "Apenas emails da Ascalate podem criar contas administrativas.",
        variant: "destructive"
      });
      return;
    }

    if (sanitizedPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: sanitizedPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`
        }
      });
      
      if (error) {
        if (error.message.includes('User already registered')) {
          toast({
            title: "Email já cadastrado",
            description: "Este email já possui uma conta. Tente fazer login.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro no cadastro",
            description: error.message,
            variant: "destructive"
          });
        }
      } else if (data.user) {
        toast({
          title: "Conta criada com sucesso",
          description: "Sua conta administrativa foi criada. Você pode fazer login agora.",
        });
        setIsSignUp(false);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);
    
    if (!sanitizedEmail || !sanitizedPassword) {
      toast({
        title: "Campos vazios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    if (!validateEmail(sanitizedEmail)) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive"
      });
      return;
    }

    if (!sanitizedEmail.includes('@ascalate.com.br')) {
      toast({
        title: "Acesso negado",
        description: "Apenas emails da Ascalate podem acessar o painel administrativo.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await adminLogin(sanitizedEmail, sanitizedPassword);
      
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
        
        <div className="flex justify-center space-x-4 mb-6">
          <button
            type="button"
            onClick={() => setIsSignUp(false)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              !isSignUp 
                ? 'bg-[#0056b3] text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsSignUp(true)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              isSignUp 
                ? 'bg-[#0056b3] text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Criar Conta
          </button>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={isSignUp ? handleSignUp : handleLogin}>
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
                  maxLength={254}
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
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1"
                  maxLength={128}
                />
              </div>
              {isSignUp && (
                <p className="mt-1 text-xs text-gray-500">
                  Mínimo de 6 caracteres
                </p>
              )}
            </div>
          </div>
          
          <div>
            <Button
              type="submit"
              className="w-full bg-[#0056b3] hover:bg-[#003d7f]"
              disabled={isLoading}
            >
              {isLoading 
                ? (isSignUp ? "Criando conta..." : "Entrando...") 
                : (isSignUp ? "Criar Conta Admin" : "Entrar")
              }
            </Button>
          </div>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          {isSignUp 
            ? "Crie sua conta administrativa usando um email @ascalate.com.br"
            : "Área restrita a administradores. Em caso de problemas, contate o suporte técnico."
          }
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
