
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useSecureInviteSignup } from '@/hooks/useSecureInviteSignup';
import { toast } from 'sonner';

const ConviteEquipeCadastro = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  console.log('🔍 ConviteEquipeCadastro - Token recebido:', token);
  console.log('🔍 ConviteEquipeCadastro - URL atual:', window.location.href);

  const { inviteData, companyData, loading, error, acceptInvite } = useSecureInviteSignup(token);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    console.log('🔍 ConviteEquipeCadastro - Estado atual:', {
      loading,
      error,
      inviteData,
      companyData,
      token
    });

    if (inviteData) {
      setFormData(prev => ({
        ...prev,
        email: inviteData.email
      }));
    }
  }, [inviteData, loading, error]);

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'A senha deve ter pelo menos 6 caracteres';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    console.log('🚀 ConviteEquipeCadastro - Iniciando submit:', formData);

    // Validações
    if (!formData.name.trim()) {
      setSubmitError('Nome é obrigatório');
      return;
    }

    if (!formData.email) {
      setSubmitError('Email é obrigatório');
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setSubmitError(passwordError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setSubmitError('As senhas não coincidem');
      return;
    }

    setSubmitting(true);

    try {
      const result = await acceptInvite({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password
      });

      console.log('✅ ConviteEquipeCadastro - Resultado:', result);

      if (result.success) {
        toast.success('Conta criada com sucesso!', {
          description: 'Verifique seu email para confirmar a conta antes de fazer login.'
        });
        
        // Redirecionar para a página de login com uma mensagem
        navigate('/cliente/login?signup=success', { 
          state: { 
            message: 'Conta criada! Verifique seu email para confirmar antes de fazer login.',
            email: formData.email 
          }
        });
      } else {
        setSubmitError(result.error || 'Erro ao criar conta');
      }
    } catch (err) {
      console.error('❌ ConviteEquipeCadastro - Erro ao aceitar convite:', err);
      setSubmitError('Erro interno. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // Debug: verificar se não há token
  if (!token) {
    console.error('❌ ConviteEquipeCadastro - Token não encontrado na URL');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Token de Convite Necessário</h3>
            <p className="text-gray-600 mb-4">
              Esta página requer um token de convite válido.
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              Ir para página inicial
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    console.log('🔄 ConviteEquipeCadastro - Carregando...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p>Validando convite...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !inviteData) {
    console.error('❌ ConviteEquipeCadastro - Erro ou dados de convite não encontrados:', { error, inviteData });
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Convite Inválido</h3>
            <p className="text-gray-600 mb-4">
              {error || 'Este convite não é válido ou já expirou.'}
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              Ir para página inicial
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('✅ ConviteEquipeCadastro - Renderizando formulário com dados:', { inviteData, companyData });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="h-16 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Bem-vindo à Equipe!
          </h1>
          <p className="text-gray-600">
            Complete seu cadastro para acessar a plataforma
          </p>
        </div>

        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-center">
              Convite de {inviteData.inviter_name}
            </CardTitle>
            <p className="text-sm text-gray-600 text-center">
              Empresa: {companyData?.name || inviteData.company_id}
            </p>
            {inviteData.message && (
              <Alert className="mt-2">
                <AlertDescription className="text-sm">
                  "{inviteData.message}"
                </AlertDescription>
              </Alert>
            )}
          </CardHeader>

          <CardContent className="p-6 pt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Seu nome completo"
                  className="h-12"
                  disabled={submitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  className="h-12 bg-gray-50"
                  disabled
                  readOnly
                />
                <p className="text-xs text-gray-500">
                  Email do convite (não pode ser alterado)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Mínimo 6 caracteres"
                    className="h-12 pr-10"
                    disabled={submitting}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Digite a senha novamente"
                    className="h-12 pr-10"
                    disabled={submitting}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  'Criar conta e aceitar convite'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Ao criar sua conta, você concorda com os termos de uso da plataforma.
          </p>
          <p className="mt-2">
            Após criar a conta, você precisará confirmar seu email antes de fazer login.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConviteEquipeCadastro;
