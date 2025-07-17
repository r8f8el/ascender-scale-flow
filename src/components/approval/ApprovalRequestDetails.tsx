
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, User, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ApprovalRequest, ApprovalHistory } from '@/types/approval';
import { useApprovalFlow } from '@/hooks/useApprovalFlow';
import { useAuth } from '@/contexts/AuthContext';

interface ApprovalRequestDetailsProps {
  request: ApprovalRequest;
  onClose: () => void;
  onUpdate: () => void;
}

export function ApprovalRequestDetails({
  request,
  onClose,
  onUpdate,
}: ApprovalRequestDetailsProps) {
  const { updateRequestStatus, fetchRequestHistory } = useApprovalFlow();
  const { user } = useAuth();
  const [history, setHistory] = useState<ApprovalHistory[]>([]);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      const historyData = await fetchRequestHistory(request.id);
      setHistory(historyData);
    };
    loadHistory();
  }, [request.id, fetchRequestHistory]);

  const handleAction = async (action: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      const success = await updateRequestStatus(request.id, action, comments);
      if (success) {
        onUpdate();
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canApprove = request.status === 'pending' && user?.id !== request.requested_by_user_id;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{request.title}</CardTitle>
              <CardDescription>
                {request.flow_type?.name} • Criado em {format(new Date(request.created_at), 'dd/MM/yyyy às HH:mm', { locale: ptBR })}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(request.status)}>
              {getStatusIcon(request.status)}
              <span className="ml-1">
                {request.status === 'pending' ? 'Pendente' :
                 request.status === 'approved' ? 'Aprovado' :
                 request.status === 'rejected' ? 'Rejeitado' : request.status}
              </span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {request.description && (
            <div>
              <h3 className="font-semibold mb-2">Descrição</h3>
              <p className="text-gray-700">{request.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Solicitante</p>
                <p className="font-medium">{request.requested_by_name}</p>
              </div>
            </div>

            {request.amount && (
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Valor</p>
                  <p className="font-medium">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(request.amount)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Prioridade</p>
                <p className="font-medium">
                  {request.priority === 'urgent' ? 'Urgente' : 
                   request.priority === 'high' ? 'Alta' :
                   request.priority === 'medium' ? 'Média' : 'Baixa'}
                </p>
              </div>
            </div>
          </div>

          {canApprove && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold">Ações de Aprovação</h3>
              <div className="space-y-2">
                <Label htmlFor="comments">Comentários (opcional)</Label>
                <Textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Adicione comentários sobre sua decisão..."
                  rows={3}
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleAction('approved')}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprovar
                </Button>
                <Button
                  onClick={() => handleAction('rejected')}
                  disabled={loading}
                  variant="destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeitar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Aprovação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-1 rounded-full ${
                    item.action === 'approved' ? 'bg-green-100' :
                    item.action === 'rejected' ? 'bg-red-100' : 'bg-blue-100'
                  }`}>
                    {item.action === 'approved' ? 
                      <CheckCircle className="h-4 w-4 text-green-600" /> :
                      item.action === 'rejected' ?
                      <XCircle className="h-4 w-4 text-red-600" /> :
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                    }
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{item.approver_name}</p>
                        <p className="text-sm text-gray-500">
                          {item.action === 'approved' ? 'Aprovou' :
                           item.action === 'rejected' ? 'Rejeitou' : 'Comentou em'} •{' '}
                          {format(new Date(item.created_at), 'dd/MM/yyyy às HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    {item.comments && (
                      <p className="text-gray-700 mt-2">{item.comments}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
