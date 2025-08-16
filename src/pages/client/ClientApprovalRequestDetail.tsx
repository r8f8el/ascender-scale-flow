import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, FileText, User, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Solicitacao } from '@/types/aprovacoes';
import { SecureApprovalActions } from '@/components/aprovacoes/SecureApprovalActions';
import { useRateLimit } from '@/hooks/useRateLimit';

const statusConfig = {
  'Em Elaboração': { label: 'Em Elaboração', variant: 'secondary' as const },
  'Pendente': { label: 'Pendente', variant: 'default' as const },
  'Aprovado': { label: 'Aprovado', variant: 'default' as const },
  'Rejeitado': { label: 'Rejeitado', variant: 'destructive' as const },
  'Requer Ajuste': { label: 'Requer Ajuste', variant: 'outline' as const },
};

const ClientApprovalRequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { checkRateLimit } = useRateLimit();

  // Fetch solicitacao details
  const { data: solicitacao, isLoading } = useQuery({
    queryKey: ['solicitacao-detail', id],
    queryFn: async () => {
      if (!id) throw new Error('ID not provided');
      
      const { data, error } = await supabase
        .from('solicitacoes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Solicitacao;
    },
    enabled: !!id,
  });

  // Fetch anexos
  const { data: anexos } = useQuery({
    queryKey: ['anexos', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('anexos')
        .select('*')
        .eq('solicitacao_id', id)
        .order('data_upload', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch histórico
  const { data: historico } = useQuery({
    queryKey: ['historico-aprovacao', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('historico_aprovacao')
        .select('*')
        .eq('solicitacao_id', id)
        .order('data_acao', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Check if user can approve this request
  const { data: canApprove } = useQuery({
    queryKey: ['can-approve', id, user?.id],
    queryFn: async () => {
      if (!id || !user || !solicitacao) return false;
      return solicitacao.aprovador_atual_id === user.id && solicitacao.status === 'Pendente';
    },
    enabled: !!id && !!user && !!solicitacao,
  });

  // Process approval action
  const processApprovalMutation = useMutation({
    mutationFn: async ({ action, comments }: { action: string; comments?: string }) => {
      if (!solicitacao || !user) throw new Error('Missing data');

      let newStatus = solicitacao.status;
      let newAprovadorId = solicitacao.aprovador_atual_id;

      if (action === 'approve') {
        // Buscar próximo aprovador no fluxo
        const { data: fluxoAprovadores, error: fluxoError } = await supabase
          .from('fluxo_aprovadores')
          .select('*')
          .eq('cliente_id', solicitacao.solicitante_id)
          .order('ordem');

        if (fluxoError) throw fluxoError;

        const currentApproverIndex = fluxoAprovadores.findIndex(f => f.aprovador_id === user.id);
        const nextApprover = fluxoAprovadores[currentApproverIndex + 1];

        if (nextApprover) {
          // Há próximo aprovador
          newAprovadorId = nextApprover.aprovador_id;
          newStatus = 'Pendente';
        } else {
          // É a aprovação final
          newStatus = 'Aprovado';
          newAprovadorId = null;
        }
      } else if (action === 'reject') {
        newStatus = 'Rejeitado';
        newAprovadorId = null;
      } else if (action === 'request_adjustment') {
        newStatus = 'Requer Ajuste';
        newAprovadorId = null;
      }

      // Update solicitacao status
      const { error: updateError } = await supabase
        .from('solicitacoes')
        .update({
          status: newStatus,
          aprovador_atual_id: newAprovadorId,
          data_ultima_modificacao: new Date().toISOString(),
        })
        .eq('id', solicitacao.id);

      if (updateError) throw updateError;

      // Add to approval history
      const actionMap = {
        'approve': 'Aprovação',
        'reject': 'Rejeição',
        'request_adjustment': 'Solicitação de Ajuste'
      };

      const { error: historyError } = await supabase
        .from('historico_aprovacao')
        .insert([{
          solicitacao_id: solicitacao.id,
          usuario_id: user.id,
          nome_usuario: user.email || 'Aprovador',
          acao: actionMap[action as keyof typeof actionMap],
          comentario: comments,
        }]);

      if (historyError) throw historyError;
    },
    onSuccess: () => {
      toast.success('Ação processada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['solicitacao-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['historico-aprovacao', id] });
      queryClient.invalidateQueries({ queryKey: ['solicitacoes-pendentes'] });
    },
    onError: (error: any) => {
      toast.error('Erro ao processar ação: ' + error.message);
    },
  });

  const handleApprove = async (comments?: string) => {
    processApprovalMutation.mutate({ action: 'approve', comments });
  };

  const handleReject = async (comments: string) => {
    processApprovalMutation.mutate({ action: 'reject', comments });
  };

  const handleRequestAdjustment = async (comments: string) => {
    processApprovalMutation.mutate({ action: 'request_adjustment', comments });
  };

  const downloadAttachment = async (attachment: any) => {
    try {
      // Check rate limit for downloads
      const allowed = await checkRateLimit({
        action: 'file_download',
        maxAttempts: 50,
        windowMinutes: 60
      });

      if (!allowed) return;

      window.open(attachment.url_arquivo, '_blank');
    } catch (error: any) {
      toast.error('Erro ao abrir arquivo: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!solicitacao) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive">Solicitação não encontrada.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate('/client/approval-requests')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Solicitações
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{solicitacao.titulo}</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    Período: {solicitacao.periodo_referencia}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Badge variant={statusConfig[solicitacao.status as keyof typeof statusConfig]?.variant}>
                    {statusConfig[solicitacao.status as keyof typeof statusConfig]?.label}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Descrição</h3>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm bg-muted p-4 rounded">
                    {solicitacao.descricao}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          {anexos && anexos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Anexos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {anexos.map((anexo: any) => (
                    <div
                      key={anexo.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{anexo.nome_arquivo}</p>
                          {anexo.tamanho_arquivo && (
                            <p className="text-sm text-muted-foreground">
                              {(anexo.tamanho_arquivo / 1024 / 1024).toFixed(2)} MB
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadAttachment(anexo)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Secure Approval Actions */}
          <SecureApprovalActions
            onApprove={handleApprove}
            onReject={handleReject}
            onRequestAdjustment={handleRequestAdjustment}
            isLoading={processApprovalMutation.isPending}
            canApprove={canApprove}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Request Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Solicitação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Solicitante</p>
                  <p className="font-medium">{solicitacao.solicitante_id}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Data de Criação</p>
                  <p className="font-medium">
                    {format(new Date(solicitacao.data_criacao), 'dd/MM/yyyy HH:mm', {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Etapa Atual</p>
                  <p className="font-medium">
                    {solicitacao.etapa_atual}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Approval History */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Aprovações</CardTitle>
            </CardHeader>
            <CardContent>
              {historico && historico.length > 0 ? (
                <div className="space-y-4">
                  {historico
                    .sort((a: any, b: any) => new Date(b.data_acao).getTime() - new Date(a.data_acao).getTime())
                    .map((history: any) => (
                      <div key={history.id} className="border-l-2 border-primary pl-4 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm">{history.nome_usuario}</p>
                          <Badge variant="outline" className="text-xs">
                            {history.acao}
                          </Badge>
                        </div>
                        {history.comentario && (
                          <p className="text-sm bg-muted p-2 rounded">
                            {history.comentario}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(history.data_acao), 'dd/MM/yyyy HH:mm', {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhuma ação de aprovação registrada ainda.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientApprovalRequestDetail;
