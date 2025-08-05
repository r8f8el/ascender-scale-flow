
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, User, Clock, CheckCircle2 } from 'lucide-react';
import { TicketChat } from '@/components/ticket/TicketChat';
import { ChatHistoryByDay } from '@/components/ticket/ChatHistoryByDay';

interface TicketDetail {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  ticket_categories: { name: string };
  ticket_priorities: { name: string; color: string };
  ticket_statuses: { name: string; color: string; is_closed: boolean };
}

interface Response {
  id: string;
  message: string;
  created_at: string;
  is_internal_note: boolean;
  admin_id: string | null;
  user_id: string | null;
  admin_profiles?: { name: string };
}

const ClientTicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { client } = useAuth();
  const { logPageAccess, logUserAction } = useActivityLogger();
  const { toast } = useToast();
  
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (id && client) {
      loadTicketDetail();
      loadResponses();
      logPageAccess(`Detalhes do Chamado #${id}`);
    }
  }, [id, client]);

  const loadTicketDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          ticket_categories(name),
          ticket_priorities(name, color),
          ticket_statuses(name, color, is_closed)
        `)
        .eq('id', id)
        .eq('user_email', client?.email)
        .single();

      if (error) throw error;
      setTicket(data);
    } catch (error) {
      console.error('Erro ao carregar chamado:', error);
      toast({
        title: "Erro",
        description: "Chamado não encontrado ou você não tem permissão para visualizá-lo.",
        variant: "destructive",
      });
      navigate('/cliente/chamados');
    } finally {
      setIsLoading(false);
    }
  };

  const loadResponses = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_responses')
        .select(`
          *,
          admin_profiles(name)
        `)
        .eq('ticket_id', id)
        .eq('is_internal_note', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setResponses(data || []);
    } catch (error) {
      console.error('Erro ao carregar respostas:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !id) return;
    
    setIsSending(true);
    try {
      const { error } = await supabase
        .from('ticket_responses')
        .insert({
          ticket_id: id,
          message: newMessage.trim(),
          user_id: client?.id || null
        });

      if (error) throw error;

      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso.",
      });

      setNewMessage('');
      loadResponses();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Ocorreu um erro ao enviar sua mensagem.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleMarkAsResolved = async () => {
    if (!id) return;

    try {
      // Buscar o status "Resolvido"
      const { data: statusData } = await supabase
        .from('ticket_statuses')
        .select('id')
        .eq('name', 'Resolvido')
        .single();

      if (!statusData) throw new Error('Status não encontrado');

      const { error } = await supabase
        .from('tickets')
        .update({ 
          status_id: statusData.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Chamado marcado como resolvido",
        description: "Obrigado pelo feedback! O chamado foi marcado como resolvido.",
      });

      loadTicketDetail();
    } catch (error) {
      console.error('Erro ao marcar como resolvido:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o status do chamado.",
        variant: "destructive",
      });
    }
  };

  if (isLoading || !ticket) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando chamado...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/cliente/chamados')} className="mr-4">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Chamado #{ticket.ticket_number}
          </h1>
          <p className="text-gray-600">{ticket.title}</p>
        </div>
      </div>

      {/* Detalhes do Chamado */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{ticket.title}</CardTitle>
              <CardDescription className="mt-2">
                Categoria: {ticket.ticket_categories.name} • 
                Aberto em {new Date(ticket.created_at).toLocaleString('pt-BR')}
              </CardDescription>
            </div>
            <div className="flex gap-2">
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
              >
                {ticket.ticket_statuses.name}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-gray-800 mb-2">Descrição Inicial:</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
          </div>
          
          {!ticket.ticket_statuses.is_closed && (
            <Button onClick={handleMarkAsResolved} variant="outline" className="mt-4">
              <CheckCircle2 size={16} className="mr-2" />
              Marcar como Resolvido
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Chat em Tempo Real */}
      <div className="mb-6">
        <TicketChat 
          ticketId={ticket.id} 
          isTicketClosed={ticket.ticket_statuses.is_closed} 
        />
      </div>

      {/* Histórico de Conversas por Dia */}
      <div className="mb-6">
        <ChatHistoryByDay ticketId={ticket.id} />
      </div>
    </div>
  );
};

export default ClientTicketDetail;
