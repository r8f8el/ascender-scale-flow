
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, FileText, DollarSign, AlertTriangle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { SecureFileUpload } from './SecureFileUpload';
import { SeletorAprovadoresHierarquia } from './SeletorAprovadoresHierarquia';
import { useCreateSolicitacao } from '@/hooks/useSolicitacoes';

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
  isOpen: boolean;
  onClose: () => void;
}

export const CriarSolicitacaoOtimizada: React.FC<CriarSolicitacaoOtimizadaProps> = ({
  isOpen,
  onClose
}) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tipo_solicitacao: '',
    periodo_referencia: '',
    valor_solicitado: '',
    justificativa: '',
    data_limite: undefined as Date | undefined,
    prioridade: 'Media'
  });

  const [aprovadores, setAprovadores] = useState<Aprovador[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const createSolicitacao = useCreateSolicitacao();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titulo || !formData.periodo_referencia) {
      return;
    }

    if (aprovadores.length === 0) {
      return;
    }

    try {
      await createSolicitacao.mutateAsync({
        solicitacao: {
          titulo: formData.titulo,
          descricao: formData.descricao || null,
          tipo_solicitacao: formData.tipo_solicitacao || 'Geral',
          periodo_referencia: formData.periodo_referencia,
          valor_solicitado: formData.valor_solicitado ? parseFloat(formData.valor_solicitado) : null,
          justificativa: formData.justificativa || null,
          data_limite: formData.data_limite || null,
          prioridade: formData.prioridade as 'Baixa' | 'Media' | 'Alta',
          status: 'Pendente',
          solicitante_id: '' // Será preenchido pelo hook
        },
        files,
        aprovadores: aprovadores.map(a => ({
          id: a.id,
          name: a.name,
          email: a.email,
          nivel: a.hierarchy_level.level
        }))
      });

      // Reset form
      setFormData({
        titulo: '',
        descricao: '',
        tipo_solicitacao: '',
        periodo_referencia: '',
        valor_solicitado: '',
        justificativa: '',
        data_limite: undefined,
        prioridade: 'Media'
      });
      setAprovadores([]);
      setFiles([]);
      onClose();
    } catch (error) {
      // Error handled by the mutation
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'Alta': return 'text-red-600 bg-red-50';
      case 'Media': return 'text-yellow-600 bg-yellow-50';
      case 'Baixa': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Nova Solicitação de Aprovação
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título da Solicitação *</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                    placeholder="Ex: Aprovação de despesas de viagem"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Solicitação</Label>
                  <Select 
                    value={formData.tipo_solicitacao} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_solicitacao: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Financeiro">Financeiro</SelectItem>
                      <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                      <SelectItem value="Operacional">Operacional</SelectItem>
                      <SelectItem value="Compras">Compras</SelectItem>
                      <SelectItem value="Geral">Geral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="periodo">Período de Referência *</Label>
                  <Input
                    id="periodo"
                    value={formData.periodo_referencia}
                    onChange={(e) => setFormData(prev => ({ ...prev, periodo_referencia: e.target.value }))}
                    placeholder="Ex: Janeiro 2024"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor">Valor Solicitado</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      value={formData.valor_solicitado}
                      onChange={(e) => setFormData(prev => ({ ...prev, valor_solicitado: e.target.value }))}
                      placeholder="0.00"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descreva detalhes da solicitação..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Detalhes e Prioridade */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalhes e Prioridade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Limite</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.data_limite && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.data_limite ? (
                          format(formData.data_limite, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.data_limite}
                        onSelect={(date) => setFormData(prev => ({ ...prev, data_limite: date }))}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <Select 
                    value={formData.prioridade} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, prioridade: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baixa">
                        <Badge className={getPrioridadeColor('Baixa')}>Baixa</Badge>
                      </SelectItem>
                      <SelectItem value="Media">
                        <Badge className={getPrioridadeColor('Media')}>Média</Badge>
                      </SelectItem>
                      <SelectItem value="Alta">
                        <Badge className={getPrioridadeColor('Alta')}>
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Alta
                        </Badge>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="justificativa">Justificativa</Label>
                <Textarea
                  id="justificativa"
                  value={formData.justificativa}
                  onChange={(e) => setFormData(prev => ({ ...prev, justificativa: e.target.value }))}
                  placeholder="Justifique a necessidade desta aprovação..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Seletor de Aprovadores */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Aprovadores</CardTitle>
            </CardHeader>
            <CardContent>
              <SeletorAprovadoresHierarquia
                aprovadoresSelecionados={aprovadores}
                onAprovadoresChange={setAprovadores}
              />
            </CardContent>
          </Card>

          {/* Upload de Arquivos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Anexos</CardTitle>
            </CardHeader>
            <CardContent>
              <SecureFileUpload
                files={files}
                onFilesChange={setFiles}
                maxFiles={10}
                maxSizeBytes={50 * 1024 * 1024}
              />
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createSolicitacao.isPending || !formData.titulo || !formData.periodo_referencia || aprovadores.length === 0}
            >
              {createSolicitacao.isPending ? 'Criando...' : 'Criar Solicitação'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
