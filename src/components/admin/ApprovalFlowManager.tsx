
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Clock, Eye, User, Building, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApprovalRequest {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  amount: number | null;
  current_step: number;
  total_steps: number;
  requested_by_user_id: string;
  requested_by_name: string;
  requested_by_email: string;
  created_at: string;
  flow_type_id: string;
}

interface ClientProfile {
  id: string;
  name: string;
  email: string;
  company: string | null;
}

interface ApprovalHistory {
  id: string;
  action: string;
  comments: string | null;
  approver_name: string;
  approver_email: string;
  created_at: string;
}

const ApprovalFlowManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [actionComments, setActionComments] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery({
    queryKey: ['admin-clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_profiles')
        .select('id, name, email, company')
        .order('name');
      
      if (error) throw error;
      return data as ClientProfile[];
    }
  });

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['approval-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('approval_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ApprovalRequest[];
    }
  });

  const { data: selectedRequestHistory = [] } = useQuery({
    queryKey: ['approval-history', selectedRequest?.id],
    queryFn: async () => {
      if (!selectedRequest) return [];
      
      const { data, error } = await supabase
        .from('approval_history')
        .select('*')
        .eq('request_id', selectedRequest.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as ApprovalHistory[];
    },
    enabled: !!selectedRequest
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ requestId, action, comments }: { requestId: string; action: string; comments: string }) => {
      // Atualizar status da solicitação
      const newStatus = action === 'approved' ? 'approved' : action === 'rejected' ? 'rejected' : 'pending';
      
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
          approver_name: 'Admin', // Seria o nome do admin logado
          approver_email: 'admin@example.com', // Seria o email do admin logado
          step_order: selectedRequest?.current_step || 1
        });

      if (historyError) throw historyError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-requests'] });
      queryClient.invalidateQueries({ queryKey: ['approval-history'] });
      setSelectedRequest(null);
      setActionComments('');
      toast({
        title: "Sucesso",
        description: "Ação realizada com sucesso!"
      });
    },
    onError: (error) => {
      console.error('Erro ao processar solicitação:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar solicitação.",
        variant: "destructive"
      });
    }
  });

  const getClientById = (clientId: string) => {
    return clients.find(client => client.id === clientId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = requests.filter(request => {
    const client = getClientById(request.requested_by_user_id);
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client?.company?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const requestsGroupedByClient = filteredRequests.reduce((acc, request) => {
    const client = getClientById(request.requested_by_user_id);
    if (!client) return acc;
    
    if (!acc[client.id]) {
      acc[client.id] = {
        client,
        requests: []
      };
    }
    acc[client.id].requests.push(request);
    return acc;
  }, {} as Record<string, { client: ClientProfile; requests: ApprovalRequest[] }>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fluxos de Aprovação</h2>
          <p className="text-muted-foreground">Gerencie solicitações de aprovação de todos os clientes</p>
        </div>
        
        <div className="relative w-full sm:w-80">
          <Input
            placeholder="Buscar por solicitação ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6">
        {Object.entries(requestsGroupedByClient).map(([clientId, { client, requests: clientRequests }]) => (
          <Card key={clientId} className="w-full">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    <AvatarInitials name={client.name} />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {client.name}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span>{client.email}</span>
                    {client.company && (
                      <span className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {client.company}
                      </span>
                    )}
                  </div>
                </div>
                <Badge variant="secondary">
                  {clientRequests.length} {clientRequests.length === 1 ? 'solicitação' : 'solicitações'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid gap-3">
                {clientRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-shrink-0">
                        {getStatusIcon(request.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{request.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                          <Badge className={getPriorityColor(request.priority)}>
                            {request.priority}
                          </Badge>
                          <span>{new Date(request.created_at).toLocaleDateString('pt-BR')}</span>
                          {request.amount && (
                            <span>R$ {request.amount.toLocaleString('pt-BR')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalhes da Solicitação</DialogTitle>
                          </DialogHeader>
                          
                          {selectedRequest && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Título</Label>
                                  <p className="text-sm">{selectedRequest.title}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Status</Label>
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(selectedRequest.status)}
                                    <Badge className={getStatusColor(selectedRequest.status)}>
                                      {selectedRequest.status}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Prioridade</Label>
                                  <Badge className={getPriorityColor(selectedRequest.priority)}>
                                    {selectedRequest.priority}
                                  </Badge>
                                </div>
                                {selectedRequest.amount && (
                                  <div>
                                    <Label className="text-sm font-medium">Valor</Label>
                                    <p className="text-sm">R$ {selectedRequest.amount.toLocaleString('pt-BR')}</p>
                                  </div>
                                )}
                              </div>
                              
                              {selectedRequest.description && (
                                <div>
                                  <Label className="text-sm font-medium">Descrição</Label>
                                  <p className="text-sm mt-1">{selectedRequest.description}</p>
                                </div>
                              )}

                              {/* Histórico de aprovações */}
                              {selectedRequestHistory.length > 0 && (
                                <div>
                                  <Label className="text-sm font-medium">Histórico</Label>
                                  <div className="space-y-2 mt-2">
                                    {selectedRequestHistory.map((history) => (
                                      <div key={history.id} className="p-2 border rounded text-sm">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-medium">{history.approver_name}</span>
                                          <Badge variant="outline" className="text-xs">
                                            {history.action}
                                          </Badge>
                                          <span className="text-xs text-muted-foreground">
                                            {new Date(history.created_at).toLocaleString('pt-BR')}
                                          </span>
                                        </div>
                                        {history.comments && (
                                          <p className="text-muted-foreground">{history.comments}</p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Ações de aprovação */}
                              {selectedRequest.status === 'pending' && (
                                <div className="space-y-4 border-t pt-4">
                                  <div>
                                    <Label htmlFor="comments">Comentários</Label>
                                    <Textarea
                                      id="comments"
                                      placeholder="Adicione comentários sobre sua decisão..."
                                      value={actionComments}
                                      onChange={(e) => setActionComments(e.target.value)}
                                    />
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => updateRequestMutation.mutate({
                                        requestId: selectedRequest.id,
                                        action: 'approved',
                                        comments: actionComments
                                      })}
                                      disabled={updateRequestMutation.isPending}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Aprovar
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => updateRequestMutation.mutate({
                                        requestId: selectedRequest.id,
                                        action: 'rejected',
                                        comments: actionComments
                                      })}
                                      disabled={updateRequestMutation.isPending}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Rejeitar
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {Object.keys(requestsGroupedByClient).length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma solicitação encontrada
              </h3>
              <p className="text-gray-500">
                {searchTerm ? 'Tente ajustar os filtros de busca' : 'Ainda não há solicitações de aprovação no sistema'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ApprovalFlowManager;
