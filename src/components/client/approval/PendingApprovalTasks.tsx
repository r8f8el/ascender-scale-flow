import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

// Priority configuration
const priorityConfig = {
  low: { label: 'Baixa', variant: 'secondary' as const },
  medium: { label: 'Média', variant: 'outline' as const },
  high: { label: 'Alta', variant: 'destructive' as const },
};

export const PendingApprovalTasks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: pendingTasks, isLoading } = useQuery({
    queryKey: ['pending-approval-tasks', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // First get the approval steps where current user is an approver
      const { data: mySteps, error: stepsError } = await supabase
        .from('approval_steps')
        .select('flow_type_id, step_order')
        .or(`approver_user_id.eq.${user.id},approver_email.eq.${user.email}`);

      if (stepsError) throw stepsError;
      if (!mySteps?.length) return [];

      // Then get approval requests that are at those steps
      const pendingRequests = [];
      for (const step of mySteps) {
        const { data: requests, error: requestsError } = await supabase
          .from('approval_requests')
          .select(`
            *,
            approval_flow_types (name)
          `)
          .eq('flow_type_id', step.flow_type_id)
          .eq('current_step', step.step_order)
          .eq('status', 'pending');

        if (requestsError) throw requestsError;
        if (requests) {
          pendingRequests.push(...requests);
        }
      }

      return pendingRequests;
    },
    enabled: !!user,
  });

  const handleViewDetails = (requestId: string) => {
    navigate(`/cliente/aprovacoes/${requestId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!pendingTasks || pendingTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhuma aprovação pendente</h3>
        <p className="text-muted-foreground">
          Você não possui solicitações aguardando sua aprovação no momento.
        </p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6 text-orange-500" />
            Tarefas Pendentes de Aprovação
          </h2>
          <p className="text-muted-foreground">
            Solicitações aguardando sua análise e aprovação
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-medium">{pendingTasks.length} pendente(s)</span>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Solicitante</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingTasks.map((task) => (
              <TableRow key={task.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="font-medium">{task.title}</div>
                  <div className="text-sm text-muted-foreground line-clamp-1">
                    {task.description}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{task.approval_flow_types?.name}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium">{task.requested_by_name}</div>
                  <div className="text-xs text-muted-foreground">{task.requested_by_email}</div>
                </TableCell>
                <TableCell>
                  <div className="font-mono text-sm">
                    {task.amount ? formatCurrency(task.amount) : '-'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {format(new Date(task.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(task.created_at), 'HH:mm', { locale: ptBR })}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={priorityConfig[task.priority as keyof typeof priorityConfig]?.variant}>
                    {priorityConfig[task.priority as keyof typeof priorityConfig]?.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(task.id)}
                    className="hover:bg-primary hover:text-primary-foreground"
                  >
                    Revisar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};