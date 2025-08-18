
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, User, MessageCircle, Shield, Send } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSecureAuth } from '@/hooks/useSecureAuth';

interface SecureInviteTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SecureInviteTeamMemberDialog: React.FC<SecureInviteTeamMemberDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { user } = useSecureAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (formData.message.length > 500) {
      newErrors.message = 'Mensagem muito longa (máximo 500 caracteres)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendInvite = async () => {
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    setLoading(true);

    try {
      // Buscar dados da empresa atual
      const { data: profile, error: profileError } = await supabase
        .from('client_profiles')
        .select('company, name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        toast.error('Erro ao buscar dados da empresa');
        return;
      }

      // Criar convite seguro na tabela team_invitations
      const inviteToken = crypto.randomUUID() + '-' + Date.now();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias para expirar

      const { data: inviteData, error: inviteError } = await supabase
        .from('team_invitations')
        .insert({
          company_id: user.id,
          email: formData.email.trim().toLowerCase(),
          inviter_name: profile.name || user.email || 'Administrador',
          token: inviteToken,
          message: formData.message.trim() || null,
          expires_at: expiresAt.toISOString(),
          status: 'pending'
        })
        .select()
        .single();

      if (inviteError) {
        console.error('Erro ao criar convite:', inviteError);
        if (inviteError.code === '23505') {
          toast.error('Este email já foi convidado');
        } else {
          toast.error('Erro ao criar convite');
        }
        return;
      }

      // Criar entrada na tabela team_members
      const { error: teamError } = await supabase
        .from('team_members')
        .insert({
          company_id: user.id,
          invited_email: formData.email.trim().toLowerCase(),
          name: formData.name.trim(),
          invited_by: user.id,
          status: 'pending'
        });

      if (teamError) {
        console.error('Erro ao criar membro da equipe:', teamError);
        // Continua mesmo com erro, pois o convite principal foi criado
      }

      // Enviar email de convite
      const inviteUrl = `${window.location.origin}/convite/inscrever?token=${inviteToken}`;
      
      const { error: emailError } = await supabase.functions.invoke('send-invitation-email', {
        body: {
          to: formData.email.trim().toLowerCase(),
          inviterName: profile.name || user.email || 'Administrador',
          invitedName: formData.name.trim(),
          companyName: profile.company || 'Ascalate',
          inviteUrl: inviteUrl,
          message: formData.message.trim() || undefined
        }
      });

      if (emailError) {
        console.error('Erro ao enviar email:', emailError);
        toast.error('Convite criado, mas houve erro no envio do email');
      } else {
        toast.success('Convite enviado com sucesso!');
      }

      // Reset form and close dialog
      setFormData({ email: '', name: '', message: '' });
      setErrors({});
      onOpenChange(false);

    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      toast.error('Erro interno ao enviar convite');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFormData({ email: '', name: '', message: '' });
      setErrors({});
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-600" />
            Convidar Membro da Equipe
          </DialogTitle>
          <DialogDescription>
            Envie um convite seguro por email para que a pessoa se cadastre e tenha acesso ao painel da empresa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="secure-invite-email" className="text-sm font-medium">
              Email *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="secure-invite-email"
                type="email"
                placeholder="email@exemplo.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                disabled={loading}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="secure-invite-name" className="text-sm font-medium">
              Nome Completo *
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="secure-invite-name"
                type="text"
                placeholder="Nome da pessoa"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                disabled={loading}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="secure-invite-message" className="text-sm font-medium">
              Mensagem Personalizada (Opcional)
            </Label>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <Textarea
                id="secure-invite-message"
                placeholder="Adicione uma mensagem personalizada ao convite..."
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className={`pl-10 min-h-[80px] resize-none ${errors.message ? 'border-red-500' : ''}`}
                disabled={loading}
                maxLength={500}
              />
            </div>
            {errors.message && (
              <p className="text-xs text-red-600">{errors.message}</p>
            )}
            <p className="text-xs text-gray-500">
              {formData.message.length}/500 caracteres
            </p>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-sm">
              O convite expira em 7 dias e usa tokens seguros. O novo membro terá acesso ao mesmo painel da sua empresa.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSendInvite}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Send className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Convite
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SecureInviteTeamMemberDialog;
