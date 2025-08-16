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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loading } = useAuth();
  const { checkAuthRateLimit, logSecurityEvent } = useSecurityContext();
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    const { email, password } = data;
    
    // Check rate limit before attempting login
    const allowed = await checkAuthRateLimit(email, 'login');
    if (!allowed) {
      return;
    }

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
    <div className="container relative flex h-[calc(100vh-80px)] flex-col items-center justify-center md:grid lg:max-w-none lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-zinc-900/80" />
        <div className="relative z-20 mt-auto">
          <div className="text-lg font-medium">
            Ascalate FP&A
          </div>
          <h2 className="mt-2 text-3xl font-bold text-white">
            Bem-vindo de volta
          </h2>
          <p className="mt-2 text-muted-foreground">
            Gerencie suas finanças com facilidade e segurança.
          </p>
        </div>
      </div>
      <div className="lg:p-8">
        <Card className="w-[350px]">
          <CardHeader className="space-y-1">
            <CardTitle>Acessar conta</CardTitle>
            <CardDescription>
              Entre com seu email e senha
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <SecureForm onSubmit={handleSubmit} formType="login">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="seuemail@exemplo.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  disabled={isLoading || loading}
                />
                <Mail className="absolute left-2.5 top-0.5 h-5 w-5 text-zinc-500 peer-focus:text-zinc-900" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  placeholder="Senha"
                  type="password"
                  autoComplete="current-password"
                  disabled={isLoading || loading}
                />
                <Key className="absolute left-2.5 top-0.5 h-5 w-5 text-zinc-500 peer-focus:text-zinc-900" />
              </div>
              <Button disabled={isLoading || loading} type="submit" className="w-full">
                {isLoading || loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </SecureForm>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientLogin;
