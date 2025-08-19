
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Share2, Mail, Link2, Users, Trash2, Eye, Edit } from 'lucide-react';
import { GanttTask } from '@/hooks/useGanttTasks';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GanttShareProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  tasks: GanttTask[];
}

interface ShareSettings {
  id: string;
  shared_with_email: string;
  shared_with_name: string;
  permission: 'view' | 'edit';
  created_at: string;
  status: 'pending' | 'accepted' | 'declined';
}

export const GanttShare: React.FC<GanttShareProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  tasks
}) => {
  const [shareEmail, setShareEmail] = useState('');
  const [shareName, setShareName] = useState('');
  const [sharePermission, setSharePermission] = useState<'view' | 'edit'>('view');
  const [shareMessage, setShareMessage] = useState('');
  const [existingShares, setExistingShares] = useState<ShareSettings[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [publicLink, setPublicLink] = useState('');
  const [isPublicLinkEnabled, setIsPublicLinkEnabled] = useState(false);

  // Simulated data for demonstration
  useEffect(() => {
    if (isOpen) {
      // Simulate loading existing shares
      setExistingShares([
        {
          id: '1',
          shared_with_email: 'colaborador@empresa.com',
          shared_with_name: 'João Silva',
          permission: 'view',
          created_at: new Date().toISOString(),
          status: 'accepted'
        }
      ]);
      
      // Generate public link if enabled
      if (projectId) {
        setPublicLink(`${window.location.origin}/shared/gantt/${projectId}?token=abc123`);
      }
    }
  }, [isOpen, projectId]);

  const handleShare = async () => {
    if (!shareEmail.trim() || !shareName.trim()) {
      toast.error('Email e nome são obrigatórios');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shareEmail)) {
      toast.error('Email inválido');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call to create share
      const newShare: ShareSettings = {
        id: Date.now().toString(),
        shared_with_email: shareEmail,
        shared_with_name: shareName,
        permission: sharePermission,
        created_at: new Date().toISOString(),
        status: 'pending'
      };

      setExistingShares(prev => [...prev, newShare]);

      // Simulate sending email
      const emailContent = `
        Você foi convidado para visualizar o cronograma do projeto "${projectName}".
        
        ${shareMessage}
        
        Acesse através do link: ${window.location.origin}/shared/gantt/${projectId}
        
        Permissão: ${sharePermission === 'view' ? 'Visualização' : 'Edição'}
      `;

      console.log('Email que seria enviado:', emailContent);

      toast.success('Convite enviado com sucesso!');
      
      // Reset form
      setShareEmail('');
      setShareName('');
      setShareMessage('');
      setSharePermission('view');

    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      toast.error('Erro ao enviar convite');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    if (!confirm('Tem certeza que deseja remover este compartilhamento?')) return;

    try {
      setExistingShares(prev => prev.filter(share => share.id !== shareId));
      toast.success('Compartilhamento removido');
    } catch (error) {
      console.error('Erro ao remover compartilhamento:', error);
      toast.error('Erro ao remover compartilhamento');
    }
  };

  const copyPublicLink = () => {
    if (publicLink) {
      navigator.clipboard.writeText(publicLink);
      toast.success('Link copiado para a área de transferência');
    }
  };

  const generatePublicLink = () => {
    const newLink = `${window.location.origin}/shared/gantt/${projectId}?token=${Date.now()}`;
    setPublicLink(newLink);
    setIsPublicLinkEnabled(true);
    toast.success('Link público gerado');
  };

  const disablePublicLink = () => {
    setIsPublicLinkEnabled(false);
    setPublicLink('');
    toast.success('Link público desabilitado');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Aceito</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'declined':
        return <Badge className="bg-red-100 text-red-800">Recusado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getPermissionBadge = (permission: string) => {
    return permission === 'edit' 
      ? <Badge className="bg-blue-100 text-blue-800">Edição</Badge>
      : <Badge className="bg-gray-100 text-gray-800">Visualização</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartilhar Cronograma
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Projeto */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900">{projectName}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {tasks.length} tarefa{tasks.length !== 1 ? 's' : ''} • 
              Última atualização: {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </p>
          </div>

          {/* Compartilhar com Pessoa */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Users className="h-5 w-5" />
              Convidar Pessoas
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="share-email">Email *</Label>
                <Input
                  id="share-email"
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="colaborador@empresa.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="share-name">Nome *</Label>
                <Input
                  id="share-name"
                  value={shareName}
                  onChange={(e) => setShareName(e.target.value)}
                  placeholder="Nome do colaborador"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nível de Permissão</Label>
              <Select value={sharePermission} onValueChange={(value: 'view' | 'edit') => setSharePermission(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Visualização apenas
                    </div>
                  </SelectItem>
                  <SelectItem value="edit">
                    <div className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Visualização e edição
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="share-message">Mensagem (opcional)</Label>
              <Textarea
                id="share-message"
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                placeholder="Adicione uma mensagem personalizada ao convite..."
                rows={3}
              />
            </div>

            <Button 
              onClick={handleShare} 
              disabled={isLoading}
              className="w-full"
            >
              <Mail className="h-4 w-4 mr-2" />
              {isLoading ? 'Enviando...' : 'Enviar Convite'}
            </Button>
          </div>

          {/* Link Público */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Link Público
            </h3>
            
            {isPublicLinkEnabled && publicLink ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={publicLink}
                    readOnly
                    className="flex-1"
                  />
                  <Button onClick={copyPublicLink} variant="outline">
                    Copiar
                  </Button>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Qualquer pessoa com este link pode visualizar o cronograma</span>
                  <Button 
                    onClick={disablePublicLink}
                    variant="ghost" 
                    size="sm"
                    className="text-red-600"
                  >
                    Desabilitar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">
                  Crie um link público para compartilhar com qualquer pessoa
                </p>
                <Button onClick={generatePublicLink} variant="outline">
                  <Link2 className="h-4 w-4 mr-2" />
                  Gerar Link Público
                </Button>
              </div>
            )}
          </div>

          {/* Lista de Compartilhamentos Existentes */}
          {existingShares.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Pessoas com Acesso</h3>
              
              <div className="space-y-2">
                {existingShares.map((share) => (
                  <div key={share.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium">{share.shared_with_name}</div>
                        <div className="text-sm text-gray-600">{share.shared_with_email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusBadge(share.status)}
                      {getPermissionBadge(share.permission)}
                      <Button
                        onClick={() => handleRemoveShare(share.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
