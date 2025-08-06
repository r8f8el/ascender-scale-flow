import React, { useState, useEffect } from 'react';
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
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  status_id: string;
  priority_id: string;
  category_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  created_at: string;
  updated_at: string;
  ticket_statuses?: { name: string; color: string; is_closed: boolean };
  ticket_priorities?: { name: string; color: string; level: number };
  ticket_categories?: { name: string; description: string };
  responses_count?: number;
}

const ClientTickets = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTickets();
    }
  }, [user]);

  const loadTickets = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          ticket_statuses:status_id(name, color, is_closed),
          ticket_priorities:priority_id(name, color, level),
          ticket_categories:category_id(name, description)
        `)
        .or(`user_id.eq.${user.id},user_email.eq.${user.email}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar chamados:', error);
        toast.error('Erro ao carregar seus chamados');
        return;
      }

      // Buscar contagem de respostas para cada ticket
      const ticketsWithResponses = await Promise.all(
        (data || []).map(async (ticket) => {
          const { count } = await supabase
            .from('ticket_responses')
            .select('*', { count: 'exact', head: true })
            .eq('ticket_id', ticket.id);
          
          return {
            ...ticket,
            responses_count: count || 0
          };
        })
      );

      setTickets(ticketsWithResponses);
    } catch (error) {
      console.error('Erro ao carregar chamados:', error);
      toast.error('Erro ao carregar chamados');
    } finally {
      setLoading(false);
    }
  };

  const handleNewTicket = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Navegando para abrir chamado...');
    navigate('/abrir-chamado');
  };

  const getStatusColor = (ticket: Ticket) => {
    if (ticket.ticket_statuses?.is_closed) {
      return 'bg-green-100 text-green-800';
    }
    return ticket.ticket_statuses?.color ? `bg-${ticket.ticket_statuses.color}-100 text-${ticket.ticket_statuses.color}-800` : 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (ticket: Ticket) => {
    if (ticket.ticket_statuses?.is_closed) {
      return <CheckCircle className="h-4 w-4" />;
    }
    return <AlertCircle className="h-4 w-4" />;
  };

  const getStatusLabel = (ticket: Ticket) => {
    return ticket.ticket_statuses?.name || 'Aberto';
  };

  const getPriorityColor = (ticket: Ticket) => {
    return ticket.ticket_priorities?.color || '#gray';
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'open' && !ticket.ticket_statuses?.is_closed) ||
                         (filterStatus === 'closed' && ticket.ticket_statuses?.is_closed);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => !t.ticket_statuses?.is_closed).length,
    closed: tickets.filter(t => t.ticket_statuses?.is_closed).length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando chamados...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Chamados</h1>
          <p className="text-gray-600 mt-1">
            Acompanhe o status dos seus chamados de suporte
          </p>
        </div>
        <Button 
          onClick={handleNewTicket}
          className="bg-[#f07c00] hover:bg-[#e56b00] text-white"
          type="button"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Chamado
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <Button 
                  onClick={handleNewTicket}
                  className="bg-[#f07c00] hover:bg-[#e56b00] text-white"
                  type="button"
                >
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
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: getPriorityColor(ticket) }}
                      ></div>
                    </div>
                    <p className="text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="font-mono">{ticket.ticket_number}</span>
                      <span>•</span>
                      <span>{new Date(ticket.created_at).toLocaleDateString('pt-BR')}</span>
                      <span>•</span>
                      <span>{ticket.responses_count || 0} respostas</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <Badge className={getStatusColor(ticket)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(ticket)}
                        {getStatusLabel(ticket)}
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
