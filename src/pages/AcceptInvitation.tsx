import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Building, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface InvitationData {
  id: string;
  company_name: string;
  company_id: string;
  invited_email: string;
  inviter_name: string;
  status: string;
}

const AcceptInvitation = () => {
  const { invitationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (invitationId) {
      fetchInvitationData();
    }
  }, [invitationId]);

  const fetchInvitationData = async () => {
    try {
      console.log('Fetching invitation data for ID:', invitationId);
      
      const { data: invitationData, error } = await supabase
        .from('company_teams')
        .select(`
          id,
          invited_email,
          status,
          company_id,
          client_profiles!company_teams_company_id_fkey(
            company,
            name
          )
        `)
        .eq('id', invitationId)
        .eq('status', 'pending')
        .single();

      if (error) {
        console.error('Error fetching invitation:', error);
        throw error;
      }

      if (!invitationData) {
        throw new Error('Convite não encontrado ou já foi aceito');
      }

      const invitation: InvitationData = {
        id: invitationData.id,
        company_name: invitationData.client_profiles.company || 'Empresa',
        company_id: invitationData.company_id,
        invited_email: invitationData.invited_email,
        inviter_name: invitationData.client_profiles.name || 'Administrador',
        status: invitationData.status
      };

      setInvitation(invitation);
      console.log('Invitation data loaded:', invitation);
      
    } catch (error: any) {
      console.error('Error loading invitation:', error);
      setError(error.message || 'Erro ao carregar convite');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invitation) return;
    
    // Validations
    if (!formData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, preencha seu nome.",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "As senhas digitadas não são iguais.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      console.log('Starting signup process for:', invitation.invited_email);
      
      // 1. Create user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: invitation.invited_email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: formData.name,
            company: invitation.company_name
          }
        }
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('Erro ao criar conta de usuário');
      }

      console.log('User created successfully:', authData.user.id);

      // 2. Update invitation status to active and set member_id
      const { error: updateError } = await supabase
        .from('company_teams')
        .update({
          member_id: authData.user.id,
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      if (updateError) {
        console.error('Error updating invitation:', updateError);
        throw updateError;
      }

      console.log('Invitation updated successfully');

      // 3. Sign in the user immediately
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: invitation.invited_email,
        password: formData.password
      });

      if (signInError) {
        console.error('Auto sign-in error:', signInError);
        // Even if auto sign-in fails, the account was created successfully
      }

      toast({
        title: "Conta criada com sucesso!",
        description: `Bem-vindo à equipe da ${invitation.company_name}!`
      });

      // 4. Redirect to client area
      setTimeout(() => {
        navigate('/cliente');
      }, 1500);

    } catch (error: any) {
      console.error('Error during signup:', error);
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando convite...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Convite Inválido</h2>
              <p className="text-muted-foreground mb-4">
                {error || 'Este convite não é válido ou já foi aceito.'}
              </p>
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
              >
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Bem-vindo!</CardTitle>
          <CardDescription className="text-base">
            Você foi convidado para se juntar à equipe da <strong>{invitation.company_name}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert>
            <Building className="h-4 w-4" />
            <AlertDescription>
              <strong>{invitation.inviter_name}</strong> convidou você para colaborar na plataforma.
              Complete seu cadastro para começar!
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email (readonly) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={invitation.invited_email}
                  disabled
                  className="pl-10 bg-muted"
                />
              </div>
            </div>

            {/* Company (readonly) */}
            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="company"
                  type="text"
                  value={invitation.company_name}
                  disabled
                  className="pl-10 bg-muted"
                />
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Crie uma senha (mín. 6 caracteres)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Digite a senha novamente"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Criando conta...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Finalizar Cadastro
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Após o cadastro, você será automaticamente direcionado para o ambiente da empresa.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitation;