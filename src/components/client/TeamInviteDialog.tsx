
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, Mail, User, Shield } from 'lucide-react';
import { useHierarchyLevels, useInviteTeamMember } from '@/hooks/useTeamMembers';

interface TeamInviteDialogProps {
  trigger?: React.ReactNode;
}

export const TeamInviteDialog: React.FC<TeamInviteDialogProps> = ({ trigger }) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [hierarchyLevelId, setHierarchyLevelId] = useState('');

  const { data: hierarchyLevels = [] } = useHierarchyLevels();
  const inviteTeamMember = useInviteTeamMember();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name || !hierarchyLevelId) {
      return;
    }

    try {
      await inviteTeamMember.mutateAsync({
        email: email.trim(),
        name: name.trim(),
        hierarchyLevelId
      });
      
      // Reset form
      setEmail('');
      setName('');
      setHierarchyLevelId('');
      setOpen(false);
    } catch (error) {
      // Error handled by the mutation
    }
  };

  const defaultTrigger = (
    <Button>
      <UserPlus className="h-4 w-4 mr-2" />
      Convida Membro
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Convidar Membro da Equipe
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
              placeholder="Ex: João Silva"
              required
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
              placeholder="Ex: joao@empresa.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Nível Hierárquico
            </Label>
            <Select value={hierarchyLevelId} onValueChange={setHierarchyLevelId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível" />
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
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={inviteTeamMember.isPending || !email || !name || !hierarchyLevelId}
            >
              {inviteTeamMember.isPending ? 'Enviando...' : 'Enviar Convite'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
