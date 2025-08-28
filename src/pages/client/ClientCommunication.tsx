import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AvatarInitials } from '@/components/ui/avatar-initials';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Paperclip,
  Users,
  MessageCircle,
  Clock,
  CheckCheck,
  Smile,
  Phone,
  Video,
  MoreVertical,
  FileText,
  Image as ImageIcon,
  Mic
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/hooks/useChat';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_type: 'client' | 'admin';
  created_at: string;
  chat_room_id: string;
}

const ClientCommunication = () => {
  const { user, client } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    messages,
    currentRoom,
    loading,
    sendMessage,
    createOrFindRoom
  } = useChat();

  // Equipe Ascalate
  const ascalateTeam = [
    {
      id: 'rafael',
      name: 'Rafael Gontijo',
      role: 'Consultor Senior FP&A',
      avatar: 'RG',
      status: 'online',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      id: 'daniel',
      name: 'Daniel Ascalate',
      role: 'CEO & Fundador',
      avatar: 'DA',
      status: 'online',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    {
      id: 'ana',
      name: 'Ana Silva',
      role: 'Analista de Dados',
      avatar: 'AS',
      status: 'away',
      color: 'bg-gradient-to-br from-green-500 to-green-600'
    }
  ];

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat room on component mount
  useEffect(() => {
    if (user && client) {
      try {
        console.log('🔄 Initializing chat room for user:', user.id);
        createOrFindRoom();
      } catch (error) {
        console.error('❌ Error initializing chat room:', error);
      }
    }
  }, [user, client, createOrFindRoom]);

  // Handle send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentRoom) return;

    try {
      console.log('📤 Sending message:', newMessage.substring(0, 50));
      await sendMessage(newMessage, currentRoom);
      setNewMessage('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('❌ Error in handleSendMessage:', error);
      toast.error('Erro ao enviar mensagem');
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups: { [key: string]: Message[] }, message) => {
    const date = new Date(message.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white" />;
      case 'away':
        return <div className="w-3 h-3 bg-yellow-500 rounded-full border-2 border-white" />;
      case 'busy':
        return <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white" />;
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full border-2 border-white" />;
    }
  };

  if (loading && !currentRoom) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Iniciando conversa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Comunicação Ascalate
          </h1>
          <p className="text-muted-foreground mt-1">
            Converse diretamente com nossa equipe de especialistas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Phone className="h-4 w-4 mr-2" />
            Ligar
          </Button>
          <Button variant="outline" size="sm">
            <Video className="h-4 w-4 mr-2" />
            Videochamada
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col h-full">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="border-b bg-gradient-to-r from-background to-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">Equipe Ascalate</h3>
                    <p className="text-sm text-muted-foreground">
                      {ascalateTeam.filter(u => u.status === 'online').length} membros online
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="animate-pulse">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Ao vivo
                </Badge>
              </div>
            </CardHeader>

            {/* Messages Area */}
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[400px] lg:h-[500px] p-4">
                <div className="space-y-6">
                  {Object.entries(groupedMessages).map(([date, dayMessages]) => (
                    <div key={date} className="space-y-4">
                      {/* Date Divider */}
                      <div className="flex items-center justify-center">
                        <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                          {formatDate(dayMessages[0].created_at)}
                        </div>
                      </div>

                      {/* Messages for this date */}
                      {dayMessages.map((message, index) => (
                        <div 
                          key={message.id}
                          className={`flex gap-3 ${
                            message.sender_type === 'client' ? 'flex-row-reverse' : ''
                          } animate-fade-in-up`}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {message.sender_type === 'admin' && (
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className={
                                ascalateTeam.find(t => t.name.includes(message.sender_name.split(' ')[0]))?.color || 
                                'bg-gradient-to-br from-gray-500 to-gray-600'
                              }>
                                <AvatarInitials name={message.sender_name} />
                              </AvatarFallback>
                            </Avatar>
                          )}

                          <div className={`max-w-[70%] ${
                            message.sender_type === 'client' ? 'ml-12' : 'mr-12'
                          }`}>
                            <div className={`rounded-2xl px-4 py-3 ${
                              message.sender_type === 'client'
                                ? 'bg-primary text-primary-foreground ml-auto'
                                : 'bg-muted'
                            } hover-scale transition-all duration-200`}>
                              {message.sender_type === 'admin' && (
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                  {message.sender_name}
                                </p>
                              )}
                              <p className="text-sm leading-relaxed">{message.content}</p>
                              <div className={`flex items-center gap-1 mt-2 text-xs ${
                                message.sender_type === 'client' 
                                  ? 'text-primary-foreground/70 justify-end' 
                                  : 'text-muted-foreground'
                              }`}>
                                <Clock className="h-3 w-3" />
                                {formatTime(message.created_at)}
                                {message.sender_type === 'client' && (
                                  <CheckCheck className="h-3 w-3 ml-1" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex gap-3 animate-fade-in">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600">
                          <AvatarInitials name="Ascalate" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-2xl px-4 py-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>
            </CardContent>

            {/* Input Area */}
            <div className="border-t p-4 bg-muted/20">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pr-12 min-h-[44px] resize-none rounded-xl border-2 focus:border-primary transition-colors"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-transparent"
                    >
                      <Smile className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-[44px] w-[44px] rounded-xl"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-[44px] w-[44px] rounded-xl"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="h-[44px] w-[44px] rounded-xl hover-scale"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Team Members */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <h3 className="font-semibold">Equipe Online</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {ascalateTeam.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className={member.color}>
                        <AvatarInitials name={member.name} className="text-white" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1">
                      {getStatusBadge(member.status)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <h3 className="font-semibold">Ações Rápidas</h3>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                <FileText className="h-4 w-4" />
                Enviar Arquivo
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                <ImageIcon className="h-4 w-4" />
                Enviar Imagem
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                <Video className="h-4 w-4" />
                Agendar Reunião
              </Button>
            </CardContent>
          </Card>

          {/* Connection Status */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">Conectado</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientCommunication;