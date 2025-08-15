import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const priorityConfig = {
  low: { label: 'Baixa', variant: 'secondary' as const },
  medium: { label: 'Média', variant: 'default' as const },
  high: { label: 'Alta', variant: 'destructive' as const },
};

export const PendingApprovalTasks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: pendingTasks = [], isLoading } = useQuery({
    queryKey: ['pending-approval-tasks', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // First get approval steps where user is an approver
      const { data: userSteps, error: stepsError } = await supabase
        .from('approval_steps')
        .select('flow_type_id, step_order')
        .or(`approver_user_id.eq.${user.id},approver_email.eq.${user.email}`);

      if (stepsError) throw stepsError;
      if (!userSteps || userSteps.length === 0) return [];

      // Get requests where user is current step approver
      const { data, error } = await supabase
        .from('approval_requests')
        .select(`
          *,
          approval_flow_types (name)
        `)
        .eq('status', 'pending')
        .in('flow_type_id', userSteps.map(s => s.flow_type_id))
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter to only include tasks where the user is the current step approver
      const filteredData = data?.filter(request => {
        const userStepForFlow = userSteps.find(s => s.flow_type_id === request.flow_type_id);
        return userStepForFlow && userStepForFlow.step_order === request.current_step;
      }) || [];

      return filteredData;
    },
    enabled: !!user,
  });

  const handleViewDetails = (requestId: string) => {
    navigate(`/client/approval-requests/${requestId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (pendingTasks.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Não há tarefas de aprovação pendentes no momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-primary" />
          <span className="font-medium text-primary">
            {pendingTasks.length} tarefa{pendingTasks.length !== 1 ? 's' : ''} pendente{pendingTasks.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título da Solicitação</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Solicitante</TableHead>
            <TableHead>Data de Recebimento</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingTasks.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.title}</TableCell>
              <TableCell>{request.approval_flow_types?.name}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{request.requested_by_name}</span>
                </div>
              </TableCell>
              <TableCell>
                {format(new Date(request.created_at), 'dd/MM/yyyy HH:mm', {
                  locale: ptBR,
                })}
              </TableCell>
              <TableCell>
                <Badge variant={priorityConfig[request.priority as keyof typeof priorityConfig]?.variant}>
                  {priorityConfig[request.priority as keyof typeof priorityConfig]?.label}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleViewDetails(request.id)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Revisar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};