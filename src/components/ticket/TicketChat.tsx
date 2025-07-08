import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, User, Headphones } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  message: string;
  created_at: string;
  is_internal_note: boolean;
  admin_id: string | null;
  user_id: string | null;
  admin_profiles?: { name: string };
}

interface TicketChatProps {
  ticketId: string;
  isTicketClosed: boolean;
}

export const TicketChat: React.FC<TicketChatProps> = ({ ticketId, isTicketClosed }) => {
  const { client, user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    console.log('TicketChat useEffect executado:', { ticketId, client, user });
    if (ticketId) {
      loadMessages();
      setupRealtimeSubscription();
    }

    return () => {
      if (channelRef.current) {
        console.log('Removendo canal de realtime:', channelRef.current);
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      console.log('Carregando mensagens para ticket:', ticketId);
      const { data, error } = await supabase
        .from('ticket_responses')
        .select(`
          *,
          admin_profiles(name)
        `)
        .eq('ticket_id', ticketId)
        .eq('is_internal_note', false)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro na query:', error);
        throw error;
      }
      console.log('Mensagens carregadas:', data);
      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    console.log('Configurando subscription realtime para ticket:', ticketId);
    channelRef.current = supabase
      .channel(`ticket_chat_${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_responses',
          filter: `ticket_id=eq.${ticketId}`
        },
        (payload) => {
          console.log('Nova mensagem recebida:', payload);
          // Recarregar mensagens para obter dados completos
          loadMessages();
        }
      )
      .subscribe((status) => {
        console.log('Status da subscription:', status);
      });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending || isTicketClosed) return;

    console.log('Enviando mensagem:', { 
      ticketId, 
      message: newMessage.trim(), 
      userId: client?.id || user?.id 
    });

    setIsSending(true);
    try {
      // Verificar primeiro se o usuário tem acesso ao ticket
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select('id')
        .eq('id', ticketId)
        .single();

      if (ticketError || !ticketData) {
        throw new Error('Ticket não encontrado ou sem permissão');
      }

      const { error } = await supabase
        .from('ticket_responses')
        .insert({
          ticket_id: ticketId,
          message: newMessage.trim(),
          user_id: client?.id || user?.id || null,
          is_internal_note: false
        });

      if (error) {
        console.error('Erro ao inserir mensagem:', error);
        throw error;
      }

      console.log('Mensagem enviada com sucesso');
      setNewMessage('');
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso.",
      });
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isMyMessage = (message: ChatMessage) => {
    return message.user_id === (client?.id || user?.id);
  };

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Headphones size={20} />
          Chat em Tempo Real
        </CardTitle>
        {isTicketClosed && (
          <p className="text-sm text-muted-foreground">
            Chat desabilitado - Chamado foi fechado
          </p>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-3 min-h-0">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Nenhuma mensagem ainda. Inicie a conversa!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  isMyMessage(message) ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    isMyMessage(message)
                      ? 'bg-blue text-blue-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User size={14} />
                    <span className="font-medium text-sm">
                      {isMyMessage(message) 
                        ? 'Você' 
                        : message.admin_profiles?.name || 'Suporte'
                      }
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                  <p className={`text-xs mt-2 ${
                    isMyMessage(message) 
                      ? 'text-blue-foreground/70' 
                      : 'text-muted-foreground'
                  }`}>
                    {formatMessageTime(message.created_at)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {!isTicketClosed && (
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              disabled={isSending}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
              size="sm"
            >
              <Send size={16} />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};