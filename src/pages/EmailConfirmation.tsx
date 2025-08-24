import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EmailConfirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Verificar se tem parâmetros de erro na URL
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (error) {
          console.log('❌ Erro na confirmação:', error, errorDescription);
          
          if (error === 'access_denied' && errorDescription?.includes('expired')) {
            setStatus('expired');
            setMessage('O link de confirmação expirou. Solicite um novo email de confirmação.');
            return;
          }
          
          setStatus('error');
          setMessage(errorDescription || 'Erro na confirmação do email.');
          return;
        }

        // Verificar se já está logado
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('✅ Usuário já autenticado:', session.user.email);
          setStatus('success');
          setMessage(`Email confirmado com sucesso! Redirecionando para a área do cliente...`);
          
          toast({
            title: "Email confirmado!",
            description: "Sua conta foi ativada com sucesso.",
          });
          
          setTimeout(() => {
            navigate('/cliente');
          }, 2000);
          return;
        }

        // Se chegou até aqui e não há sessão, algo deu errado
        console.log('❌ Nenhuma sessão encontrada após confirmação');
        setStatus('error');
        setMessage('Erro ao processar a confirmação. Tente fazer login manualmente.');
        
      } catch (error: any) {
        console.error('❌ Erro ao processar confirmação:', error);
        setStatus('error');
        setMessage('Erro interno. Tente novamente ou faça login manualmente.');
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate, toast]);

  const handleResendEmail = async () => {
    const email = searchParams.get('email') || prompt('Digite seu email para reenviar a confirmação:');
    
    if (!email) return;

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/confirmar-email`
        }
      });

      if (error) throw error;

      toast({
        title: "Email reenviado!",
        description: "Verifique sua caixa de entrada (incluindo spam).",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao reenviar email",
        description: error.message,
      });
    }
  };

  const handleGoToLogin = () => {
    navigate('/cliente/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Confirmação de Email</h1>
          <p className="text-gray-600 mt-2">
            Verificando sua confirmação de email...
          </p>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {status === 'loading' && (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  Processando confirmação...
                </>
              )}
              {status === 'success' && (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Email Confirmado!
                </>
              )}
              {(status === 'error' || status === 'expired') && (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  {status === 'expired' ? 'Link Expirado' : 'Erro na Confirmação'}
                </>
              )}
            </CardTitle>
            <CardDescription>
              {status === 'loading' && 'Aguarde enquanto processamos sua confirmação...'}
              {status === 'success' && 'Sua conta foi ativada com sucesso!'}
              {status === 'error' && 'Houve um problema ao confirmar seu email.'}
              {status === 'expired' && 'O link de confirmação não é mais válido.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {message && (
              <Alert className={`mb-4 ${
                status === 'success' ? 'border-green-200 bg-green-50' : 
                status === 'error' || status === 'expired' ? 'border-red-200 bg-red-50' : 
                'border-blue-200 bg-blue-50'
              }`}>
                <AlertDescription className={
                  status === 'success' ? 'text-green-800' : 
                  status === 'error' || status === 'expired' ? 'text-red-800' : 
                  'text-blue-800'
                }>
                  {message}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              {status === 'expired' && (
                <Button
                  onClick={handleResendEmail}
                  className="w-full"
                  variant="default"
                >
                  Reenviar Email de Confirmação
                </Button>
              )}
              
              {(status === 'error' || status === 'expired') && (
                <Button
                  onClick={handleGoToLogin}
                  className="w-full"
                  variant="outline"
                >
                  Ir para Login
                </Button>
              )}
              
              {status === 'success' && (
                <div className="text-center text-sm text-gray-600">
                  Redirecionando automaticamente em alguns segundos...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Voltar ao início
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;