import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

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

export const MyApprovalRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['my-approval-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('approval_requests')
        .select(`
          *,
          approval_flow_types (name),
          approval_steps!inner (
            step_order,
            approver_name,
            approver_email
          )
        `)
        .eq('requested_by_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const getNextApprover = (request: any) => {
    if (request.status !== 'pending') return '-';
    
    const currentStepApprovers = request.approval_steps?.filter(
      (step: any) => step.step_order === request.current_step
    );
    
    return currentStepApprovers?.[0]?.approver_name || 'N/A';
  };

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

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Você ainda não possui solicitações de aprovação.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Data de Submissão</TableHead>
            <TableHead>Status Atual</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Próximo Aprovador</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.title}</TableCell>
              <TableCell>{request.approval_flow_types?.name}</TableCell>
              <TableCell>
                {format(new Date(request.created_at), 'dd/MM/yyyy HH:mm', {
                  locale: ptBR,
                })}
              </TableCell>
              <TableCell>
                <Badge variant={statusConfig[request.status as keyof typeof statusConfig]?.variant}>
                  {statusConfig[request.status as keyof typeof statusConfig]?.label}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={priorityConfig[request.priority as keyof typeof priorityConfig]?.variant}>
                  {priorityConfig[request.priority as keyof typeof priorityConfig]?.label}
                </Badge>
              </TableCell>
              <TableCell>{getNextApprover(request)}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewDetails(request.id)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalhes
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};