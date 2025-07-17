
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Search, Filter, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ApprovalRequest, ApprovalStatus } from '@/types/approval';

interface ApprovalRequestListProps {
  requests: ApprovalRequest[];
  onViewDetails: (request: ApprovalRequest) => void;
  loading: boolean;
}

export const ApprovalRequestList: React.FC<ApprovalRequestListProps> = ({
  requests,
  onViewDetails,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'all'>('all');

  const getStatusBadge = (status: ApprovalStatus) => {
    const statusConfig = {
      pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-700' },
      in_progress: { label: 'Em Andamento', className: 'bg-blue-100 text-blue-700' },
      approved: { label: 'Aprovado', className: 'bg-green-100 text-green-700' },
      rejected: { label: 'Rejeitado', className: 'bg-red-100 text-red-700' },
      cancelled: { label: 'Cancelado', className: 'bg-gray-100 text-gray-700' },
      expired: { label: 'Expirado', className: 'bg-orange-100 text-orange-700' },
    };

    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { label: 'Baixa', className: 'bg-gray-100 text-gray-700' },
      normal: { label: 'Normal', className: 'bg-blue-100 text-blue-700' },
      high: { label: 'Alta', className: 'bg-yellow-100 text-yellow-700' },
      urgent: { label: 'Urgente', className: 'bg-red-100 text-red-700' },
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return <Badge className={config?.className || 'bg-gray-100 text-gray-700'}>{config?.label || priority}</Badge>;
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.flow_type?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-gray-500">Carregando solicitações...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por título, descrição ou tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ApprovalStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="expired">Expirado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Solicitações */}
      <div className="grid gap-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhuma solicitação encontrada</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg">{request.title}</h3>
                      <div className="flex gap-2">
                        {getStatusBadge(request.status)}
                        {getPriorityBadge(request.priority)}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm">{request.flow_type?.name}</p>
                    
                    {request.description && (
                      <p className="text-gray-700 line-clamp-2">{request.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(request.created_at), 'PPP', { locale: ptBR })}
                      </div>
                      
                      {request.amount && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(request.amount)}
                        </div>
                      )}
                      
                      {request.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Prazo: {format(new Date(request.due_date), 'PPP', { locale: ptBR })}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      Etapa {request.current_step} de {request.total_steps || 1}
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(request)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
