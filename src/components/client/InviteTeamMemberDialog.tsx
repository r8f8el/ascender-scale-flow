
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
import { Mail, User, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface InviteTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId?: string;
  inviterName?: string;
}

/**
 * Dialog para convidar novos membros da equipe
 * Envia convites por email com link de inscrição personalizado
 */
export const InviteTeamMemberDialog: React.FC<InviteTeamMemberDialogProps> = ({
  open,
  onOpenChange,
  companyId,
  inviterName
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Valida o formulário de convite
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validação do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validação do nome (opcional, mas se preenchido deve ter pelo menos 2 caracteres)
    if (formData.name.trim() && formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Envia o convite por email
   */
  const handleSendInvite = async () => {
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    if (!user || !companyId) {
      toast.error('Dados de autenticação não disponíveis');
      return;
    }

    setLoading(true);

    try {
      // Gera um token único para o convite
      const inviteToken = crypto.randomUUID();
      
      // Data de expiração (7 dias a partir de agora)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Insere o convite no banco de dados usando tipo any para evitar erros de TypeScript
      const { data: invite, error: inviteError } = await (supabase as any)
        .from('team_invitations')
        .insert({
          email: formData.email.trim(),
          invited_name: formData.name.trim() || null,
          company_id: companyId,
          inviter_id: user.id,
          inviter_name: inviterName || user.email || 'Administrador',
          message: formData.message.trim() || null,
          token: inviteToken,
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

      // Monta o URL do convite
      const inviteUrl = `${window.location.origin}/convite/inscrever?token=${inviteToken}&invite=${invite.id}`;

      // Envia o email através da função edge do Supabase
      const { error: emailError } = await supabase.functions.invoke('send-invitation-email', {
        body: {
          to: formData.email.trim(),
          inviterName: inviterName || user.email || 'Administrador',
          invitedName: formData.name.trim() || 'Usuário',
          message: formData.message.trim(),
          inviteUrl: inviteUrl,
          companyName: 'Ascalate' // Pode ser dinâmico se necessário
        }
      });

      if (emailError) {
        console.error('Erro ao enviar email:', emailError);
        toast.error('Convite criado, mas houve erro no envio do email');
      } else {
        toast.success('Convite enviado com sucesso!');
      }

      // Reset do formulário e fechamento do dialog
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

  /**
   * Manipula mudanças nos campos do formulário
   */
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Remove erro do campo quando o usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * Reset do formulário quando o dialog fecha
   */
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
            <Send className="w-5 h-5 mr-2 text-blue-600" />
            Convidar Membro da Equipe
          </DialogTitle>
          <DialogDescription>
            Envie um convite por email para que a pessoa se cadastre na plataforma.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Campo Email */}
          <div className="space-y-2">
            <Label htmlFor="invite-email" className="text-sm font-medium">
              Email *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="invite-email"
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

          {/* Campo Nome (Opcional) */}
          <div className="space-y-2">
            <Label htmlFor="invite-name" className="text-sm font-medium">
              Nome (Opcional)
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="invite-name"
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

          {/* Campo Mensagem (Opcional) */}
          <div className="space-y-2">
            <Label htmlFor="invite-message" className="text-sm font-medium">
              Mensagem Personalizada (Opcional)
            </Label>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <Textarea
                id="invite-message"
                placeholder="Adicione uma mensagem personalizada ao convite..."
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className="pl-10 min-h-[80px] resize-none"
                disabled={loading}
                maxLength={500}
              />
            </div>
            <p className="text-xs text-gray-500">
              {formData.message.length}/500 caracteres
            </p>
          </div>

          {/* Informação sobre expiração */}
          <Alert>
            <AlertDescription className="text-sm">
              O convite expira em 7 dias. Após aceitar, a pessoa terá acesso à plataforma.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSendInvite}
            disabled={loading}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Enviando...' : 'Enviar Convite'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteTeamMemberDialog;
