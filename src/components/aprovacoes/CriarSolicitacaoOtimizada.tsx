
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateSolicitacao } from '@/hooks/useSolicitacoes';
import { useAuth } from '@/contexts/AuthContext';
import { SeletorAprovadoresHierarquia } from './SeletorAprovadoresHierarquia';
import { SecureFileUpload } from './SecureFileUpload';
import { Solicitacao } from '@/types/aprovacoes';
import { toast } from 'sonner';

interface Aprovador {
  id: string;
  name: string;
  email: string;
  hierarchy_level: {
    name: string;
    level: number;
    can_approve: boolean;
  };
}

interface CriarSolicitacaoOtimizadaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CriarSolicitacaoOtimizada: React.FC<CriarSolicitacaoOtimizadaProps> = ({
  open,
  onOpenChange
}) => {
  const { user } = useAuth();
  const createSolicitacao = useCreateSolicitacao();
  
  const [titulo, setTitulo] = useState('');
  const [periodoReferencia, setPeriodoReferencia] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipoSolicitacao, setTipoSolicitacao] = useState('Geral');
  const [prioridade, setPrioridade] = useState<'Baixa' | 'Media' | 'Alta'>('Media');
  const [aprovadores, setAprovadores] = useState<Aprovador[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }

    if (!titulo.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    if (!periodoReferencia.trim()) {
      toast.error('Período de referência é obrigatório');
      return;
    }

    if (aprovadores.length === 0) {
      toast.error('Selecione pelo menos um aprovador');
      return;
    }

    // Validate input lengths to prevent injection
    if (titulo.length > 200) {
      toast.error('Título muito longo (máximo 200 caracteres)');
      return;
    }

    if (descricao.length > 2000) {
      toast.error('Descrição muito longa (máximo 2000 caracteres)');
      return;
    }

    // Basic HTML/script tag detection
    const dangerousPatterns = [/<script/i, /<iframe/i, /javascript:/i, /on\w+=/i];
    if (dangerousPatterns.some(pattern => pattern.test(titulo + descricao + periodoReferencia))) {
      toast.error('Conteúdo suspeito detectado nos campos');
      return;
    }

    try {
      const solicitacaoData: Omit<Solicitacao, 'id' | 'data_criacao' | 'data_ultima_modificacao'> = {
        titulo: titulo.trim(),
        periodo_referencia: periodoReferencia.trim(),
        descricao: descricao.trim(),
        tipo_solicitacao: tipoSolicitacao,
        prioridade: prioridade,
        status: 'Em Elaboração',
        solicitante_id: user.id,
        etapa_atual: 1,
        aprovador_atual_id: undefined,
        aprovadores_necessarios: [],
        aprovadores_completos: [],
        valor_solicitado: undefined,
        justificativa: undefined,
        data_limite: undefined
      };

      await createSolicitacao.mutateAsync({
        solicitacao: solicitacaoData,
        files,
        aprovadores: aprovadores.map(a => ({
          id: a.id,
          name: a.name,
          email: a.email,
          nivel: a.hierarchy_level.level
        }))
      });

      // Reset form
      setTitulo('');
      setPeriodoReferencia('');
      setDescricao('');
      setTipoSolicitacao('Geral');
      setPrioridade('Media');
      setAprovadores([]);
      setFiles([]);
      onOpenChange(false);

    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
    }
  };

  const handleCancel = () => {
    setTitulo('');
    setPeriodoReferencia('');
    setDescricao('');
    setTipoSolicitacao('Geral');
    setPrioridade('Media');
    setAprovadores([]);
    setFiles([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Solicitação de Aprovação</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Digite o título da solicitação"
                maxLength={200}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {titulo.length}/200 caracteres
              </p>
            </div>

            <div>
              <Label htmlFor="periodo">Período de Referência *</Label>
              <Input
                id="periodo"
                value={periodoReferencia}
                onChange={(e) => setPeriodoReferencia(e.target.value)}
                placeholder="Ex: Janeiro/2024"
                maxLength={100}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo">Tipo de Solicitação</Label>
              <select
                id="tipo"
                value={tipoSolicitacao}
                onChange={(e) => setTipoSolicitacao(e.target.value)}
                className="w-full p-2 border rounded-md mt-1"
              >
                <option value="Geral">Geral</option>
                <option value="Financeiro">Financeiro</option>
                <option value="Operacional">Operacional</option>
                <option value="Estratégico">Estratégico</option>
              </select>
            </div>

            <div>
              <Label htmlFor="prioridade">Prioridade</Label>
              <select
                id="prioridade"
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as 'Baixa' | 'Media' | 'Alta')}
                className="w-full p-2 border rounded-md mt-1"
              >
                <option value="Baixa">Baixa</option>
                <option value="Media">Média</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva os detalhes da solicitação"
              rows={4}
              maxLength={2000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {descricao.length}/2000 caracteres
            </p>
          </div>

          <SeletorAprovadoresHierarquia
            aprovadoresSelecionados={aprovadores}
            onAprovadoresChange={setAprovadores}
          />

          <div>
            <Label>Arquivos Anexos</Label>
            <SecureFileUpload
              files={files}
              onFilesChange={setFiles}
              maxFiles={10}
              maxSizeBytes={50 * 1024 * 1024} // 50MB
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={createSolicitacao.isPending}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createSolicitacao.isPending || !titulo.trim() || !periodoReferencia.trim() || aprovadores.length === 0}
            >
              {createSolicitacao.isPending ? 'Criando...' : 'Criar Solicitação'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
