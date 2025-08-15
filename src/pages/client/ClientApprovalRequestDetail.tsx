import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, Check, X, Edit, FileText, User, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const statusConfig = {
  pending: { label: 'Pendente', variant: 'secondary' as const },
  approved: { label: 'Aprovado', variant: 'default' as const },
  rejected: { label: 'Rejeitado', variant: 'destructive' as const },
  requires_adjustment: { label: 'Requer Ajuste', variant: 'outline' as const },
};

const priorityConfig = {
  low: { label: 'Baixa', variant: 'secondary' as const },
  medium: { label: 'Média', variant: 'default' as const },
  high: { label: 'Alta', variant: 'destructive' as const },
};

const ClientApprovalRequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [comments, setComments] = useState('');
  const [showCommentsField, setShowCommentsField] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'request_adjustment' | null>(null);

  // Fetch request details
  const { data: request, isLoading } = useQuery({
    queryKey: ['approval-request-detail', id],
    queryFn: async () => {
      if (!id) throw new Error('ID not provided');
      
      const { data, error } = await supabase
        .from('approval_requests')
        .select(`
          *,
          approval_flow_types (name, description),
          approval_attachments (*),
          approval_history (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Check if user can approve this request
  const { data: canApprove } = useQuery({
    queryKey: ['can-approve', id, user?.id],
    queryFn: async () => {
      if (!id || !user || !request) return false;

      const { data, error } = await supabase
        .from('approval_steps')
        .select('*')
        .eq('flow_type_id', request.flow_type_id)
        .eq('step_order', request.current_step)
        .or(`approver_user_id.eq.${user.id},approver_email.eq.${user.email}`);

      if (error) throw error;
      return data.length > 0 && request.status === 'pending';
    },
    enabled: !!id && !!user && !!request,
  });

  // Process approval action
  const processApprovalMutation = useMutation({
    mutationFn: async ({ action, comments }: { action: string; comments?: string }) => {
      if (!request || !user) throw new Error('Missing data');

      let newStatus = request.status;
      let newStep = request.current_step;

      if (action === 'approve') {
        // Get total steps for this flow
        const { data: steps, error: stepsError } = await supabase
          .from('approval_steps')
          .select('*')
          .eq('flow_type_id', request.flow_type_id)
          .order('step_order');

        if (stepsError) throw stepsError;

        if (request.current_step >= steps.length) {
          newStatus = 'approved';
        } else {
          newStep = request.current_step + 1;
        }
      } else if (action === 'reject') {
        newStatus = 'rejected';
      } else if (action === 'request_adjustment') {
        newStatus = 'requires_adjustment';
      }

      // Update request status
      const { error: updateError } = await supabase
        .from('approval_requests')
        .update({
          status: newStatus,
          current_step: newStep,
          updated_at: new Date().toISOString(),
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      // Add to approval history
      const { error: historyError } = await supabase
        .from('approval_history')
        .insert([{
          request_id: request.id,
          approver_user_id: user.id,
          approver_email: user.email,
          approver_name: user.email, // Will be replaced with actual name from user profile
          action,
          comments,
          step_order: request.current_step,
        }]);

      if (historyError) throw historyError;

      // Send notification to requester
      await supabase.functions.invoke('send-notification', {
        body: {
          notificationId: crypto.randomUUID(),
          recipientEmail: request.requested_by_email,
          subject: `Atualização na solicitação: ${request.title}`,
          message: `Sua solicitação "${request.title}" foi ${
            action === 'approve' ? 'aprovada' : 
            action === 'reject' ? 'rejeitada' : 'devolvida para ajuste'
          }.${comments ? ` Comentários: ${comments}` : ''}`,
          type: 'approval_update',
        },
      });

      // If approved and moving to next step, notify next approver
      if (action === 'approve' && newStatus === 'pending') {
        const { data: nextSteps, error: nextStepsError } = await supabase
          .from('approval_steps')
          .select('*')
          .eq('flow_type_id', request.flow_type_id)
          .eq('step_order', newStep);

        if (!nextStepsError && nextSteps.length > 0) {
          const nextApprover = nextSteps[0];
          await supabase.functions.invoke('send-notification', {
            body: {
              notificationId: crypto.randomUUID(),
              recipientEmail: nextApprover.approver_email,
              subject: `Nova solicitação de aprovação: ${request.title}`,
              message: `A solicitação "${request.title}" aguarda sua aprovação.`,
              type: 'approval_request',
            },
          });
        }
      }
    },
    onSuccess: () => {
      toast.success('Ação processada com sucesso!');
      setComments('');
      setShowCommentsField(false);
      setActionType(null);
      queryClient.invalidateQueries({ queryKey: ['approval-request-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['pending-approval-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['my-approval-requests'] });
    },
    onError: (error: any) => {
      toast.error('Erro ao processar ação: ' + error.message);
    },
  });

  const handleAction = (action: 'approve' | 'reject' | 'request_adjustment') => {
    if (action === 'reject' || action === 'request_adjustment') {
      setActionType(action);
      setShowCommentsField(true);
    } else {
      processApprovalMutation.mutate({ action });
    }
  };

  const handleSubmitWithComments = () => {
    if (!actionType) return;
    
    if ((actionType === 'reject' || actionType === 'request_adjustment') && !comments.trim()) {
      toast.error('Comentários são obrigatórios para esta ação');
      return;
    }

    processApprovalMutation.mutate({ 
      action: actionType, 
      comments: comments.trim() || undefined 
    });
  };

  const downloadAttachment = async (attachment: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(attachment.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error('Erro ao baixar arquivo: ' + error.message);
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

  if (!request) {
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
                  <CardTitle className="text-2xl">{request.title}</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    {request.approval_flow_types?.name}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Badge variant={statusConfig[request.status as keyof typeof statusConfig]?.variant}>
                    {statusConfig[request.status as keyof typeof statusConfig]?.label}
                  </Badge>
                  <Badge variant={priorityConfig[request.priority as keyof typeof priorityConfig]?.variant}>
                    {priorityConfig[request.priority as keyof typeof priorityConfig]?.label}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Descrição</h3>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {request.description}
                  </pre>
                </div>
              </div>

              {request.amount && (
                <div>
                  <h3 className="font-medium mb-2">Valor</h3>
                  <p className="text-lg font-semibold">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(Number(request.amount))}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attachments */}
          {request.approval_attachments && request.approval_attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Anexos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {request.approval_attachments.map((attachment: any) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{attachment.filename}</p>
                          <p className="text-sm text-muted-foreground">
                            {(attachment.file_size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadAttachment(attachment)}
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

          {/* Approval Actions */}
          {canApprove && (
            <Card>
              <CardHeader>
                <CardTitle>Ações de Aprovação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showCommentsField ? (
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => handleAction('approve')}
                      disabled={processApprovalMutation.isPending}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Aprovar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleAction('reject')}
                      disabled={processApprovalMutation.isPending}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Rejeitar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleAction('request_adjustment')}
                      disabled={processApprovalMutation.isPending}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Solicitar Ajuste
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="comments">
                        Comentários * 
                        <span className="text-sm text-muted-foreground ml-2">
                          (Obrigatório para {actionType === 'reject' ? 'rejeição' : 'solicitação de ajuste'})
                        </span>
                      </Label>
                      <Textarea
                        id="comments"
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Digite seus comentários..."
                        rows={4}
                      />
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        onClick={handleSubmitWithComments}
                        disabled={processApprovalMutation.isPending}
                      >
                        Confirmar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowCommentsField(false);
                          setActionType(null);
                          setComments('');
                        }}
                        disabled={processApprovalMutation.isPending}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
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
                  <p className="font-medium">{request.requested_by_name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Data de Criação</p>
                  <p className="font-medium">
                    {format(new Date(request.created_at), 'dd/MM/yyyy HH:mm', {
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
                    {request.current_step} de {request.total_steps}
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
              {request.approval_history && request.approval_history.length > 0 ? (
                <div className="space-y-4">
                  {request.approval_history
                    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((history: any) => (
                      <div key={history.id} className="border-l-2 border-primary pl-4 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm">{history.approver_name}</p>
                          <Badge variant="outline" className="text-xs">
                            Etapa {history.step_order}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {history.action === 'approve' ? 'Aprovado' :
                           history.action === 'reject' ? 'Rejeitado' :
                           'Solicitou ajuste'}
                        </p>
                        {history.comments && (
                          <p className="text-sm bg-muted p-2 rounded">
                            {history.comments}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(history.created_at), 'dd/MM/yyyy HH:mm', {
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