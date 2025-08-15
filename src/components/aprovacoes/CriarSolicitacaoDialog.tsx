
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Upload, X, FileText, Save, Send } from 'lucide-react';
import { useCreateSolicitacao } from '@/hooks/useSolicitacoes';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CriarSolicitacaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CriarSolicitacaoDialog: React.FC<CriarSolicitacaoDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { user } = useAuth();
  const createSolicitacao = useCreateSolicitacao();
  const [formData, setFormData] = useState({
    titulo: '',
    periodo_referencia: '',
    descricao: ''
  });

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!user) {
      toast.error('Usuário not autenticado');
      return;
    }

    if (!formData.titulo.trim() || !formData.periodo_referencia.trim()) {
      toast.error('Título e período de referência são obrigatórios');
      return;
    }

    try {
      await createSolicitacao.mutateAsync({
        titulo: formData.titulo,
        periodo_referencia: formData.periodo_referencia,
        descricao: formData.descricao,
        status: isDraft ? 'Em Elaboração' : 'Pendente',
        solicitante_id: user.id,
        etapa_atual: 1,
        // Definir um aprovador padrão para teste - em produção isso viria do fluxo
        aprovador_atual_id: isDraft ? undefined : user.id // Por enquanto, para teste
      });

      setFormData({ titulo: '', periodo_referencia: '', descricao: '' });
      onOpenChange(false);
      
      if (isDraft) {
        toast.success('Rascunho salvo com sucesso!');
      } else {
        toast.success('Solicitação enviada para aprovação!');
      }
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
      toast.error('Erro ao processar solicitação');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nova Solicitação de Aprovação</DialogTitle>
          <DialogDescription>
            Preencha os dados da sua solicitação de aprovação
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="titulo">Título da Solicitação *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => handleChange('titulo', e.target.value)}
                placeholder="Ex: Aprovação de Relatório Mensal - Janeiro 2024"
              />
            </div>

            <div>
              <Label htmlFor="periodo">Período de Referência *</Label>
              <Input
                id="periodo"
                value={formData.periodo_referencia}
                onChange={(e) => handleChange('periodo_referencia', e.target.value)}
                placeholder="Ex: Janeiro 2024"
              />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleChange('descricao', e.target.value)}
                placeholder="Descreva os detalhes da sua solicitação..."
                rows={4}
              />
            </div>
          </div>

          {/* Seção de Anexos - Simplificada por enquanto */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4">Documentos</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Funcionalidade de upload será implementada em breve</p>
              <p className="text-sm text-gray-400">Por enquanto, você pode criar a solicitação sem anexos</p>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => handleSubmit(true)}
                disabled={createSolicitacao.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Rascunho
              </Button>
              
              <Button
                onClick={() => handleSubmit(false)}
                disabled={createSolicitacao.isPending}
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar para Aprovação
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
