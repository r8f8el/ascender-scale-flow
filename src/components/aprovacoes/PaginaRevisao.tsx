
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, FileText, Download, Clock, CheckCircle2, XCircle, RotateCcw, User } from 'lucide-react';
import { Solicitacao } from '@/types/aprovacoes';
import { useAnexos, useHistoricoAprovacao, useUpdateSolicitacao, useCreateHistorico } from '@/hooks/useSolicitacoes';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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

  const getUserName = async () => {
    if (!user) return 'Aprovador';
    const { data } = await supabase
      .from('client_profiles')
      .select('name')
      .eq('id', user.id)
      .single();
    return data?.name || user.email || 'Aprovador';
  };

  const getAcaoIcon = (acao: string) => {
    switch (acao) {
      case 'Criação': return '📝';
      case 'Aprovação': return '✅';
      case 'Rejeição': return '❌';
      case 'Solicitação de Ajuste': return '🔄';
      default: return '📋';
    }
  };

  const handleAprovar = async () => {
    if (!user) return;

    try {
      const userName = await getUserName();
      
      // Update aprovadores_necessarios to mark this user as approved
      const aprovadores = (solicitacao.aprovadores_necessarios || []) as any[];
      const updatedAprovadores = aprovadores.map((ap: any) => {
        if (ap.id === user.id) {
          return { ...ap, aprovado: true, data_aprovacao: new Date().toISOString() };
        }
        return ap;
      });

      // Check if all approvers have approved
      const todosAprovaram = updatedAprovadores.every((ap: any) => ap.aprovado);
      
      // Find next approver if not all approved
      const proximoAprovador = updatedAprovadores.find((ap: any) => !ap.aprovado);

      const updateData: any = {
        id: solicitacao.id,
        status: todosAprovaram ? 'Aprovado' : 'Pendente',
        aprovador_atual_id: proximoAprovador?.id || null,
        etapa_atual: (solicitacao.etapa_atual || 1) + (todosAprovaram ? 0 : 1),
      };

      // Update the request with new aprovadores list
      await supabase
        .from('solicitacoes')
        .update({
          ...updateData,
          aprovadores_necessarios: updatedAprovadores,
          aprovadores_completos: [
            ...(solicitacao.aprovadores_completos || []),
            { id: user.id, name: userName, data_aprovacao: new Date().toISOString(), comentario: comentario || 'Aprovado' }
          ],
          data_ultima_modificacao: new Date().toISOString()
        })
        .eq('id', solicitacao.id);

      await createHistorico.mutateAsync({
        solicitacao_id: solicitacao.id,
        usuario_id: user.id,
        nome_usuario: userName,
        acao: 'Aprovação',
        comentario: comentario || 'Solicitação aprovada'
      });

      toast.success(todosAprovaram ? 'Solicitação totalmente aprovada!' : 'Sua aprovação foi registrada!');
      onBack();
    } catch (error) {
      console.error('Erro ao aprovar:', error);
      toast.error('Erro ao aprovar solicitação');
    }
  };

  const handleSolicitarAjuste = async () => {
    if (!user || !comentario.trim()) {
      toast.error('Comentário é obrigatório para solicitar ajuste');
      return;
    }

    try {
      const userName = await getUserName();

      await updateSolicitacao.mutateAsync({
        id: solicitacao.id,
        status: 'Requer Ajuste'
      });

      await createHistorico.mutateAsync({
        solicitacao_id: solicitacao.id,
        usuario_id: user.id,
        nome_usuario: userName,
        acao: 'Solicitação de Ajuste',
        comentario
      });

      toast.success('Solicitação de ajuste enviada!');
      onBack();
    } catch (error) {
      toast.error('Erro ao solicitar ajuste');
    }
  };

  const handleRejeitar = async () => {
    if (!user || !comentario.trim()) {
      toast.error('Comentário é obrigatório para rejeitar');
      return;
    }

    try {
      const userName = await getUserName();

      await updateSolicitacao.mutateAsync({
        id: solicitacao.id,
        status: 'Rejeitado'
      });

      await createHistorico.mutateAsync({
        solicitacao_id: solicitacao.id,
        usuario_id: user.id,
        nome_usuario: userName,
        acao: 'Rejeição',
        comentario
      });

      toast.success('Solicitação rejeitada');
      onBack();
    } catch (error) {
      toast.error('Erro ao rejeitar solicitação');
    }
  };

  // Get solicitante name from aprovadores or show ID
  const getSolicitanteName = () => {
    return solicitacao.solicitante_id;
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
        {/* Request Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Solicitação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Título</label>
                <p className="mt-1 p-3 bg-muted/50 rounded">{solicitacao.titulo}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Período de Referência</label>
                <p className="mt-1 p-3 bg-muted/50 rounded">{solicitacao.periodo_referencia || 'Não informado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                <p className="mt-1 p-3 bg-muted/50 rounded whitespace-pre-wrap">{solicitacao.descricao || 'Sem descrição'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data de Criação</label>
                  <p className="mt-1 p-3 bg-muted/50 rounded">
                    {new Date(solicitacao.data_criacao).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status Atual</label>
                  <div className="mt-1">
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {solicitacao.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Approvers Progress */}
              {solicitacao.aprovadores_necessarios && (solicitacao.aprovadores_necessarios as any[]).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Fluxo de Aprovação</label>
                  <div className="space-y-2">
                    {(solicitacao.aprovadores_necessarios as any[])
                      .sort((a: any, b: any) => (a.nivel || 5) - (b.nivel || 5))
                      .map((ap: any, idx: number) => (
                        <div key={ap.id} className="flex items-center gap-3 p-2 rounded bg-muted/30">
                          <Badge variant={ap.aprovado ? 'default' : 'secondary'} className="w-6 h-6 flex items-center justify-center p-0">
                            {idx + 1}
                          </Badge>
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="flex-1">{ap.name}</span>
                          {ap.aprovado ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attachments */}
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
                        <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{anexo.nome_arquivo}</p>
                          {anexo.tamanho_arquivo && (
                            <p className="text-sm text-muted-foreground">
                              {(anexo.tamanho_arquivo / 1024 / 1024).toFixed(2)} MB
                            </p>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => window.open(anexo.url_arquivo, '_blank')}>
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">Nenhum documento anexado</p>
              )}
            </CardContent>
          </Card>

          {/* Approval Actions */}
          {solicitacao.status === 'Pendente' && (
            <Card>
              <CardHeader>
                <CardTitle>Ações de Aprovação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="comentario">Comentário (obrigatório para ajuste/rejeição)</Label>
                  <Textarea
                    id="comentario"
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Adicione seus comentários..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleAprovar} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Aprovar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSolicitarAjuste}
                    disabled={!comentario.trim()}
                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Solicitar Ajuste
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleRejeitar}
                    disabled={!comentario.trim()}
                    className="border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeitar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* History */}
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
                        <div className="absolute left-4 top-8 w-0.5 h-full bg-border"></div>
                      )}
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm">
                          {getAcaoIcon(item.acao)}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{item.acao}</p>
                            <time className="text-xs text-muted-foreground">
                              {new Date(item.data_acao).toLocaleDateString('pt-BR')}
                            </time>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.nome_usuario}</p>
                          {item.comentario && (
                            <p className="text-sm mt-1 italic bg-muted/50 p-2 rounded">
                              "{item.comentario}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">Nenhum histórico disponível</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
