
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateSolicitacao } from '@/hooks/useSolicitacoes';
import { FileUploadSolicitacao } from './FileUploadSolicitacao';
import { SeletorAprovadores } from './SeletorAprovadores';
import { Loader2 } from 'lucide-react';

interface CriarSolicitacaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Aprovador {
  id: string;
  name: string;
  email: string;
  cargo: string;
  nivel: number;
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

  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ id: string; name: string; url: string; size: number }>>([]);
  const [aprovadores, setAprovadores] = useState<Aprovador[]>([]);

  const resetForm = () => {
    setFormData({
      titulo: '',
      periodo_referencia: '',
      descricao: ''
    });
    setFiles([]);
    setUploadedFiles([]);
    setAprovadores([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      return;
    }

    if (!formData.titulo.trim()) {
      return;
    }

    try {
      await createSolicitacao.mutateAsync({
        solicitacao: {
          titulo: formData.titulo,
          periodo_referencia: formData.periodo_referencia,
          descricao: formData.descricao,
          status: aprovadores.length > 0 ? 'Pendente' : 'Em Elaboração',
          solicitante_id: user.id,
          aprovador_atual_id: aprovadores.length > 0 
            ? aprovadores.sort((a, b) => b.nivel - a.nivel)[0].id 
            : null,
          etapa_atual: 1
        },
        files,
        aprovadores
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating solicitacao:', error);
    }
  };

  const handleFileChange = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  const handleFileRemove = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUploadedFileRemove = (id: string) => {
    setUploadedFiles(uploadedFiles.filter(f => f.id !== id));
  };

  const handleAprovadoresChange = (novosAprovadores: Aprovador[]) => {
    setAprovadores(novosAprovadores);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Solicitação</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Título da solicitação"
                required
              />
            </div>

            <div>
              <Label htmlFor="periodo">Período de Referência</Label>
              <Input
                id="periodo"
                value={formData.periodo_referencia}
                onChange={(e) => setFormData({ ...formData, periodo_referencia: e.target.value })}
                placeholder="Ex: Janeiro/2024"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva os detalhes da solicitação..."
              rows={4}
            />
          </div>

          <SeletorAprovadores
            aprovadoresSelecionados={aprovadores}
            onAprovadoresChange={handleAprovadoresChange}
          />

          <FileUploadSolicitacao
            files={files}
            onFileChange={handleFileChange}
            onFileRemove={handleFileRemove}
            uploadedFiles={uploadedFiles}
            onUploadedFileRemove={handleUploadedFileRemove}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={createSolicitacao.isPending || !formData.titulo.trim()}
              className="flex-1"
            >
              {createSolicitacao.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Solicitação'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createSolicitacao.isPending}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
