
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSecurityContext } from '@/components/security/SecureAuthWrapper';
import { SecureForm } from '@/components/security/SecureForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, Key } from 'lucide-react';

const ClientLogin: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login, loading } = useAuth();
  const { logSecurityEvent } = useSecurityContext();
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    const { email, password } = data;
    
    setIsLoading(true);
    try {
      const { error } = await login(email, password);
      
      if (!error) {
        await logSecurityEvent('client_login_success', 'auth', { email });
        navigate('/cliente');
      } else {
        await logSecurityEvent('client_login_failed', 'auth', { email });
        toast.error('Credenciais inválidas');
      }
    } catch (error) {
      console.error('Login error:', error);
      await logSecurityEvent('client_login_error', 'auth', { email, error: String(error) });
      toast.error('Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container relative flex h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          Ascalate FP&A
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Gerencie suas finanças com facilidade e segurança.&rdquo;
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Acessar conta
            </h1>
            <p className="text-sm text-muted-foreground">
              Entre com seu email e senha
            </p>
          </div>
          <div className="grid gap-6">
            <SecureForm onSubmit={handleSubmit} formType="login">
              <div className="grid gap-2">
                <div className="grid gap-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    placeholder="seuemail@exemplo.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading || loading}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    name="password"
                    placeholder="Senha"
                    type="password"
                    autoComplete="current-password"
                    disabled={isLoading || loading}
                  />
                </div>
                <Button disabled={isLoading || loading} type="submit" className="w-full">
                  {isLoading || loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </div>
            </SecureForm>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientLogin;
