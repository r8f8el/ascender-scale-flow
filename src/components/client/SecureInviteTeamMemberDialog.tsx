
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Mail, User, MessageSquare, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface SecureInviteTeamMemberDialogProps {
  onInviteSuccess?: () => void;
}

export const SecureInviteTeamMemberDialog: React.FC<SecureInviteTeamMemberDialogProps> = ({ onInviteSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    hierarchyLevelId: '',
    message: ''
  });

  // Buscar níveis hierárquicos
  const { data: hierarchyLevels } = useQuery({
    queryKey: ['hierarchy-levels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hierarchy_levels')
        .select('*')
        .order('level', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.name) {
      toast.error('Por favor, preencha os campos obrigatórios');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🚀 Enviando convite seguro para:', formData);

      // Chamar a função RPC para criar o convite
      const { data: invitationId, error: inviteError } = await supabase
        .rpc('invite_team_member_secure', {
          p_email: formData.email.toLowerCase().trim(),
          p_name: formData.name.trim(),
          p_hierarchy_level_id: formData.hierarchyLevelId || null
        });

      if (inviteError) {
        console.error('❌ Erro ao criar convite:', inviteError);
        throw inviteError;
      }

      console.log('✅ Convite criado com ID:', invitationId);

      // Buscar dados do convite criado para obter o token
      const { data: inviteData, error: fetchError } = await supabase
        .from('team_invitations')
        .select('token, company_name, inviter_name')
        .eq('id', invitationId)
        .single();

      if (fetchError) {
        console.error('❌ Erro ao buscar dados do convite:', fetchError);
        throw new Error('Convite criado mas não foi possível obter o token');
      }

      console.log('📧 Dados do convite obtidos:', inviteData);

      // Construir URL do convite
      const inviteUrl = `${window.location.origin}/convite-seguro?token=${inviteData.token}`;
      
      console.log('🔗 URL do convite:', inviteUrl);

      // Enviar email de convite
      const { error: emailError } = await supabase.functions.invoke('send-invitation-email', {
        body: {
          to: formData.email,
          inviterName: inviteData.inviter_name || 'Administrador',
          invitedName: formData.name,
          companyName: inviteData.company_name || 'Empresa',
          inviteUrl: inviteUrl,
          message: formData.message || 'Você foi convidado para se juntar à nossa equipe na plataforma Ascalate'
        }
      });

      if (emailError) {
        console.error('⚠️ Erro ao enviar email:', emailError);
        // Não falhar completamente se o email não foi enviado
        toast.success('Convite criado com sucesso!', {
          description: 'O convite foi criado, mas houve um problema ao enviar o email. Compartilhe o link manualmente.',
          duration: 10000
        });
      } else {
        console.log('✅ Email enviado com sucesso');
        toast.success('Convite enviado com sucesso!', {
          description: `Um email foi enviado para ${formData.email} com as instruções de cadastro.`,
          duration: 8000
        });
      }

      // Resetar formulário
      setFormData({
        email: '',
        name: '',
        hierarchyLevelId: '',
        message: ''
      });

      // Fechar dialog
      setIsOpen(false);

      // Callback de sucesso
      if (onInviteSuccess) {
        onInviteSuccess();
      }

    } catch (error: any) {
      console.error('❌ Erro completo ao processar convite:', error);
      
      let errorMessage = 'Erro ao enviar convite';
      
      if (error.message?.includes('Já existe um convite pendente')) {
        errorMessage = 'Já existe um convite pendente para este email';
      } else if (error.message?.includes('email')) {
        errorMessage = 'Email inválido ou já cadastrado';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error('Erro ao processar convite', {
        description: errorMessage,
        duration: 8000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          <Shield className="h-4 w-4" />
          Convidar Membro (Seguro)
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Convite Seguro para Equipe
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nome Completo *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Nome do colaborador"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hierarchyLevel">Nível Hierárquico</Label>
            <Select
              value={formData.hierarchyLevelId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, hierarchyLevelId: value }))}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um nível (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {hierarchyLevels?.map((level) => (
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
              Mensagem Personalizada
            </Label>
            <Textarea
              id="message"
              placeholder="Adicione uma mensagem personalizada ao convite (opcional)"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-700">Convite Seguro</span>
            </div>
            <p className="text-xs text-blue-600">
              Este convite terá validade de 24 horas e utilizará tokens seguros para garantir a autenticidade.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Enviando...' : 'Enviar Convite'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
