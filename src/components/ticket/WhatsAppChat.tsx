import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarContent, AvatarFallback } from '@/components/ui/avatar';
import { Send, Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Message {
  id: string;
  message: string;
  created_at: string;
  user_id: string | null;
  admin_id: string | null;
  is_internal_note: boolean;
  admin_profiles?: {
    name: string;
  };
}

interface WhatsAppChatProps {
  ticketId: string;
  ticketTitle: string;
  onBack: () => void;
}

const WhatsAppChat: React.FC<WhatsAppChatProps> = ({ ticketId, ticketTitle, onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadMessages();
    
    // Configurar realtime
    const channel = supabase
      .channel(`ticket-responses-${ticketId}`)
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
          loadMessages(); // Recarrega as mensagens para pegar os joins
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_responses')
        .select(`
          *,
          admin_profiles(name)
        `)
        .eq('ticket_id', ticketId)
        .eq('is_internal_note', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('ticket_responses')
        .insert({
          ticket_id: ticketId,
          message: newMessage.trim(),
          user_id: user?.id,
          is_internal_note: false
        });

      if (error) throw error;

      setNewMessage('');
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ptBR
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Carregando conversa...</div>
      </div>
    );
  }

  return (
    <div className="h-[600px] bg-gradient-to-b from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg overflow-hidden shadow-xl border border-green-200 dark:border-green-800">
      {/* Header estilo WhatsApp */}
      <div className="bg-green-600 dark:bg-green-700 text-white p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white hover:bg-green-700 dark:hover:bg-green-600 p-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarContent className="bg-green-500 text-white">
              <span className="text-sm font-medium">SP</span>
            </AvatarContent>
            <AvatarFallback>SP</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-sm">Suporte Técnico</h3>
            <p className="text-xs text-green-100">{ticketTitle}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-white hover:bg-green-700 dark:hover:bg-green-600 p-2">
            <Phone size={18} />
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-green-700 dark:hover:bg-green-600 p-2">
            <Video size={18} />
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-green-700 dark:hover:bg-green-600 p-2">
            <MoreVertical size={18} />
          </Button>
        </div>
      </div>

      {/* Área de mensagens */}
      <div className="flex-1 h-[480px] overflow-y-auto p-4 space-y-3 bg-[url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="chat-bg" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23chat-bg)"/></svg>')] bg-green-50 dark:bg-green-950">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>Nenhuma mensagem ainda</p>
            <p className="text-sm">Comece a conversa!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isFromUser = message.user_id === user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isFromUser ? 'justify-end' : 'justify-start'} mb-3`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-md ${
                    isFromUser
                      ? 'bg-green-500 text-white rounded-br-none'
                      : 'bg-white dark:bg-gray-800 text-foreground rounded-bl-none border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {!isFromUser && message.admin_profiles && (
                    <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                      {message.admin_profiles.name}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed break-words">
                    {message.message}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      isFromUser
                        ? 'text-green-100'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensagem */}
      <div className="bg-white dark:bg-gray-900 p-4 border-t border-green-200 dark:border-green-800">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite uma mensagem..."
              disabled={isSending}
              className="rounded-full border-gray-300 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400 pr-12 py-3 text-sm resize-none"
              style={{ minHeight: '44px' }}
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
            className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-full w-12 h-12 p-0 shadow-lg"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppChat;