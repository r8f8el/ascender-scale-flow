
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
                  onClick={async () => {
                    if (!email) {
                      toast.error('Digite seu email primeiro');
                      return;
                    }
                    try {
                      await supabase.auth.resend({ 
                        type: 'signup', 
                        email: email,
                        options: {
                          emailRedirectTo: `${window.location.origin}/cliente/login`
                        }
                      });
                      toast.success('Email de confirmação reenviado! Verifique sua caixa de entrada e spam.');
                    } catch (error) {
                      toast.error('Erro ao reenviar email. Verifique se o email está correto.');
                    }
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Reenviar email de confirmação
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
              <strong>Importante:</strong> Após criar uma conta através de convite, você deve confirmar seu email antes de fazer login. Verifique sua caixa de entrada.
            </p>
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
