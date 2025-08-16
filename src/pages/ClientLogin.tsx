
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ClientLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

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
      const result = await login(email, password);
      
      if (result?.error) {
        setError('Email ou senha incorretos');
        toast.error('Erro ao fazer login');
      } else {
        toast.success('Login realizado com sucesso!');
        navigate('/cliente');
      }
    } catch (error) {
      console.error('Erro no login:', error);
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
          <p className="text-sm text-gray-600 flex items-center justify-center">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
            Acesso restrito à equipe Ascalate
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
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
                  placeholder="seu.email@ascalate.com.br"
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
              />
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Esqueci minha senha
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Footer Text */}
        <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
          <p>Entre com suas credenciais de administrador.</p>
          <p>Apenas usuários com email @ascalate.com.br podem acessar.</p>
          <p className="mt-4">
            Não tem uma conta?{' '}
            <button className="text-blue-600 hover:text-blue-700">
              Cadastre-se aqui
            </button>
          </p>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          Área restrita a administradores. Em caso de problemas, contate o suporte técnico.
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
