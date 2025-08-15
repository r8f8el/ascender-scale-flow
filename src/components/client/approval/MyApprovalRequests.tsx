import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, DollarSign, Calendar, User } from 'lucide-react';

// Status configuration
const statusConfig = {
  draft: { label: 'Rascunho', variant: 'secondary' as const },
  pending: { label: 'Pendente', variant: 'secondary' as const },
  approved: { label: 'Aprovado', variant: 'default' as const },
  rejected: { label: 'Rejeitado', variant: 'destructive' as const },
  request_adjustment: { label: 'Requer Ajuste', variant: 'outline' as const },
};

// Priority configuration
const priorityConfig = {
  low: { label: 'Baixa', variant: 'secondary' as const },
  medium: { label: 'Média', variant: 'outline' as const },
  high: { label: 'Alta', variant: 'destructive' as const },
};

export const MyApprovalRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['my-approval-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('approval_requests')
        .select(`
          *,
          approval_flow_types (name),
          approval_steps!approval_steps_flow_type_id_fkey (
            step_name,
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
    if (request.status === 'approved' || request.status === 'rejected') {
      return '-';
    }
    
    const nextStep = request.approval_steps?.find(
      (step: any) => step.step_order === request.current_step
    );
    
    return nextStep?.approver_name || 'Sistema';
  };

  const handleViewDetails = (requestId: string) => {
    navigate(`/cliente/aprovacoes/${requestId}`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
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

  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhuma solicitação encontrada</h3>
        <p className="text-muted-foreground mb-4">
          Você ainda não criou nenhuma solicitação de aprovação.
        </p>
        <Button onClick={() => navigate('/cliente/aprovacoes')}>
          Criar Nova Solicitação
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Minhas Solicitações</h2>
          <p className="text-muted-foreground">
            Acompanhe o status de todas as suas solicitações de aprovação
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Total: {requests.length} solicitações
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Data de Submissão</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Próximo Aprovador</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                    <div>
                      <div className="font-medium">{request.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {request.approval_flow_types?.name}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span className="font-mono text-sm">
                      {request.amount ? formatCurrency(request.amount) : '-'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(request.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
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
                <TableCell>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{getNextApprover(request)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(request.id)}
                  >
                    Ver Detalhes
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