
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ClientLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAccountHelp, setShowAccountHelp] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Check for signup success message
  const signupSuccess = searchParams.get('signup') === 'success';
  const stateMessage = location.state?.message;
  const stateEmail = location.state?.email;

  useEffect(() => {
    if (stateEmail) {
      setEmail(stateEmail);
    }
  }, [stateEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Email e senha são obrigatórios');
      setLoading(false);
      return;
    }

    try {
      console.log('🔐 Attempting client login for:', email);
      const result = await login(email, password);
      
      if (result?.error) {
        console.error('❌ Login failed:', result.error);
        
        // Handle specific error cases
        if (result.error.message?.includes('Email not confirmed')) {
          setError('Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.');
          toast.error('Email não confirmado', {
            description: 'Verifique sua caixa de entrada e confirme seu email antes de fazer login.'
          });
        } else if (result.error.message?.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos');
          toast.error('Credenciais inválidas');
        } else {
          setError('Email ou senha incorretos');
          toast.error('Erro ao fazer login');
        }
      } else {
        console.log('✅ Login successful, redirecting to /cliente');
        toast.success('Login realizado com sucesso!');
        navigate('/cliente');
      }
    } catch (error) {
      console.error('❌ Login exception:', error);
      setError('Erro interno. Tente novamente.');
      toast.error('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      toast.error('Por favor, digite seu email primeiro');
      return;
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/confirmar-email`
        }
      });

      if (error) throw error;

      toast.success('Email de confirmação reenviado!', {
        description: 'Verifique sua caixa de entrada (incluindo spam).'
      });
    } catch (error: any) {
      toast.error('Erro ao reenviar email', {
        description: error.message
      });
    }
  };

  const handleAccountCleanup = async () => {
    if (!email) {
      toast.error('Por favor, digite seu email primeiro');
      return;
    }

    setCleanupLoading(true);
    try {
      // Verificar se existe perfil ativo
      const { data: profile } = await supabase
        .from('client_profiles')
        .select('id, email, created_at')
        .eq('email', email)
        .maybeSingle();

      if (profile) {
        toast.error('Este email já possui uma conta ativa', {
          description: 'Use "Esqueci minha senha" se não lembrar da senha.'
        });
        return;
      }

      toast.success('Verificação concluída!', {
        description: 'Este email não possui conta ativa. Você pode tentar se registrar novamente.'
      });
      
      // Redirecionar para registro
      navigate('/cliente/registro', { 
        state: { 
          email: email,
          message: 'Email verificado. Você pode criar sua conta agora.'
        }
      });
      
    } catch (error: any) {
      console.error('Erro na limpeza:', error);
      toast.error('Erro ao verificar conta', {
        description: 'Tente novamente ou entre em contato com o suporte.'
      });
    } finally {
      setCleanupLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <Logo className="h-16 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Área do Cliente
          </h1>
        </div>

        {/* Success Message from Signup */}
        {signupSuccess && stateMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {stateMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Login Card */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Senha
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Esqueci minha senha
              </button>
              
              <div className="mt-2">
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Reenviar email de confirmação
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Problemas para criar conta?</p>
                <button
                  type="button"
                  onClick={handleAccountCleanup}
                  disabled={cleanupLoading}
                  className="text-sm text-orange-600 hover:text-orange-800 disabled:opacity-50"
                >
                  {cleanupLoading ? 'Verificando...' : 'Verificar se posso criar conta com este email'}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Text */}
        <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
          <p>Entre com suas credenciais de cliente.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <p className="text-blue-800 text-xs">
              <strong>Importante:</strong> Após criar uma conta, você deve confirmar seu email antes de fazer login. Verifique sua caixa de entrada (incluindo spam).
            </p>
          </div>
          
          {/* Account Help Section */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-4">
            <p className="text-orange-800 text-xs mb-2">
              <strong>Não consegue criar conta?</strong> Se aparece "já existe conta" mas você não consegue fazer login:
            </p>
            <ol className="text-orange-800 text-xs list-decimal list-inside space-y-1">
              <li>Digite seu email no campo acima</li>
              <li>Clique em "Verificar se posso criar conta"</li>
              <li>Se não tiver conta ativa, será direcionado para o registro</li>
            </ol>
          </div>
          
          <p className="mt-4">
            Não tem uma conta?{' '}
            <Link 
              to="/cliente/registro"
              className="text-blue-600 hover:text-blue-700"
            >
              Criar conta
            </Link>
          </p>
        </div>

        {/* Back to site link */}
        <div className="mt-4 text-center">
          <Link to="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao site
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClientLogin;
