
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MessageCircle, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  ticket_categories: { name: string };
  ticket_priorities: { name: string; color: string };
  ticket_statuses: { name: string; color: string; is_closed: boolean };
}

const ClientTickets = () => {
  const { client, user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (client || user) {
      loadTickets();
    }
  }, []);

  const loadTickets = async () => {
    try {
      console.log('Carregando tickets para:', { client, user });
      setIsLoading(true);
      setError(null);
      
      // Se não há cliente nem usuário, não carrega nada
      if (!client && !user) {
        console.log('Nenhum usuário logado encontrado');
        setTickets([]);
        return;
      }

      const userEmail = client?.email || user?.email;
      
      if (!userEmail) {
        console.log('Email do usuário não encontrado');
        setTickets([]);
        return;
      }

      console.log('Buscando tickets para email:', userEmail);

      let query = supabase
        .from('tickets')
        .select(`
          *,
          ticket_categories(name),
          ticket_priorities(name, color),
          ticket_statuses(name, color, is_closed)
        `)
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao carregar chamados:', error);
        setError('Erro ao carregar chamados: ' + error.message);
        return;
      }
      
      console.log('Tickets carregados:', data);
      setTickets(data || []);
      
    } catch (error) {
      console.error('Erro inesperado ao carregar chamados:', error);
      setError('Erro inesperado ao carregar chamados');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: any) => {
    if (status.is_closed) {
      return <CheckCircle size={16} className="text-green-600" />;
    }
    if (status.name === 'Em Andamento') {
      return <Clock size={16} className="text-yellow-600" />;
    }
    return <AlertCircle size={16} className="text-blue-600" />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando seus chamados...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Meus Chamados
          </h1>
          <p className="text-gray-600 mt-1">
            Acompanhe o status dos seus chamados de suporte
          </p>
        </div>
        
        <Link to="/abrir-chamado">
          <Button className="bg-[#f07c00] hover:bg-[#e56b00]">
            <MessageCircle size={18} className="mr-2" />
            Novo Chamado
          </Button>
        </Link>
      </div>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum chamado encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              Você ainda não abriu nenhum chamado de suporte.
            </p>
            <Link to="/abrir-chamado">
              <Button className="bg-[#f07c00] hover:bg-[#e56b00]">
                Abrir Primeiro Chamado
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      #{ticket.ticket_number} - {ticket.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {ticket.ticket_categories.name} • Aberto em{' '}
                      {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      style={{ 
                        backgroundColor: ticket.ticket_priorities.color + '20',
                        color: ticket.ticket_priorities.color,
                        border: `1px solid ${ticket.ticket_priorities.color}40`
                      }}
                    >
                      {ticket.ticket_priorities.name}
                    </Badge>
                    <Badge
                      style={{ 
                        backgroundColor: ticket.ticket_statuses.color + '20',
                        color: ticket.ticket_statuses.color,
                        border: `1px solid ${ticket.ticket_statuses.color}40`
                      }}
                      className="flex items-center gap-1"
                    >
                      {getStatusIcon(ticket.ticket_statuses)}
                      {ticket.ticket_statuses.name}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 line-clamp-2">
                  {ticket.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Última atualização: {new Date(ticket.updated_at).toLocaleDateString('pt-BR')}
                  </span>
                  <Link to={`/cliente/chamados/${ticket.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye size={16} className="mr-2" />
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientTickets;
