import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHierarchyLevels, useInviteSecureTeamMember } from '@/hooks/useSecureTeamMembers';
import { Mail, User, MessageSquare, Shield, Loader2 } from 'lucide-react';

interface SecureInviteTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SecureInviteTeamMemberDialog: React.FC<SecureInviteTeamMemberDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [hierarchyLevelId, setHierarchyLevelId] = useState('');
  const [message, setMessage] = useState('');

  const { data: hierarchyLevels = [] } = useHierarchyLevels();
  const inviteTeamMember = useInviteSecureTeamMember();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name || !hierarchyLevelId) {
      return;
    }

    try {
      await inviteTeamMember.mutateAsync({
        email,
        name,
        hierarchyLevelId,
        message: message.trim() || undefined
      });

      // Limpar formulário e fechar dialog
      setEmail('');
      setName('');
      setHierarchyLevelId('');
      setMessage('');
      onOpenChange(false);
    } catch (error) {
      // Erro será tratado pelo hook
      console.error('Erro no formulário:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Convidar Novo Membro da Equipe
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nome Completo
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome completo"
              required
              disabled={inviteTeamMember.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite o email"
              required
              disabled={inviteTeamMember.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hierarchy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Nível Hierárquico
            </Label>
            <Select value={hierarchyLevelId} onValueChange={setHierarchyLevelId} disabled={inviteTeamMember.isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível hierárquico" />
              </SelectTrigger>
              <SelectContent>
                {hierarchyLevels.map((level) => (
                  <SelectItem key={level.id} value={level.id}>
                    {level.name} (Nível {level.level})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Mensagem Personalizada (opcional)
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Adicione uma mensagem personalizada ao convite..."
              rows={3}
              disabled={inviteTeamMember.isPending}
              maxLength={500}
            />
            <p className="text-sm text-gray-500">
              {message.length}/500 caracteres
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={inviteTeamMember.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!email || !name || !hierarchyLevelId || inviteTeamMember.isPending}
            >
              {inviteTeamMember.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando Convite...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Convite
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
