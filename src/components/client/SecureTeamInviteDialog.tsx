
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Shield, Clock, Mail } from 'lucide-react';
import { useHierarchyLevels } from '@/hooks/useSecureTeamMembers';
import { useSecureTeamInvitation } from '@/hooks/useSecureTeamInvitation';

interface SecureTeamInviteDialogProps {
  children: React.ReactNode;
}

export const SecureTeamInviteDialog: React.FC<SecureTeamInviteDialogProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [hierarchyLevelId, setHierarchyLevelId] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');

  const { data: hierarchyLevels, isLoading: loadingLevels } = useHierarchyLevels();
  const inviteMutation = useSecureTeamInvitation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name || !hierarchyLevelId) {
      return;
    }

    try {
      await inviteMutation.mutateAsync({
        email: email.trim(),
        name: name.trim(),
        hierarchyLevelId,
        message: customMessage.trim() || undefined
      });

      // Reset form and close dialog
      setEmail('');
      setName('');
      setHierarchyLevelId('');
      setCustomMessage('');
      setOpen(false);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Convite Seguro para Equipe
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Security Notice */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-green-800 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Sistema de Convites Seguro
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-green-700">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>Expira em 24h</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  <span>Token criptografado</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  <span>Auditoria completa</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Membro *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome completo"
                  required
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@empresa.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hierarchy">Nível Hierárquico *</Label>
              <Select value={hierarchyLevelId} onValueChange={setHierarchyLevelId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível hierárquico" />
                </SelectTrigger>
                <SelectContent>
                  {hierarchyLevels?.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{level.name}</span>
                        <div className="flex gap-1 ml-2">
                          {level.can_approve && <Badge variant="secondary" className="text-xs">Aprovador</Badge>}
                          {level.can_invite_members && <Badge variant="outline" className="text-xs">Convites</Badge>}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensagem Personalizada (Opcional)</Label>
              <Textarea
                id="message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Adicione uma mensagem personalizada ao convite..."
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-gray-500">
                {customMessage.length}/500 caracteres
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={inviteMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={inviteMutation.isPending || !email || !name || !hierarchyLevelId}
              >
                {inviteMutation.isPending ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Enviando Convite Seguro...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Enviar Convite Seguro
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
