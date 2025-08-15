
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, FileText, Download, Clock, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { Solicitacao } from '@/types/aprovacoes';
import { useAnexos, useHistoricoAprovacao, useUpdateSolicitacao, useCreateHistorico } from '@/hooks/useSolicitacoes';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PaginaRevisaoProps {
  solicitacao: Solicitacao;
  onBack: () => void;
}

export const PaginaRevisao: React.FC<PaginaRevisaoProps> = ({
  solicitacao,
  onBack
}) => {
  const { user } = useAuth();
  const { data: anexos } = useAnexos(solicitacao.id);
  const { data: historico } = useHistoricoAprovacao(solicitacao.id);
  const updateSolicitacao = useUpdateSolicitacao();
  const createHistorico = useCreateHistorico();
  const [comentario, setComentario] = useState('');
  const [showComentario, setShowComentario] = useState(false);

  const getAcaoIcon = (acao: string) => {
    switch (acao) {
      case 'Criação':
        return '📝';
      case 'Aprovação':
        return '✅';
      case 'Rejeição':
        return '❌';
      case 'Solicitação de Ajuste':
        return '🔄';
      default:
        return '📋';
    }
  };

  const handleAprovar = async () => {
    if (!user) return;

    try {
      // TODO: Implementar lógica para verificar próxima etapa do fluxo
      // Por enquanto, vamos apenas aprovar completamente
      await updateSolicitacao.mutateAsync({
        id: solicitacao.id,
        status: 'Aprovado'
      });

      await createHistorico.mutateAsync({
        solicitacao_id: solicitacao.id,
        usuario_id: user.id,
        nome_usuario: user.email || 'Aprovador',
        acao: 'Aprovação',
        comentario: comentario || 'Solicitação aprovada'
      });

      toast.success('Solicitação aprovada com sucesso!');
      onBack();
    } catch (error) {
      console.error('Erro ao aprovar solicitação:', error);
      toast.error('Erro ao aprovar solicitação');
    }
  };

  const handleSolicitarAjuste = async () => {
    if (!user || !comentario.trim()) {
      toast.error('Comentário é obrigatório para solicitar ajuste');
      return;
    }

    try {
      await updateSolicitacao.mutateAsync({
        id: solicitacao.id,
        status: 'Requer Ajuste'
      });

      await createHistorico.mutateAsync({
        solicitacao_id: solicitacao.id,
        usuario_id: user.id,
        nome_usuario: user.email || 'Aprovador',
        acao: 'Solicitação de Ajuste',
        comentario: comentario
      });

      toast.success('Solicitação de ajuste enviada!');
      onBack();
    } catch (error) {
      console.error('Erro ao solicitar ajuste:', error);
      toast.error('Erro ao solicitar ajuste');
    }
  };

  const handleRejeitar = async () => {
    if (!user || !comentario.trim()) {
      toast.error('Comentário é obrigatório para rejeitar');
      return;
    }

    try {
      await updateSolicitacao.mutateAsync({
        id: solicitacao.id,
        status: 'Rejeitado'
      });

      await createHistorico.mutateAsync({
        solicitacao_id: solicitacao.id,
        usuario_id: user.id,
        nome_usuario: user.email || 'Aprovador',
        acao: 'Rejeição',
        comentario: comentario
      });

      toast.success('Solicitação rejeitada');
      onBack();
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error);
      toast.error('Erro ao rejeitar solicitação');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{solicitacao.titulo}</h1>
          <p className="text-muted-foreground">Página de Revisão</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detalhes da Solicitação */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Solicitação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Título</label>
                <p className="mt-1 p-3 bg-gray-50 rounded">{solicitacao.titulo}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Período de Referência</label>
                <p className="mt-1 p-3 bg-gray-50 rounded">{solicitacao.periodo_referencia}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Descrição</label>
                <p className="mt-1 p-3 bg-gray-50 rounded whitespace-pre-wrap">{solicitacao.descricao}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Data de Criação</label>
                  <p className="mt-1 p-3 bg-gray-50 rounded">
                    {new Date(solicitacao.data_criacao).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status Atual</label>
                  <div className="mt-1">
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {solicitacao.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documentos Anexados */}
          <Card>
            <CardHeader>
              <CardTitle>Documentos Anexados</CardTitle>
            </CardHeader>
            <CardContent>
              {anexos && anexos.length > 0 ? (
                <div className="space-y-3">
                  {anexos.map((anexo) => (
                    <div key={anexo.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-3 text-gray-500" />
                        <div>
                          <p className="font-medium">{anexo.nome_arquivo}</p>
                          {anexo.tamanho_arquivo && (
                            <p className="text-sm text-gray-500">
                              {(anexo.tamanho_arquivo / 1024 / 1024).toFixed(2)} MB
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(anexo.url_arquivo, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Nenhum documento anexado
                </p>
              )}
            </CardContent>
          </Card>

          {/* Ações de Aprovação */}
          <Card>
            <CardHeader>
              <CardTitle>Ações de Aprovação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(showComentario || false) && (
                <div>
                  <Label htmlFor="comentario">Comentário</Label>
                  <Textarea
                    id="comentario"
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Adicione seus comentários..."
                    rows={3}
                  />
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleAprovar}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Aprovar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowComentario(true);
                    setTimeout(() => document.getElementById('comentario')?.focus(), 100);
                  }}
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Solicitar Ajuste
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowComentario(true);
                    setTimeout(() => document.getElementById('comentario')?.focus(), 100);
                  }}
                  className="border-red-500 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeitar
                </Button>
              </div>

              {showComentario && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={handleSolicitarAjuste}
                    variant="outline"
                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                    disabled={!comentario.trim()}
                  >
                    Confirmar Ajuste
                  </Button>
                  <Button
                    onClick={handleRejeitar}
                    variant="outline"
                    className="border-red-500 text-red-600 hover:bg-red-50"
                    disabled={!comentario.trim()}
                  >
                    Confirmar Rejeição
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowComentario(false);
                      setComentario('');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Histórico do Fluxo */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Histórico do Fluxo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historico && historico.length > 0 ? (
                <div className="space-y-4">
                  {historico.map((item, index) => (
                    <div key={item.id} className="relative">
                      {index < historico.length - 1 && (
                        <div className="absolute left-4 top-8 w-0.5 h-full bg-gray-200"></div>
                      )}
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">
                          {getAcaoIcon(item.acao)}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{item.acao}</p>
                            <time className="text-xs text-gray-500">
                              {new Date(item.data_acao).toLocaleDateString('pt-BR')}
                            </time>
                          </div>
                          <p className="text-sm text-gray-600">{item.nome_usuario}</p>
                          {item.comentario && (
                            <p className="text-sm text-gray-700 mt-1 italic bg-gray-50 p-2 rounded">
                              "{item.comentario}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Nenhum histórico disponível
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
