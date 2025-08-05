import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Send, Paperclip, Download, X } from 'lucide-react';

interface ChatMessage {
  id: string;
  message: string;
  created_at: string;
  user_id: string | null;
  admin_id: string | null;
  sender_name: string;
  attachments: {
    id: string;
    filename: string;
    file_path: string;
    content_type: string | null;
    file_size: number | null;
  }[];
}

interface TicketChatProps {
  ticketId: string;
  isTicketClosed: boolean;
}

export const TicketChat: React.FC<TicketChatProps> = ({ ticketId, isTicketClosed }) => {
  const { user, client } = useAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [attachments, setAttachments] = useState<File[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    loadMessages();
    setupRealtimeSubscription();
  }, [ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ticket_responses')
        .select(`
          *,
          admin_profiles (
            name
          ),
          ticket_attachments (
            id,
            filename,
            file_path,
            content_type,
            file_size
          )
        `)
        .eq('ticket_id', ticketId)
        .eq('is_internal_note', false)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao carregar mensagens:', error);
        throw error;
      }

      const mappedMessages: ChatMessage[] = (data || []).map(msg => ({
        id: msg.id,
        message: msg.message,
        created_at: msg.created_at,
        user_id: msg.user_id,
        admin_id: msg.admin_id,
        sender_name: msg.admin_id 
          ? msg.admin_profiles?.name || 'Admin'
          : (client?.name || user?.user_metadata?.name || 'Você'),
        attachments: msg.ticket_attachments || []
      }));

      setMessages(mappedMessages);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`ticket_responses_${ticketId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'ticket_responses',
          filter: `ticket_id=eq.${ticketId}`
        }, 
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 3600);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const isMyMessage = (message: ChatMessage) => {
    return message.user_id === (client?.id || user?.id) && !message.admin_id;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando mensagens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-background border rounded-lg overflow-hidden">
      {/* Header do chat */}
      <div className="p-4 border-b border-border bg-muted/30 flex-shrink-0">
        <h3 className="font-semibold">Chat do Chamado</h3>
        <p className="text-sm text-muted-foreground">
          Converse com nossa equipe de suporte
        </p>
      </div>

      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground">
            <p>Nenhuma mensagem ainda.</p>
            <p className="text-sm">Envie uma mensagem para iniciar a conversa.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  isMyMessage(message)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">
                    {message.sender_name}
                  </span>
                </div>
                
                <p className="break-words">{message.message}</p>
                
                {/* Exibir anexos */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className={`flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-opacity-80 ${
                          isMyMessage(message)
                            ? 'bg-primary-foreground/10 border-primary-foreground/20'
                            : 'bg-muted border-muted-foreground/20'
                        }`}
                        onClick={() => downloadAttachment(attachment.file_path, attachment.filename)}
                      >
                        <Paperclip className="h-4 w-4" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{attachment.filename}</p>
                          {attachment.file_size && (
                            <p className="text-xs opacity-70">
                              {(attachment.file_size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          )}
                        </div>
                        <Download className="h-4 w-4" />
                      </div>
                    ))}
                  </div>
                )}
                
                <p className={`text-xs mt-2 ${
                  isMyMessage(message) 
                    ? 'text-primary-foreground/70' 
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

      {/* Input de mensagem */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="flex-1 min-h-[40px] max-h-32 resize-none"
            disabled={isTicketClosed || isSending}
          />
          <div className="flex flex-col gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
              disabled={isTicketClosed}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isTicketClosed}
              className="h-10 w-10"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={(!newMessage.trim() && attachments.length === 0) || isSending || isTicketClosed}
              className="h-10 w-10"
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Preview dos anexos */}
        {attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-sm font-medium">Anexos selecionados:</p>
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                <div className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttachment(index)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {isTicketClosed && (
          <p className="text-sm text-muted-foreground mt-2">
            Este chamado foi fechado e não aceita mais mensagens.
          </p>
        )}
      </div>
    </div>
  );
};