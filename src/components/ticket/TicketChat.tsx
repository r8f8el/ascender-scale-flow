import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, User, Headphones, Paperclip, Download, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  message: string;
  created_at: string;
  is_internal_note: boolean;
  admin_id: string | null;
  user_id: string | null;
  admin_profiles?: { name: string };
  attachments?: Array<{
    id: string;
    filename: string;
    file_path: string;
    content_type: string;
    file_size: number;
  }>;
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
  const [attachments, setAttachments] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (ticketId) {
      loadMessages();
      setupRealtimeSubscription();
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      
      // Criar mensagens simples sem anexos por enquanto
      const simpleMessages: ChatMessage[] = (data || []).map(msg => ({
        id: msg.id,
        message: msg.message,
        created_at: msg.created_at,
        is_internal_note: msg.is_internal_note,
        admin_id: msg.admin_id,
        user_id: msg.user_id,
        admin_profiles: msg.admin_profiles,
        attachments: []
      }));
      
      setMessages(simpleMessages);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const setupRealtimeSubscription = () => {
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
      .subscribe();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && attachments.length === 0) || isSending || isTicketClosed) return;

    setIsSending(true);
    try {
      // Primeiro, inserir a mensagem
      const { data: responseData, error: responseError } = await supabase
        .from('ticket_responses')
        .insert({
          ticket_id: ticketId,
          message: newMessage.trim() || 'Anexo enviado',
          user_id: client?.id || user?.id || null,
          is_internal_note: false
        })
        .select()
        .single();

      if (responseError) throw responseError;

      // Se há anexos, fazer upload e salvar no banco
      if (attachments.length > 0) {
        for (const file of attachments) {
          const fileExtension = file.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExtension}`;
          const filePath = `chat_attachments/${ticketId}/${fileName}`;

          // Upload do arquivo
          const { error: uploadError } = await supabase.storage
            .from('ticket-attachments')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          // Salvar metadata do anexo
          const { error: attachmentError } = await supabase
            .from('ticket_attachments')
            .insert({
              ticket_id: ticketId,
              response_id: responseData.id,
              filename: file.name,
              file_path: filePath,
              content_type: file.type,
              file_size: file.size,
              uploaded_by: client?.id || user?.id || null
            });

          if (attachmentError) throw attachmentError;
        }
      }

      setNewMessage('');
      setAttachments([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
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

  const downloadAttachment = async (filePath: string, filename: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('ticket-attachments')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar anexo:', error);
      toast({
        title: "Erro ao baixar anexo",
        description: "Não foi possível baixar o arquivo.",
        variant: "destructive",
      });
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
                  
                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.attachments.map((attachment) => (
                        <div 
                          key={attachment.id}
                          className="flex items-center gap-2 p-2 rounded border bg-background/50"
                        >
                          <Paperclip size={14} />
                          <span className="text-xs flex-1 truncate">{attachment.filename}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => downloadAttachment(attachment.file_path, attachment.filename)}
                          >
                            <Download size={12} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
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

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="space-y-2 mb-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center gap-2 p-2 rounded border bg-muted/50">
                <Paperclip size={14} />
                <span className="text-xs flex-1 truncate">
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => removeAttachment(index)}
                >
                  <X size={12} />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Input Area */}
        {!isTicketClosed && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                disabled={isSending}
                className="flex-1"
              />
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isSending}
                size="sm"
                variant="outline"
              >
                <Paperclip size={16} />
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={(!newMessage.trim() && attachments.length === 0) || isSending}
                size="sm"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};