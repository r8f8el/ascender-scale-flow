
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, FileText } from 'lucide-react';
import { useCreateSolicitacao, useCreateHistorico } from '@/hooks/useSolicitacoes';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
  const createHistorico = useCreateHistorico();
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    titulo: '',
    periodo_referencia: '',
    descricao: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (solicitacaoId: string) => {
    const uploadPromises = files.map(async (file) => {
      const fileName = `${solicitacaoId}/${Date.now()}-${file.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      return supabase
        .from('anexos')
        .insert([{
          solicitacao_id: solicitacaoId,
          nome_arquivo: file.name,
          url_arquivo: urlData.publicUrl,
          tamanho_arquivo: file.size,
          tipo_arquivo: file.type
        }]);
    });

    await Promise.all(uploadPromises);
  };

  const handleSaveDraft = async () => {
    if (!user) return;

    try {
      const solicitacao = await createSolicitacao.mutateAsync({
        titulo: formData.titulo,
        periodo_referencia: formData.periodo_referencia,
        descricao: formData.descricao,
        status: 'Em Elaboração',
        solicitante_id: user.id,
        etapa_atual: 1
      });

      if (files.length > 0) {
        await uploadFiles(solicitacao.id);
      }

      await createHistorico.mutateAsync({
        solicitacao_id: solicitacao.id,
        usuario_id: user.id,
        nome_usuario: user.email || 'Usuário',
        acao: 'Criação',
        comentario: 'Solicitação criada e salva como rascunho'
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
      toast.error('Erro ao salvar rascunho');
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      // Aqui você implementaria a lógica para buscar o primeiro aprovador do fluxo
      // Por enquanto vamos deixar como null e implementar depois
      const solicitacao = await createSolicitacao.mutateAsync({
        titulo: formData.titulo,
        periodo_referencia: formData.periodo_referencia,
        descricao: formData.descricao,
        status: 'Pendente',
        solicitante_id: user.id,
        etapa_atual: 1,
        aprovador_atual_id: undefined // TODO: Implementar busca do primeiro aprovador
      });

      if (files.length > 0) {
        await uploadFiles(solicitacao.id);
      }

      await createHistorico.mutateAsync({
        solicitacao_id: solicitacao.id,
        usuario_id: user.id,
        nome_usuario: user.email || 'Usuário',
        acao: 'Criação',
        comentario: 'Solicitação enviada para aprovação'
      });

      resetForm();
      onOpenChange(false);
      toast.success('Solicitação enviada para aprovação!');
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      toast.error('Erro ao enviar solicitação');
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      periodo_referencia: '',
      descricao: ''
    });
    setFiles([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Solicitação</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="titulo">Título da Solicitação *</Label>
              <Input
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                placeholder="Ex: Aprovação de Orçamento Q1 2024"
                required
              />
            </div>
            <div>
              <Label htmlFor="periodo_referencia">Período de Referência *</Label>
              <Input
                id="periodo_referencia"
                name="periodo_referencia"
                value={formData.periodo_referencia}
                onChange={handleInputChange}
                placeholder="Ex: Janeiro 2024"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="descricao">Descrição Detalhada *</Label>
            <Textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              rows={4}
              placeholder="Descreva detalhadamente o que precisa ser aprovado..."
              required
            />
          </div>

          {/* Upload de arquivos */}
          <Card>
            <CardContent className="pt-6">
              <Label>Anexar Documentos</Label>
              <div className="mt-2">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Arraste e solte arquivos aqui ou clique para selecionar
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Selecionar Arquivos
                  </Button>
                </div>

                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={!formData.titulo || !formData.periodo_referencia || !formData.descricao}
            >
              Salvar Rascunho
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!formData.titulo || !formData.periodo_referencia || !formData.descricao}
            >
              Enviar para Aprovação
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
