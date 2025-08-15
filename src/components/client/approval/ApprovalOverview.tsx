import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Plus,
  FileText,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const ApprovalOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['approval-dashboard', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get all requests for the user
      const { data: myRequests, error: requestsError } = await supabase
        .from('approval_requests')
        .select('*')
        .eq('requested_by_user_id', user.id);

      if (requestsError) throw requestsError;

      // Get pending approvals where user is the approver
      const { data: mySteps, error: stepsError } = await supabase
        .from('approval_steps')
        .select('flow_type_id, step_order')
        .or(`approver_user_id.eq.${user.id},approver_email.eq.${user.email}`);

      if (stepsError) throw stepsError;

      let pendingApprovals: any[] = [];
      if (mySteps?.length) {
        for (const step of mySteps) {
          const { data: requests, error: requestsError } = await supabase
            .from('approval_requests')
            .select('*')
            .eq('flow_type_id', step.flow_type_id)
            .eq('current_step', step.step_order)
            .eq('status', 'pending');

          if (requestsError) throw requestsError;
          if (requests) {
            pendingApprovals.push(...requests);
          }
        }
      }

      // Get recent requests
      const { data: recentRequests, error: recentError } = await supabase
        .from('approval_requests')
        .select(`
          *,
          approval_flow_types (name)
        `)
        .eq('requested_by_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) throw recentError;

      return {
        myRequests: myRequests || [],
        pendingApprovals: pendingApprovals || [],
        recentRequests: recentRequests || [],
      };
    },
    enabled: !!user,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return <div>Erro ao carregar dados</div>;
  }

  const { myRequests, pendingApprovals, recentRequests } = dashboardData;

  // Calculate metrics
  const totalPending = myRequests.filter(r => r.status === 'pending').length;
  const approvedToday = myRequests.filter(r => 
    r.status === 'approved' && 
    new Date(r.updated_at).toDateString() === new Date().toDateString()
  ).length;
  const totalValueInAnalysis = myRequests
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + (r.amount || 0), 0);
  const activeRequests = myRequests.filter(r => 
    ['pending', 'draft'].includes(r.status)
  ).length;

  const statusConfig = {
    draft: { label: 'Rascunho', variant: 'secondary' as const },
    pending: { label: 'Pendente', variant: 'secondary' as const },
    approved: { label: 'Aprovado', variant: 'default' as const },
    rejected: { label: 'Rejeitado', variant: 'destructive' as const },
    request_adjustment: { label: 'Requer Ajuste', variant: 'outline' as const },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fluxo de Aprovações</h1>
          <p className="text-muted-foreground">
            Gerencie suas solicitações e aprovações em um só lugar
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/cliente/aprovacoes')} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Solicitação
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPending}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando aprovação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovações Hoje</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedToday}</div>
            <p className="text-xs text-muted-foreground">
              Aprovadas hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor em Análise</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValueInAnalysis)}</div>
            <p className="text-xs text-muted-foreground">
              Total pendente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitações Ativas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRequests}</div>
            <p className="text-xs text-muted-foreground">
              Em andamento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" 
              onClick={() => navigate('/cliente/aprovacoes')}>
          <CardContent className="p-4 text-center">
            <Plus className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium">Nova Solicitação</h3>
            <p className="text-sm text-muted-foreground">Criar nova solicitação</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => navigate('/cliente/aprovacoes')}>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <h3 className="font-medium">Ver Pendentes</h3>
            <p className="text-sm text-muted-foreground">{pendingApprovals.length} para aprovar</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <h3 className="font-medium">Relatórios</h3>
            <p className="text-sm text-muted-foreground">Análises e métricas</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <h3 className="font-medium">Histórico</h3>
            <p className="text-sm text-muted-foreground">Ver todas solicitações</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Solicitações Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentRequests.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma solicitação encontrada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.title}</TableCell>
                    <TableCell>{request.approval_flow_types?.name}</TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[request.status as keyof typeof statusConfig]?.variant}>
                        {statusConfig[request.status as keyof typeof statusConfig]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{request.amount ? formatCurrency(request.amount) : '-'}</TableCell>
                    <TableCell>
                      {format(new Date(request.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/cliente/aprovacoes/${request.id}`)}
                      >
                        Ver Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pending Approvals Alert */}
      {pendingApprovals.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              Aprovações Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-4">
              Você tem {pendingApprovals.length} solicitação(ões) aguardando sua aprovação.
            </p>
            <Button 
              variant="outline" 
              className="border-orange-300 text-orange-800 hover:bg-orange-100"
              onClick={() => navigate('/cliente/aprovacoes')}
            >
              Revisar Pendências
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};