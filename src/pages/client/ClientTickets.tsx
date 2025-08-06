
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  Calendar,
  User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ClientTickets = () => {
  const { client } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  console.log('🎫 ClientTickets - Cliente:', client?.name);

  // Dados mockados de tickets
  const tickets = [
    {
      id: '1',
      ticket_number: 'TCK-001234',
      title: 'Problema no sistema de relatórios',
      description: 'Não consigo gerar os relatórios mensais',
      status: 'Em Andamento',
      priority: 'Alta',
      category: 'Técnico',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-16T14:20:00Z',
      responses_count: 3
    },
    {
      id: '2',
      ticket_number: 'TCK-001235',
      title: 'Solicitação de novo usuário',
      description: 'Preciso criar acesso para novo funcionário',
      status: 'Aberto',
      priority: 'Média',
      category: 'Administrativo',
      created_at: '2024-01-20T09:15:00Z',
      updated_at: '2024-01-20T09:15:00Z',
      responses_count: 1
    },
    {
      id: '3',
      ticket_number: 'TCK-001236',
      title: 'Dúvida sobre funcionalidade',
      description: 'Como configurar as notificações automáticas?',
      status: 'Resolvido',
      priority: 'Baixa',
      category: 'Suporte',
      created_at: '2024-01-10T16:45:00Z',
      updated_at: '2024-01-12T10:30:00Z',
      responses_count: 5
    }
  ];

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aberto':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700">Aberto</Badge>;
      case 'Em Andamento':
        return <Badge className="bg-yellow-100 text-yellow-700">Em Andamento</Badge>;
      case 'Resolvido':
        return <Badge className="bg-green-100 text-green-700">Resolvido</Badge>;
      case 'Fechado':
        return <Badge variant="outline" className="bg-gray-100 text-gray-700">Fechado</Badge>;
      default:
        return <Badge variant="outline">Indefinido</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Alta':
        return <Badge variant="destructive">Alta</Badge>;
      case 'Média':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700">Média</Badge>;
      case 'Baixa':
        return <Badge variant="outline" className="bg-green-100 text-green-700">Baixa</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Aberto':
        return <MessageSquare className="h-4 w-4" />;
      case 'Em Andamento':
        return <Clock className="h-4 w-4" />;
      case 'Resolvido':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleNewTicket = () => {
    navigate('/abrir-chamado');
  };

  const handleViewTicket = (ticketId: string) => {
    navigate(`/cliente/chamados/${ticketId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Chamados</h1>
          <p className="text-gray-600 mt-1">
            Acompanhe suas solicitações de suporte
          </p>
        </div>
        <Button onClick={handleNewTicket}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Chamado
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{tickets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold">
                  {tickets.filter(t => t.status === 'Em Andamento').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Resolvidos</p>
                <p className="text-2xl font-bold">
                  {tickets.filter(t => t.status === 'Resolvido').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Alta Prioridade</p>
                <p className="text-2xl font-bold">
                  {tickets.filter(t => t.priority === 'Alta').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar chamados..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="Aberto">Aberto</SelectItem>
                <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                <SelectItem value="Resolvido">Resolvido</SelectItem>
                <SelectItem value="Fechado">Fechado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Tickets */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum chamado encontrado</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Você ainda não tem chamados abertos'
                }
              </p>
              {(!searchTerm && statusFilter === 'all') && (
                <Button onClick={handleNewTicket}>
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
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getStatusIcon(ticket.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                        <span className="text-sm text-gray-500">#{ticket.ticket_number}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{ticket.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Criado em {formatDate(ticket.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {ticket.responses_count} respostas
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {ticket.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex gap-2">
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewTicket(ticket.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
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
