
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Plus, 
  Search,
  Clock,
  AlertCircle,
  CheckCircle,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClientTickets = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data for tickets
  const tickets = [
    {
      id: '1',
      number: 'TCK-001234',
      title: 'Problema no acesso ao sistema',
      description: 'Não consigo fazer login na plataforma há 2 dias',
      status: 'open',
      priority: 'high',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T14:30:00Z',
      responses_count: 3
    },
    {
      id: '2',
      number: 'TCK-001235',
      title: 'Solicitação de relatório personalizado',
      description: 'Preciso de um relatório específico para apresentação',
      status: 'in_progress',
      priority: 'medium',
      created_at: '2024-01-14T09:15:00Z',
      updated_at: '2024-01-15T16:45:00Z',
      responses_count: 5
    },
    {
      id: '3',
      number: 'TCK-001236',
      title: 'Dúvida sobre funcionalidade',
      description: 'Como posso exportar os dados em formato Excel?',
      status: 'closed',
      priority: 'low',
      created_at: '2024-01-13T14:20:00Z',
      updated_at: '2024-01-14T11:30:00Z',
      responses_count: 2
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Aberto';
      case 'in_progress':
        return 'Em Andamento';
      case 'closed':
        return 'Fechado';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    closed: tickets.filter(t => t.status === 'closed').length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Chamados</h1>
          <p className="text-gray-600 mt-1">
            Acompanhe o status dos seus chamados de suporte
          </p>
        </div>
        <Button onClick={() => navigate('/abrir-chamado')} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Chamado
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Abertos</p>
                <p className="text-2xl font-bold text-red-600">{stats.open}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.in_progress}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolvidos</p>
                <p className="text-2xl font-bold text-green-600">{stats.closed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por título ou número do chamado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                Todos
              </Button>
              <Button
                variant={filterStatus === 'open' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('open')}
                size="sm"
              >
                Abertos
              </Button>
              <Button
                variant={filterStatus === 'in_progress' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('in_progress')}
                size="sm"
              >
                Em Andamento
              </Button>
              <Button
                variant={filterStatus === 'closed' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('closed')}
                size="sm"
              >
                Fechados
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de chamados */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum chamado encontrado</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Tente ajustar os filtros de busca' : 'Você ainda não possui chamados registrados'}
              </p>
              {!searchTerm && (
                <Button onClick={() => navigate('/abrir-chamado')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Abrir Primeiro Chamado
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{ticket.title}</h3>
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(ticket.priority)}`}></div>
                    </div>
                    <p className="text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="font-mono">{ticket.number}</span>
                      <span>•</span>
                      <span>{new Date(ticket.created_at).toLocaleDateString('pt-BR')}</span>
                      <span>•</span>
                      <span>{ticket.responses_count} respostas</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <Badge className={getStatusColor(ticket.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(ticket.status)}
                        {getStatusLabel(ticket.status)}
                      </div>
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/cliente/chamados/${ticket.id}`)}
                    >
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

export default ClientTickets;
