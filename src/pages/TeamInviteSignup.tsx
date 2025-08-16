
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, User, Mail, Lock, CheckCircle } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { toast } from 'sonner';
import { useInviteSignup } from '@/hooks/useInviteSignup';

/**
 * Página de inscrição por convite
 * Esta página permite que usuários convidados se registrem na plataforma
 * através de um link enviado por email
 */
const TeamInviteSignup = () => {
  // Estados do formulário
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Hooks de navegação e parâmetros
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const inviteId = searchParams.get('invite');

  // Hook personalizado para gerenciar convites
  const { 
    inviteData, 
    companyData, 
    loading: inviteLoading, 
    error: inviteError,
    acceptInvite 
  } = useInviteSignup(token, inviteId);

  // Pré-preenche o email se disponível no convite
  useEffect(() => {
    if (inviteData?.email) {
      setFormData(prev => ({ ...prev, email: inviteData.email }));
    }
  }, [inviteData]);

  /**
   * Valida os campos do formulário
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validação do nome
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Validação do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validação da senha
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    // Validação da confirmação de senha
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Manipula a mudança nos campos do formulário
   */
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Remove erro do campo quando o usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * Manipula o envio do formulário
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    setLoading(true);

    try {
      const result = await acceptInvite({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      });

      if (result.success) {
        toast.success('Inscrição realizada com sucesso!');
        setTimeout(() => {
          navigate('/cliente/login');
        }, 2000);
      } else {
        toast.error(result.error || 'Erro ao processar inscrição');
      }
    } catch (error) {
      console.error('Erro na inscrição:', error);
      toast.error('Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Estado de carregamento
  if (inviteLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-lg text-gray-600">Carregando convite...</div>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (inviteError || !inviteData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Convite Inválido
            </h2>
            <p className="text-gray-600 mb-6">
              {inviteError || 'Este convite não é válido ou expirou.'}
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="w-full"
            >
              Voltar ao Site
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Cabeçalho com Logo e Nome da Empresa */}
        <div className="text-center mb-8">
          <Logo className="h-16 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {companyData?.name || 'Ascalate'}
          </h1>
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-sm text-green-600 font-medium">
              Convite Válido
            </span>
          </div>
        </div>

        {/* Mensagem de Convite */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <User className="w-5 h-5 text-blue-500 mt-0.5" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                <strong>Você foi convidado por {inviteData.inviter_name}</strong> para se inscrever em nossa plataforma.
              </p>
              {inviteData.message && (
                <p className="text-xs text-blue-600 mt-1">
                  "{inviteData.message}"
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Formulário de Inscrição */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-center text-gray-900">
              Complete sua Inscrição
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 pt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo Nome */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`h-12 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                      errors.name ? 'border-red-500' : ''
                    }`}
                    disabled={loading}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Campo Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`h-12 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                    disabled={loading || !!inviteData?.email}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Campo Senha */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`h-12 pl-10 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                      errors.password ? 'border-red-500' : ''
                    }`}
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
                {errors.password && (
                  <p className="text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Campo Confirmar Senha */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirme sua senha"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`h-12 pl-10 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                      errors.confirmPassword ? 'border-red-500' : ''
                    }`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Botão de Inscrição */}
              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium mt-6"
                disabled={loading}
              >
                {loading ? 'Processando...' : 'Completar Inscrição'}
              </Button>
            </form>

            {/* Informações de Segurança */}
            <div className="mt-6 text-center text-xs text-gray-500">
              <p>Ao se inscrever, você concorda com nossos termos de uso.</p>
              <p className="mt-1">Seus dados estão protegidos e criptografados.</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Já tem uma conta?{' '}
            <button 
              onClick={() => navigate('/cliente/login')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Faça login aqui
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeamInviteSignup;
