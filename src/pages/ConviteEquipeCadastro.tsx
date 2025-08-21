
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Users, Mail, Lock, User, Building2, UserPlus } from 'lucide-react';
import { useSecureInviteSignup } from '@/hooks/useSecureInviteSignup';
import { toast } from 'sonner';

const ConviteEquipeCadastro = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { inviteData, companyData, loading, error, acceptInvite } = useSecureInviteSignup(token);

  useEffect(() => {
    if (!token) {
      navigate('/cliente/login');
      return;
    }

    if (error) {
      toast.error(error);
    }
  }, [token, error, navigate]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Email inválido';
    } else if (inviteData && formData.email.toLowerCase() !== inviteData.email.toLowerCase()) {
      errors.email = 'O email deve ser o mesmo do convite';
    }

    if (!formData.password) {
      errors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Senhas não coincidem';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await acceptInvite({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });

      if (result.success) {
        toast.success('Conta criada com sucesso! Faça login para continuar.');
        navigate('/cliente/login');
      } else {
        toast.error(result.error || 'Erro ao criar conta');
      }
    } catch (error) {
      console.error('Erro ao aceitar convite:', error);
      toast.error('Erro interno ao processar cadastro');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">Validando convite...</p>
        </div>
      </div>
    );
  }

  if (error || !inviteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Convite Inválido</h2>
            <p className="text-gray-600 mb-6">
              {error || 'O convite não foi encontrado ou já expirou.'}
            </p>
            <Button 
              onClick={() => navigate('/cliente/login')} 
              variant="outline"
              className="w-full"
            >
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Cabeçalho do Convite */}
        <Card className="mb-6 border-blue-200 bg-white/90 backdrop-blur">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Você foi convidado!
            </h1>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Building2 className="h-4 w-4" />
                <span>Empresa: <strong>{companyData?.name || 'Carregando...'}</strong></span>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <UserPlus className="h-4 w-4" />
                <span>Convidado por: <strong>{inviteData.inviter_name}</strong></span>
              </div>
            </div>
            {inviteData.message && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm text-blue-800 border border-blue-200">
                "{inviteData.message}"
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formulário de Cadastro */}
        <Card className="border-gray-200 bg-white/95 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-center text-gray-900">
              Complete seu cadastro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`pl-10 ${formErrors.name ? 'border-red-500' : ''}`}
                    disabled={isSubmitting}
                  />
                </div>
                {formErrors.name && (
                  <p className="text-xs text-red-600">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Seu email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 ${formErrors.email ? 'border-red-500' : ''}`}
                    disabled={isSubmitting}
                  />
                </div>
                {formErrors.email && (
                  <p className="text-xs text-red-600">{formErrors.email}</p>
                )}
                <p className="text-xs text-gray-500">
                  Use o mesmo email do convite: {inviteData.email}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Crie uma senha"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pl-10 ${formErrors.password ? 'border-red-500' : ''}`}
                    disabled={isSubmitting}
                  />
                </div>
                {formErrors.password && (
                  <p className="text-xs text-red-600">{formErrors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirme sua senha"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`pl-10 ${formErrors.confirmPassword ? 'border-red-500' : ''}`}
                    disabled={isSubmitting}
                  />
                </div>
                {formErrors.confirmPassword && (
                  <p className="text-xs text-red-600">{formErrors.confirmPassword}</p>
                )}
              </div>

              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Ao criar sua conta, você terá acesso ao painel da empresa e poderá colaborar com a equipe.
                </AlertDescription>
              </Alert>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Criar conta e aceitar convite
                  </>
                )}
              </Button>

              <div className="text-center">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => navigate('/cliente/login')}
                  disabled={isSubmitting}
                  className="text-sm"
                >
                  Já tem uma conta? Faça login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConviteEquipeCadastro;
