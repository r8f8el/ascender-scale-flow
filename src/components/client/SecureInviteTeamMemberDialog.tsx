
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
import { Mail, User, MessageCircle, Send, Shield } from 'lucide-react';
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
  const { user, userRole } = useSecureAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Email inválido';
    } else if (formData.email.length > 254) {
      newErrors.email = 'Email muito longo';
    }

    // Enhanced name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Nome muito longo';
    }

    // Message validation
    if (formData.message.length > 500) {
      newErrors.message = 'Mensagem muito longa';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>'"]/g, '');
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
      // Sanitize inputs
      const sanitizedData = {
        email: formData.email.trim().toLowerCase(),
        name: sanitizeInput(formData.name),
        message: sanitizeInput(formData.message)
      };

      // Use secure RPC function
      const { data: invitationId, error: inviteError } = await supabase
        .rpc('invite_team_member', {
          p_email: sanitizedData.email,
          p_name: sanitizedData.name,
          p_hierarchy_level_id: null // Will need to be updated based on your hierarchy system
        });

      if (inviteError) {
        console.error('Erro ao criar convite:', inviteError);
        
        if (inviteError.message.includes('já existe um convite pendente')) {
          toast.error('Este email já foi convidado');
        } else if (inviteError.message.includes('Apenas contatos primários')) {
          toast.error('Apenas contatos primários podem convidar membros');
        } else {
          toast.error('Erro ao criar convite');
        }
        return;
      }

      // Send invitation email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-invitation-email', {
        body: {
          to: sanitizedData.email,
          inviterName: user.email || 'Administrador',
          invitedName: sanitizedData.name,
          message: sanitizedData.message,
          inviteUrl: `${window.location.origin}/convite/inscrever?token=${invitationId}`,
          companyName: userRole.company || 'Ascalate'
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
            Envie um convite seguro por email para que a pessoa se cadastre na plataforma.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email Field */}
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
                maxLength={254}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="secure-invite-name" className="text-sm font-medium">
              Nome *
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
                maxLength={100}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Message Field */}
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

          {/* Security Notice */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-sm">
              O convite expira em 7 dias e usa tokens seguros para proteção contra acesso não autorizado.
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
            {loading ? 'Enviando...' : 'Enviar Convite Seguro'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SecureInviteTeamMemberDialog;
