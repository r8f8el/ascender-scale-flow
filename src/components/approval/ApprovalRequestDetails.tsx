
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, MessageSquare, Calendar, DollarSign, User, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import type { ApprovalRequest, ApprovalHistory } from '@/types/approval';

interface ApprovalRequestDetailsProps {
  request: ApprovalRequest;
  history: ApprovalHistory[];
  onApprove: (requestId: string, comments?: string) => Promise<void>;
  onReject: (requestId: string, comments: string) => Promise<void>;
  canApprove?: boolean;
  loading: boolean;
}

export const ApprovalRequestDetails: React.FC<ApprovalRequestDetailsProps> = ({
  request,
  history,
  onApprove,
  onReject,
  canApprove = false,
  loading,
}) => {
  const [comments, setComments] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-700' },
      in_progress: { label: 'Em Andamento', className: 'bg-blue-100 text-blue-700' },
      approved: { label: 'Aprovado', className: 'bg-green-100 text-green-700' },
      rejected: { label: 'Rejeitado', className: 'bg-red-100 text-red-700' },
      cancelled: { label: 'Cancelado', className: 'bg-gray-100 text-gray-700' },
      expired: { label: 'Expirado', className: 'bg-orange-100 text-orange-700' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={config?.className || 'bg-gray-100 text-gray-700'}>{config?.label || status}</Badge>;
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'commented':
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprove(request.id, comments);
      setComments('');
    } catch (error) {
      toast.error('Erro ao aprovar solicitação');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!comments.trim()) {
      toast.error('Comentário é obrigatório para rejeição');
      return;
    }

    setIsRejecting(true);
    try {
      await onReject(request.id, comments);
      setComments('');
    } catch (error) {
      toast.error('Erro ao rejeitar solicitação');
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{request.title}</CardTitle>
              <p className="text-gray-600 mt-1">{request.flow_type?.name}</p>
            </div>
            <div className="flex gap-2">
              {getStatusBadge(request.status)}
              <Badge variant="outline">
                Etapa {request.current_step} de {request.total_steps || 1}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                Criado em {format(new Date(request.created_at), 'PPP', { locale: ptBR })}
              </span>
            </div>
            
            {request.amount && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(request.amount)}
                </span>
              </div>
            )}
            
            {request.due_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  Prazo: {format(new Date(request.due_date), 'PPP', { locale: ptBR })}
                </span>
              </div>
            )}
          </div>
          
          {request.description && (
            <div>
              <h4 className="font-medium mb-2">Descrição</h4>
              <p className="text-gray-700">{request.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detalhes da Solicitação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalhes da Solicitação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {request.department && (
              <div>
                <Label className="text-sm font-medium">Departamento</Label>
                <p className="text-gray-700">{request.department}</p>
              </div>
            )}
            
            {request.cost_center && (
              <div>
                <Label className="text-sm font-medium">Centro de Custo</Label>
                <p className="text-gray-700">{request.cost_center}</p>
              </div>
            )}
          </div>
          
          {request.business_justification && (
            <div>
              <Label className="text-sm font-medium">Justificativa de Negócio</Label>
              <p className="text-gray-700 mt-1">{request.business_justification}</p>
            </div>
          )}
          
          {request.expected_outcome && (
            <div>
              <Label className="text-sm font-medium">Resultado Esperado</Label>
              <p className="text-gray-700 mt-1">{request.expected_outcome}</p>
            </div>
          )}
          
          {request.risk_assessment && (
            <div>
              <Label className="text-sm font-medium">Avaliação de Riscos</Label>
              <p className="text-gray-700 mt-1">{request.risk_assessment}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico de Aprovações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum histórico disponível</p>
            ) : (
              history.map((item, index) => (
                <div key={item.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    {getActionIcon(item.action)}
                    {index < history.length - 1 && (
                      <div className="w-px h-8 bg-gray-200 mt-2" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {item.actor_name || 'Sistema'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.action === 'created' && 'Solicitação criada'}
                          {item.action === 'approved' && 'Aprovada'}
                          {item.action === 'rejected' && 'Rejeitada'}
                          {item.action === 'commented' && 'Comentário adicionado'}
                          {item.action === 'modified' && 'Modificada'}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {format(new Date(item.created_at), 'PPpp', { locale: ptBR })}
                      </span>
                    </div>
                    {item.comments && (
                      <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-2 rounded">
                        {item.comments}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ações de Aprovação */}
      {canApprove && request.status === 'pending' && (
        <Card>
          <CardHeader>
            <CardTitle>Ações de Aprovação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="comments">Comentários (opcional para aprovação, obrigatório para rejeição)</Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Adicione seus comentários..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleApprove}
                disabled={isApproving || isRejecting || loading}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                {isApproving ? 'Aprovando...' : 'Aprovar'}
              </Button>
              
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isApproving || isRejecting || loading}
                className="flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                {isRejecting ? 'Rejeitando...' : 'Rejeitar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
