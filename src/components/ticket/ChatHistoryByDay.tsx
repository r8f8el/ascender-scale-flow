import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, MessageSquare, Clock, User, ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ChatMessage {
  id: string;
  message: string;
  created_at: string;
  user_id: string | null;
  admin_id: string | null;
  sender_name: string;
}

interface DayGroup {
  date: string;
  dateFormatted: string;
  messages: ChatMessage[];
  isOpen: boolean;
}

interface ChatHistoryByDayProps {
  ticketId: string;
}

export const ChatHistoryByDay: React.FC<ChatHistoryByDayProps> = ({ ticketId }) => {
  const [dayGroups, setDayGroups] = useState<DayGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChatHistory();
  }, [ticketId]);

  const loadChatHistory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ticket_responses')
        .select(`
          *,
          admin_profiles (
            name
          )
        `)
        .eq('ticket_id', ticketId)
        .eq('is_internal_note', false)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Agrupar mensagens por dia
      const groupedByDay: Record<string, ChatMessage[]> = {};
      
      (data || []).forEach(msg => {
        const messageDate = new Date(msg.created_at);
        const dateKey = messageDate.toDateString();
        
        if (!groupedByDay[dateKey]) {
          groupedByDay[dateKey] = [];
        }
        
        groupedByDay[dateKey].push({
          id: msg.id,
          message: msg.message,
          created_at: msg.created_at,
          user_id: msg.user_id,
          admin_id: msg.admin_id,
          sender_name: msg.admin_id 
            ? msg.admin_profiles?.name || 'Admin'
            : 'Você'
        });
      });

      // Converter para array de grupos ordenado por data (mais recente primeiro)
      const dayGroupsArray: DayGroup[] = Object.entries(groupedByDay)
        .map(([dateString, messages]) => {
          const date = new Date(dateString);
          return {
            date: dateString,
            dateFormatted: formatDateBrazilian(date),
            messages,
            isOpen: false // Por padrão, fechado
          };
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Abrir o dia mais recente por padrão
      if (dayGroupsArray.length > 0) {
        dayGroupsArray[0].isOpen = true;
      }

      setDayGroups(dayGroupsArray);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateBrazilian = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const formatMessageTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const toggleDay = (index: number) => {
    setDayGroups(prev => prev.map((group, i) => 
      i === index ? { ...group, isOpen: !group.isOpen } : group
    ));
  };

  const isMyMessage = (message: ChatMessage) => {
    return !message.admin_id && message.user_id;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando histórico...</p>
        </CardContent>
      </Card>
    );
  }

  if (dayGroups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Histórico de Conversas
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhuma conversa registrada ainda</p>
          <p className="text-sm text-muted-foreground mt-1">
            As conversas aparecerão aqui organizadas por dia
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Histórico de Conversas por Dia
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Clique em um dia para ver as conversas daquele período
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {dayGroups.map((dayGroup, index) => (
          <Collapsible
            key={dayGroup.date}
            open={dayGroup.isOpen}
            onOpenChange={() => toggleDay(index)}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-4 h-auto border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium capitalize">{dayGroup.dateFormatted}</p>
                    <p className="text-sm text-muted-foreground">
                      {dayGroup.messages.length} mensagem{dayGroup.messages.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {dayGroup.messages.length}
                  </Badge>
                  {dayGroup.isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-3">
              <div className="space-y-3 pl-4 border-l-2 border-muted ml-2">
                {dayGroup.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg border ${
                      isMyMessage(message)
                        ? 'bg-primary/5 border-primary/20 ml-8'
                        : 'bg-muted/50 border-muted mr-8'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {message.sender_name}
                        </span>
                        {isMyMessage(message) && (
                          <Badge variant="outline" className="text-xs">
                            Você
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatMessageTime(message.created_at)}
                      </div>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {message.message}
                    </p>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
};