import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Plus, 
  Settings, 
  Users, 
  FileText,
  AlertCircle,
  TrendingUp,
  Calendar
} from 'lucide-react';

// Interfaces
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
  approval_flow_types?: {
    name: string;
  };
}

interface FlowType {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface ApprovalStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  avgProcessingTime: number;
}



const ApprovalFlowsAdmin = () => {
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [actionComments, setActionComments] = useState('');
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowDescription, setNewFlowDescription] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch approval statistics
  const { data: stats } = useQuery({
    queryKey: ['approval-stats'],
    queryFn: async () => {
      const { data: requests, error } = await supabase
        .from('approval_requests')
        .select('status, created_at');
      
      if (error) throw error;

      const stats: ApprovalStats = {
        totalRequests: requests.length,
        pendingRequests: requests.filter(r => r.status === 'pending').length,
        approvedRequests: requests.filter(r => r.status === 'approved').length,
        rejectedRequests: requests.filter(r => r.status === 'rejected').length,
        avgProcessingTime: 0 // Calcular depois
      };

      return stats;
    }
  });

  // Fetch all approval requests
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['all-approval-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('approval_requests')
        .select(`
          *,
          approval_flow_types (name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ApprovalRequest[];
    }
  });

  // Fetch flow types
  const { data: flowTypes = [] } = useQuery({
    queryKey: ['approval-flow-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('approval_flow_types')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as FlowType[];
    }
  });

  // Create new flow type mutation
  const createFlowTypeMutation = useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      const { error } = await supabase
        .from('approval_flow_types')
        .insert({ name, description });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-flow-types'] });
      setNewFlowName('');
      setNewFlowDescription('');
      toast({
        title: "Sucesso",
        description: "Tipo de fluxo criado com sucesso!"
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar tipo de fluxo.",
        variant: "destructive"
      });
    }
  });

  // Update request status mutation
  const updateRequestMutation = useMutation({
    mutationFn: async ({ requestId, action, comments }: { requestId: string; action: string; comments: string }) => {
      const newStatus = action === 'approved' ? 'approved' : action === 'rejected' ? 'rejected' : 'pending';
      
      const { error: updateError } = await supabase
        .from('approval_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Add to history
      const { error: historyError } = await supabase
        .from('approval_history')
        .insert({
          request_id: requestId,
          action,
          comments,
          approver_name: 'Admin',
          approver_email: 'admin@example.com',
          step_order: selectedRequest?.current_step || 1
        });

      if (historyError) throw historyError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-approval-requests'] });
      queryClient.invalidateQueries({ queryKey: ['approval-stats'] });
      setSelectedRequest(null);
      setActionComments('');
      toast({
        title: "Sucesso",
        description: "Ação realizada com sucesso!"
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao processar solicitação.",
        variant: "destructive"
      });
    }
  });

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

  const filteredRequests = requests.filter(request => 
    request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.requested_by_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Fluxos de Aprovação</h1>
          <p className="text-muted-foreground">
            Administre solicitações e configure fluxos de aprovação
          </p>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="requests">Solicitações</TabsTrigger>
          <TabsTrigger value="flows">Tipos de Fluxo</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Solicitações</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalRequests || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +2 desde ontem
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.pendingRequests || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Aguardando aprovação
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.approvedRequests || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats?.approvedRequests || 0} este mês
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejeitadas</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.rejectedRequests || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Para revisão
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.slice(0, 5).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(request.status)}
                      <div>
                        <p className="font-medium">{request.title}</p>
                        <p className="text-sm text-muted-foreground">
                          por {request.requested_by_name}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          <div className="flex gap-4 items-center">
            <Input
              placeholder="Buscar solicitações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Todas as Solicitações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(request.status)}
                      <div className="flex-1">
                        <h3 className="font-medium">{request.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span>{request.requested_by_name}</span>
                          <span>•</span>
                          <span>{new Date(request.created_at).toLocaleDateString('pt-BR')}</span>
                          {request.amount && (
                            <>
                              <span>•</span>
                              <span>R$ {request.amount.toLocaleString('pt-BR')}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      
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
                                  <Label>Título</Label>
                                  <p className="text-sm">{selectedRequest.title}</p>
                                </div>
                                <div>
                                  <Label>Status</Label>
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(selectedRequest.status)}
                                    <Badge className={getStatusColor(selectedRequest.status)}>
                                      {selectedRequest.status}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <Label>Solicitante</Label>
                                  <p className="text-sm">{selectedRequest.requested_by_name}</p>
                                </div>
                                {selectedRequest.amount && (
                                  <div>
                                    <Label>Valor</Label>
                                    <p className="text-sm">R$ {selectedRequest.amount.toLocaleString('pt-BR')}</p>
                                  </div>
                                )}
                              </div>
                              
                              {selectedRequest.description && (
                                <div>
                                  <Label>Descrição</Label>
                                  <p className="text-sm mt-1">{selectedRequest.description}</p>
                                </div>
                              )}

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
        </TabsContent>

        {/* Flow Types Tab */}
        <TabsContent value="flows" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tipos de Fluxo de Aprovação</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Tipo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Novo Tipo de Fluxo</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="flowName">Nome</Label>
                        <Input
                          id="flowName"
                          value={newFlowName}
                          onChange={(e) => setNewFlowName(e.target.value)}
                          placeholder="Ex: Aprovação de Orçamento"
                        />
                      </div>
                      <div>
                        <Label htmlFor="flowDescription">Descrição</Label>
                        <Textarea
                          id="flowDescription"
                          value={newFlowDescription}
                          onChange={(e) => setNewFlowDescription(e.target.value)}
                          placeholder="Descreva o propósito deste tipo de fluxo..."
                        />
                      </div>
                      <Button
                        onClick={() => createFlowTypeMutation.mutate({
                          name: newFlowName,
                          description: newFlowDescription
                        })}
                        disabled={createFlowTypeMutation.isPending || !newFlowName}
                      >
                        Criar Tipo
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {flowTypes.map((flowType) => (
                  <div key={flowType.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{flowType.name}</h3>
                        {flowType.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {flowType.description}
                          </p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Usuários e Permissões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Funcionalidade de gestão de usuários em desenvolvimento
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Configurações avançadas em desenvolvimento
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApprovalFlowsAdmin;