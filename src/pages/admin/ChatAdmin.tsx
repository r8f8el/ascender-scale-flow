import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AvatarInitials } from '@/components/ui/avatar-initials';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  MessageCircle,
  Clock,
  CheckCheck,
  Users,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from 'sonner';

interface ChatRoom {
  id: string;
  client_id: string;
  client_name: string;
  created_at: string;
  last_message_at: string;
}

const ChatAdmin = () => {
  const { user, admin, isAdminAuthenticated } = useAdminAuth();
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  console.log('👨‍💼 ChatAdmin - Admin authenticated:', isAdminAuthenticated, 'User:', user?.id, 'Admin:', admin?.email);

  // Use chat hook as admin with proper authentication check
  const { 
    messages, 
    rooms,
    currentRoom, 
    loading,
    sending,
    sendMessage,
    loadMessages,
    setCurrentRoom
  } = useChat(true);

  // Filter rooms based on search
  const filteredRooms = rooms.filter(room =>
    room.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle room selection
  const handleRoomSelect = async (roomId: string) => {
    setSelectedRoom(roomId);
    setCurrentRoom(roomId);
    await loadMessages(roomId);
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending || !selectedRoom) return;

    try {
      const success = await sendMessage(newMessage.trim(), selectedRoom);
      
      if (success) {
        setNewMessage('');
        inputRef.current?.focus();
        toast.success('Mensagem enviada!');
      } else {
        toast.error('Erro ao enviar mensagem');
      }
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

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Format timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return formatDate(timestamp);
  };

  // Show loading/error states for admin authentication
  if (!isAdminAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Acesso Restrito</h3>
          <p className="text-muted-foreground">Apenas administradores podem acessar esta área.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Sidebar with chat rooms */}
      <div className="w-1/3 min-w-[300px] flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Conversas
              </CardTitle>
              <Badge variant="secondary">
                {rooms.length}
              </Badge>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredRooms.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => handleRoomSelect(room.id)}
                      className={`flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                        selectedRoom === room.id ? 'bg-muted border-l-4 border-primary' : ''
                      }`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                          <AvatarInitials name={room.client_name} />
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium truncate">{room.client_name}</h4>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(room.last_message_at)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Última atividade: {formatDate(room.last_message_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col">
          {selectedRoom ? (
            <>
              <CardHeader className="border-b bg-gradient-to-r from-background to-muted/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <AvatarInitials name={
                          rooms.find(r => r.id === selectedRoom)?.client_name || 'Cliente'
                        } />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {rooms.find(r => r.id === selectedRoom)?.client_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Conversa ativa
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="animate-pulse">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Online
                  </Badge>
                </div>
              </CardHeader>

              {/* Messages Area */}
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[400px] p-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-32">
                        <p className="text-muted-foreground">Nenhuma mensagem ainda. Inicie a conversa!</p>
                      </div>
                    ) : (
                      messages.map((message, index) => (
                        <div 
                          key={message.id}
                          className={`flex gap-3 ${
                            message.sender_type === 'admin' ? 'flex-row-reverse' : ''
                          } animate-fade-in-up`}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {message.sender_type === 'client' && (
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white">
                                <AvatarInitials name={message.sender_name} />
                              </AvatarFallback>
                            </Avatar>
                          )}

                          <div className={`max-w-[70%] ${
                            message.sender_type === 'admin' ? 'ml-12' : 'mr-12'
                          }`}>
                            <div className={`rounded-2xl px-4 py-3 ${
                              message.sender_type === 'admin'
                                ? 'bg-primary text-primary-foreground ml-auto'
                                : 'bg-muted'
                            } hover-scale transition-all duration-200`}>
                              {message.sender_type === 'client' && (
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                  {message.sender_name}
                                </p>
                              )}
                              <p className="text-sm leading-relaxed">{message.content}</p>
                              <div className={`flex items-center gap-1 mt-2 text-xs ${
                                message.sender_type === 'admin' 
                                  ? 'text-primary-foreground/70 justify-end' 
                                  : 'text-muted-foreground'
                              }`}>
                                <Clock className="h-3 w-3" />
                                {formatTime(message.created_at)}
                                {message.sender_type === 'admin' && (
                                  <CheckCheck className="h-3 w-3 ml-1" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>
              </CardContent>

              {/* Input Area */}
              <div className="border-t p-4 bg-muted/20">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Input
                      ref={inputRef}
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="min-h-[44px] resize-none rounded-xl border-2 focus:border-primary transition-colors"
                    />
                  </div>
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="h-[44px] w-[44px] rounded-xl hover-scale"
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Selecione uma conversa</h3>
                <p>Escolha um cliente da lista para visualizar as mensagens</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ChatAdmin;