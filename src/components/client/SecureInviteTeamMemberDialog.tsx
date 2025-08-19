
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, User, MessageCircle, Shield, Send } from 'lucide-react';
import { useSecureInviteTeamMember, useHierarchyLevels } from '@/hooks/useSecureTeamMembers';

interface SecureInviteTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SecureInviteTeamMemberDialog: React.FC<SecureInviteTeamMemberDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    hierarchyLevelId: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: hierarchyLevels = [] } = useHierarchyLevels();
  const inviteTeamMember = useSecureInviteTeamMember();

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

    if (!formData.hierarchyLevelId) {
      newErrors.hierarchyLevelId = 'Nível hierárquico é obrigatório';
    }

    if (formData.message.length > 500) {
      newErrors.message = 'Mensagem muito longa (máximo 500 caracteres)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendInvite = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await inviteTeamMember.mutateAsync({
        email: formData.email.trim().toLowerCase(),
        name: formData.name.trim(),
        hierarchyLevelId: formData.hierarchyLevelId
      });
      
      // Reset form and close dialog
      setFormData({ email: '', name: '', hierarchyLevelId: '', message: '' });
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      // Error handled by the mutation
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
      setFormData({ email: '', name: '', hierarchyLevelId: '', message: '' });
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
                disabled={inviteTeamMember.isPending}
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
                disabled={inviteTeamMember.isPending}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Nível Hierárquico *
            </Label>
            <Select 
              value={formData.hierarchyLevelId} 
              onValueChange={(value) => handleInputChange('hierarchyLevelId', value)}
              disabled={inviteTeamMember.isPending}
            >
              <SelectTrigger className={errors.hierarchyLevelId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione o nível hierárquico" />
              </SelectTrigger>
              <SelectContent>
                {hierarchyLevels.map((level) => (
                  <SelectItem key={level.id} value={level.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{level.name}</span>
                      {level.description && (
                        <span className="text-xs text-muted-foreground">
                          {level.description}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.hierarchyLevelId && (
              <p className="text-xs text-red-600">{errors.hierarchyLevelId}</p>
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
                disabled={inviteTeamMember.isPending}
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
            disabled={inviteTeamMember.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSendInvite}
            disabled={inviteTeamMember.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {inviteTeamMember.isPending ? (
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
