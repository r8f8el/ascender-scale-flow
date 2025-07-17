
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, X, Minimize2, Maximize2 } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { cn } from '@/lib/utils';

interface ChatProps {
  isAdmin?: boolean;
}

export const Chat: React.FC<ChatProps> = ({ isAdmin = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    rooms,
    currentRoom,
    loading,
    sending,
    loadMessages,
    sendMessage,
    createOrFindRoom,
    setCurrentRoom
  } = useChat(isAdmin);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRoomSelect = (roomId: string) => {
    loadMessages(roomId);
    if (isMinimized) setIsMinimized(false);
  };

  const handleStartChat = async () => {
    if (!isAdmin) {
      const roomId = await createOrFindRoom();
      if (roomId) {
        loadMessages(roomId);
        setIsOpen(true);
        setIsMinimized(false);
      }
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => isAdmin ? setIsOpen(true) : handleStartChat()}
        className="fixed bottom-4 right-4 z-50 rounded-full w-14 h-14 shadow-lg"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className={cn(
      "fixed bottom-4 right-4 z-50 shadow-xl border-2",
      isMinimized ? "w-80 h-16" : "w-96 h-[500px]"
    )}>
      <CardHeader className="p-3 bg-primary text-primary-foreground flex flex-row items-center justify-between">
        <CardTitle className="text-sm">
          {isAdmin ? 'Chat - Suporte' : 'Suporte Online'}
        </CardTitle>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-6 w-6 p-0 text-primary-foreground hover:bg-primary-foreground/20"
          >
            {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 p-0 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-[440px]">
          {isAdmin && (
            <div className="border-b p-3">
              <h4 className="text-sm font-medium mb-2">Salas de Chat</h4>
              <ScrollArea className="h-24">
                {rooms.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma conversa ativa</p>
                ) : (
                  <div className="space-y-1">
                    {rooms.map((room) => (
                      <Button
                        key={room.id}
                        variant={currentRoom === room.id ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handleRoomSelect(room.id)}
                        className="w-full justify-start text-xs h-8"
                      >
                        {room.client_name}
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {formatTime(room.last_message_at)}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          <ScrollArea className="flex-1 p-3">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {isAdmin ? 'Selecione uma conversa' : 'Inicie uma conversa!'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.sender_type === (isAdmin ? 'admin' : 'client') 
                        ? "justify-end" 
                        : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                        message.sender_type === (isAdmin ? 'admin' : 'client')
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <div className="font-medium text-xs mb-1">
                        {message.sender_name}
                      </div>
                      <div>{message.content}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {formatTime(message.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {(currentRoom || !isAdmin) && (
            <div className="border-t p-3">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  disabled={sending}
                  className="text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
