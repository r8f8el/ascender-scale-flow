import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, User, Building, Mail, Phone, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  company: string;
  cnpj: string;
  phone: string;
}

const ClientRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    company: '',
    cnpj: '',
    phone: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password || !formData.name || !formData.company) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return false;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, insira um email válido.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      console.log('🔐 Iniciando registro de cliente:', formData.email);

      // Registrar usuário no Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/cliente/login`,
          data: {
            name: formData.name,
            company: formData.company,
            cnpj: formData.cnpj,
            phone: formData.phone,
            is_primary_contact: true
          }
        }
      });

      if (signUpError) {
        console.error('❌ Erro no registro:', signUpError);
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('Erro ao criar usuário');
      }

      console.log('✅ Usuário criado com sucesso:', authData.user.id);

      // Criar perfil do cliente
      const { error: profileError } = await supabase
        .from('client_profiles')
        .insert({
          id: authData.user.id,
          name: formData.name,
          email: formData.email,
          company: formData.company,
          cnpj: formData.cnpj || null,
          is_primary_contact: true
        });

      if (profileError) {
        console.error('❌ Erro ao criar perfil:', profileError);
        // Continuar mesmo se houver erro no perfil, pois o trigger deve criar automaticamente
      }

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Verifique seu email para confirmar sua conta, depois faça login.",
      });

      // Redirecionar para login com mensagem de sucesso
      navigate('/cliente/login?signup=success&message=Cadastro realizado! Verifique seu email e faça login.');
      
    } catch (error: any) {
      console.error('❌ Erro durante o cadastro:', error);
      
      let errorMessage = 'Ocorreu um erro durante o cadastro. Tente novamente.';
      
      if (error.message?.includes('User already registered')) {
        errorMessage = 'Este email já está cadastrado. Tente fazer login ou usar outro email.';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Email inválido. Por favor, verifique o formato do email.';
      } else if (error.message?.includes('Password')) {
        errorMessage = 'Senha inválida. A senha deve ter pelo menos 6 caracteres.';
      }
      
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Criar Conta</h1>
          <p className="text-gray-600 mt-2">
            Registre-se para acessar nossa plataforma
          </p>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Dados da Conta</CardTitle>
            <CardDescription>
              Preencha os dados para criar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repita sua senha"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Company */}
              <div className="space-y-2">
                <Label htmlFor="company">Empresa *</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    placeholder="Nome da sua empresa"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* CNPJ */}
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="cnpj"
                    name="cnpj"
                    type="text"
                    placeholder="00.000.000/0001-00"
                    value={formData.cnpj}
                    onChange={handleInputChange}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link
              to="/cliente/login"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Fazer login
            </Link>
          </p>
        </div>

        {/* Home Link */}
        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClientRegister;