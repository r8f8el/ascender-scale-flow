import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Clock, 
  User, 
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  MessageSquare,
  FileText,
  Eye
} from 'lucide-react';

interface PendingRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  amount: number | null;
  current_step: number;
  total_steps: number;
  requested_by_name: string;
  requested_by_email: string;
  created_at: string;
  approval_flow_types?: {
    name: string;
  };
}

export const PendingApprovalTasks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);
  const [actionComments, setActionComments] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Buscar solicitações pendentes para aprovação do usuário
  const { data: pendingRequests = [], isLoading } = useQuery({
    queryKey: ['pending-approval-tasks', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Primeiro, buscar os flow_type_ids onde o usuário é aprovador
      const { data: approverSteps } = await supabase
        .from('approval_steps')
        .select('flow_type_id')
        .or(`approver_user_id.eq.${user.id},approver_email.eq.${user.email}`);

      if (!approverSteps || approverSteps.length === 0) return [];

      const flowTypeIds = approverSteps.map(step => step.flow_type_id);

      // Buscar solicitações pendentes desses tipos de fluxo
      const { data, error } = await supabase
        .from('approval_requests')
        .select(`
          id,
          title,
          description,
          status,
          priority,
          amount,
          current_step,
          total_steps,
          requested_by_name,
          requested_by_email,
          created_at,
          approval_flow_types (name)
        `)
        .eq('status', 'pending')
        .in('flow_type_id', flowTypeIds)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as PendingRequest[];
    },
    enabled: !!user
  });

  // Mutation para aprovar/rejeitar solicitação
  const updateRequestMutation = useMutation({
    mutationFn: async ({ requestId, action, comments }: { requestId: string; action: string; comments: string }) => {
      const newStatus = action === 'approved' ? 'approved' : action === 'rejected' ? 'rejected' : 'pending';
      
      // Atualizar status da solicitação
      const { error: updateError } = await supabase
        .from('approval_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Adicionar ao histórico
      const { error: historyError } = await supabase
        .from('approval_history')
        .insert({
          request_id: requestId,
          action,
          comments,
          approver_name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'Aprovador',
          approver_email: user?.email || '',
          approver_user_id: user?.id,
          step_order: selectedRequest?.current_step || 1
        });

      if (historyError) throw historyError;

      // Enviar notificação (chamada para edge function)
      try {
        await supabase.functions.invoke('send-approval-notification', {
          body: {
            requestId,
            action,
            comments,
            approverName: user?.user_metadata?.name || user?.email?.split('@')[0] || 'Aprovador',
            recipientEmail: selectedRequest?.requested_by_email
          }
        });
      } catch (notificationError) {
        console.warn('Erro ao enviar notificação:', notificationError);
      }
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['pending-approval-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['approval-stats'] });
      setSelectedRequest(null);
      setActionComments('');
      setIsDialogOpen(false);
      toast({
        title: "Sucesso",
        description: `Solicitação ${action === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso!`
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao processar solicitação. Tente novamente.",
        variant: "destructive"
      });
      console.error('Erro ao processar solicitação:', error);
    }
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Alta</Badge>;
      case 'medium':
        return <Badge variant="secondary">Média</Badge>;
      case 'low':
        return <Badge variant="outline">Baixa</Badge>;
      default:
        return <Badge variant="secondary">Média</Badge>;
    }
  };

  const handleViewDetails = (request: PendingRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  const handleAction = (action: 'approved' | 'rejected') => {
    if (!selectedRequest) return;

    updateRequestMutation.mutate({
      requestId: selectedRequest.id,
      action,
      comments: actionComments
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {pendingRequests.length > 0 ? (
          <>
            <div className="text-sm text-muted-foreground mb-4">
              {pendingRequests.length} solicitação(ões) aguardando sua aprovação
            </div>
            
            {pendingRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{request.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {request.requested_by_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(request.created_at).toLocaleDateString('pt-BR')}
                        </div>
                        {request.amount && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            R$ {request.amount.toLocaleString('pt-BR')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(request.priority)}
                      <Badge variant="outline">
                        {request.approval_flow_types?.name || 'Fluxo Padrão'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {request.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Etapa {request.current_step} de {request.total_steps}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(request)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma aprovação pendente
            </h3>
            <p className="text-gray-500">
              Você está em dia! Não há solicitações aguardando sua aprovação no momento.
            </p>
          </div>
        )}
      </div>

      {/* Dialog de Detalhes e Ação */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Solicitação</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Informações da Solicitação */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Título</label>
                  <p className="text-sm">{selectedRequest.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Solicitante</label>
                  <p className="text-sm">{selectedRequest.requested_by_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Prioridade</label>
                  <div className="mt-1">
                    {getPriorityBadge(selectedRequest.priority)}
                  </div>
                </div>
                {selectedRequest.amount && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Valor</label>
                    <p className="text-sm">R$ {selectedRequest.amount.toLocaleString('pt-BR')}</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Descrição</label>
                <p className="text-sm mt-1 bg-gray-50 p-3 rounded">
                  {selectedRequest.description}
                </p>
              </div>

              {/* Comentários para Ação */}
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Comentários <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Adicione comentários sobre sua decisão..."
                  value={actionComments}
                  onChange={(e) => setActionComments(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              {/* Botões de Ação */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => handleAction('approved')}
                  disabled={updateRequestMutation.isPending || !actionComments.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {updateRequestMutation.isPending ? 'Processando...' : 'Aprovar'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleAction('rejected')}
                  disabled={updateRequestMutation.isPending || !actionComments.trim()}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {updateRequestMutation.isPending ? 'Processando...' : 'Rejeitar'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};