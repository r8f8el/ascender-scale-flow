
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, User, AlertTriangle } from 'lucide-react';
import { SecureForm } from '@/components/security/SecureForm';
import { useSecurityContext } from '@/components/security/SecureAuthWrapper';

const ClientLogin = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { logSecurityEvent } = useSecurityContext();

  const handleSubmit = async (data: any) => {
    setError('');
    setIsLoading(true);

    try {
      await signIn(data.email, data.password);
      await logSecurityEvent('client_login_success', 'client_auth', {
        email: data.email,
        timestamp: new Date().toISOString()
      });
      navigate('/cliente');
    } catch (error: any) {
      console.error('Login error:', error);
      await logSecurityEvent('client_login_failed', 'client_auth', {
        email: data.email,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      setError('Email ou senha inválidos. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-orange-600 p-3 rounded-full">
              <User className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Portal do Cliente</CardTitle>
          <CardDescription>
            Acesse sua conta para gerenciar projetos e documentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SecureForm onSubmit={handleSubmit} formType="login" className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
                autoComplete="email"
                className="transition-all duration-200"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua senha"
                  required
                  autoComplete="current-password"
                  className="pr-10 transition-all duration-200"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </SecureForm>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              É administrador?{' '}
              <Link to="/admin/login" className="text-orange-600 hover:underline">
                Acesse a área administrativa
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientLogin;
