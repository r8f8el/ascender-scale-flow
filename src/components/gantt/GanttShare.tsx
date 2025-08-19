import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Share2, Copy, Mail, Link, Users, Eye, Edit, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GanttShareProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  tasks: any[];
}

interface ShareSettings {
  permission: 'view' | 'edit' | 'admin';
  expiresAt?: string;
  allowDownload: boolean;
  allowComments: boolean;
  notifyUsers: boolean;
}

interface SharedUser {
  id: string;
  email: string;
  name: string;
  permission: 'view' | 'edit' | 'admin';
  invitedAt: string;
  status: 'pending' | 'accepted' | 'declined';
}

export const GanttShare: React.FC<GanttShareProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  tasks
}) => {
  const { toast } = useToast();
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    permission: 'view',
    allowDownload: true,
    allowComments: false,
    notifyUsers: true
  });
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState('');

  // Gerar link de compartilhamento
  const generateShareLink = () => {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/shared/gantt/${projectId}`;
    setShareLink(shareUrl);
    return shareUrl;
  };

  // Copiar link para clipboard
  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink || generateShareLink());
      toast({
        title: "Sucesso!",
        description: "Link copiado para a área de transferência"
      });
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      toast({
        title: "Erro",
        description: "Erro ao copiar link",
        variant: "destructive"
      });
    }
  };

  // Enviar convite por email
  const sendInvite = async () => {
    if (!inviteEmail.trim() || !inviteName.trim()) {
      toast({
        title: "Erro",
        description: "Email e nome são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Criar registro de compartilhamento no banco
      const { data, error } = await supabase
        .from('project_shares')
        .insert({
          project_id: projectId,
          shared_with_email: inviteEmail,
          shared_with_name: inviteName,
          permission: shareSettings.permission,
          expires_at: shareSettings.expiresAt,
          allow_download: shareSettings.allowDownload,
          allow_comments: shareSettings.allowComments,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Adicionar à lista local
      const newSharedUser: SharedUser = {
        id: data.id,
        email: inviteEmail,
        name: inviteName,
        permission: shareSettings.permission,
        invitedAt: new Date().toISOString(),
        status: 'pending'
      };

      setSharedUsers(prev => [...prev, newSharedUser]);

      // Enviar email de convite (implementar integração com serviço de email)
      if (shareSettings.notifyUsers) {
        await sendInviteEmail(inviteEmail, inviteName, projectName);
      }

      toast({
        title: "Sucesso!",
        description: "Convite enviado com sucesso"
      });

      // Limpar campos
      setInviteEmail('');
      setInviteName('');
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar convite",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Enviar email de convite (mock - implementar com serviço real)
  const sendInviteEmail = async (email: string, name: string, projectName: string) => {
    // Aqui você implementaria a integração com um serviço de email
    // como SendGrid, AWS SES, ou similar
    console.log(`Enviando convite para ${email} (${name}) para o projeto ${projectName}`);
    
    // Mock de envio bem-sucedido
    return Promise.resolve();
  };

  // Carregar usuários compartilhados
  const loadSharedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('project_shares')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const users: SharedUser[] = (data || []).map(share => ({
        id: share.id,
        email: share.shared_with_email,
        name: share.shared_with_name,
        permission: share.permission,
        invitedAt: share.created_at,
        status: share.status
      }));

      setSharedUsers(users);
    } catch (error) {
      console.error('Erro ao carregar usuários compartilhados:', error);
    }
  };

  // Remover usuário compartilhado
  const removeSharedUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('project_shares')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setSharedUsers(prev => prev.filter(user => user.id !== userId));
      toast({
        title: "Sucesso!",
        description: "Usuário removido do compartilhamento"
      });
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover usuário",
        variant: "destructive"
      });
    }
  };

  // Atualizar permissões
  const updateUserPermission = async (userId: string, permission: 'view' | 'edit' | 'admin') => {
    try {
      const { error } = await supabase
        .from('project_shares')
        .update({ permission })
        .eq('id', userId);

      if (error) throw error;

      setSharedUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, permission } : user
      ));

      toast({
        title: "Sucesso!",
        description: "Permissões atualizadas"
      });
    } catch (error) {
      console.error('Erro ao atualizar permissões:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar permissões",
        variant: "destructive"
      });
    }
  };

  // Carregar dados quando modal abrir
  React.useEffect(() => {
    if (isOpen) {
      loadSharedUsers();
      generateShareLink();
    }
  }, [isOpen, projectId]);

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'admin': return <Users className="h-4 w-4" />;
      case 'edit': return <Edit className="h-4 w-4" />;
      case 'view': return <Eye className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'admin': return 'bg-red-100 text-red-700';
      case 'edit': return 'bg-orange-100 text-orange-700';
      case 'view': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'declined': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-blue-600" />
            Compartilhar Cronograma
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Link de Compartilhamento */}
          <div className="space-y-3">
            <Label>Link de Compartilhamento</Label>
            <div className="flex gap-2">
              <Input
                value={shareLink}
                readOnly
                placeholder="Gerando link..."
                className="flex-1"
              />
              <Button onClick={copyShareLink} variant="outline" size="sm">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Qualquer pessoa com este link pode acessar o cronograma
            </p>
          </div>

          {/* Configurações de Compartilhamento */}
          <div className="space-y-4">
            <Label>Configurações de Compartilhamento</Label>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="permission">Permissão Padrão</Label>
                <Select 
                  value={shareSettings.permission} 
                  onValueChange={(value: any) => setShareSettings({ ...shareSettings, permission: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Visualizar
                      </div>
                    </SelectItem>
                    <SelectItem value="edit">
                      <div className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Editar
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Administrador
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expiresAt">Expira em</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={shareSettings.expiresAt || ''}
                  onChange={(e) => setShareSettings({ ...shareSettings, expiresAt: e.target.value })}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowDownload"
                  checked={shareSettings.allowDownload}
                  onCheckedChange={(checked) => 
                    setShareSettings({ ...shareSettings, allowDownload: !!checked })
                  }
                />
                <Label htmlFor="allowDownload">Permitir Download</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowComments"
                  checked={shareSettings.allowComments}
                  onCheckedChange={(checked) => 
                    setShareSettings({ ...shareSettings, allowComments: !!checked })
                  }
                />
                <Label htmlFor="allowComments">Permitir Comentários</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notifyUsers"
                  checked={shareSettings.notifyUsers}
                  onCheckedChange={(checked) => 
                    setShareSettings({ ...shareSettings, notifyUsers: !!checked })
                  }
                />
                <Label htmlFor="notifyUsers">Notificar Usuários por Email</Label>
              </div>
            </div>
          </div>

          {/* Convidar Usuários */}
          <div className="space-y-4">
            <Label>Convidar Usuários</Label>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="inviteName">Nome</Label>
                <Input
                  id="inviteName"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Nome do usuário"
                />
              </div>

              <div>
                <Label htmlFor="inviteEmail">Email</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            <Button 
              onClick={sendInvite} 
              disabled={loading || !inviteEmail.trim() || !inviteName.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Convite
                </>
              )}
            </Button>
          </div>

          {/* Usuários Compartilhados */}
          <div className="space-y-4">
            <Label>Usuários com Acesso</Label>
            
            {sharedUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum usuário compartilhado ainda</p>
                <p className="text-sm">Use o formulário acima para convidar usuários</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sharedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={getPermissionColor(user.permission)}>
                            {getPermissionIcon(user.permission)}
                            <span className="ml-1 capitalize">{user.permission}</span>
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(user.status)}>
                            {user.status === 'pending' ? 'Pendente' : 
                             user.status === 'accepted' ? 'Aceito' : 'Recusado'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Select 
                        value={user.permission} 
                        onValueChange={(value: any) => updateUserPermission(user.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="view">Visualizar</SelectItem>
                          <SelectItem value="edit">Editar</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeSharedUser(user.id)}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
