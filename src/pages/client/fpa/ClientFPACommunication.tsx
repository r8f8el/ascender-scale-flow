
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  MessageSquare, 
  Send, 
  Paperclip,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  FileText,
  Video,
  Phone
} from 'lucide-react';

const ClientFPACommunication = () => {
  const [newMessage, setNewMessage] = useState('');

  // Mock conversations data
  const conversations = [
    {
      id: 1,
      consultant: "Ana Silva",
      subject: "Revisão do Modelo Financeiro Q1",
      lastMessage: "Ótimo! Os direcionadores estão bem alinhados com a estratégia. Podemos agendar uma reunião para discutir os cenários?",
      timestamp: "2024-03-20T10:30:00",
      status: "active",
      unread: 2,
      priority: "high"
    },
    {
      id: 2,
      consultant: "Carlos Mendes",
      subject: "Análise de Variação - Março 2024",
      lastMessage: "Identifiquei algumas variações importantes nos custos operacionais. Vou preparar um relatório detalhado.",
      timestamp: "2024-03-19T15:45:00",
      status: "pending",
      unread: 0,
      priority: "medium"
    },
    {
      id: 3,
      consultant: "Ana Silva",
      subject: "Upload de Dados - Pendência",
      lastMessage: "Recebi os dados do balancete. Faltam apenas os dados de vendas por produto para completar a análise.",
      timestamp: "2024-03-18T09:15:00",
      status: "waiting",
      unread: 1,
      priority: "high"
    }
  ];

  const selectedConversation = conversations[0];

  // Mock messages
  const messages = [
    {
      id: 1,
      sender: "Ana Silva",
      senderType: "consultant",
      message: "Bom dia! Finalizei a revisão do modelo financeiro do Q1. Os direcionadores de vendas estão bem alinhados com a estratégia atual.",
      timestamp: "2024-03-20T09:00:00",
      attachments: []
    },
    {
      id: 2,
      sender: "Você",
      senderType: "client",
      message: "Perfeito, Ana! Gostaria de entender melhor o impacto dos novos cenários de marketing que discutimos.",
      timestamp: "2024-03-20T09:15:00",
      attachments: []
    },
    {
      id: 3,
      sender: "Ana Silva",
      senderType: "consultant",
      message: "Claro! Preparei uma simulação com 3 cenários diferentes. O cenário otimista mostra um ROI de 4.2x no investimento em marketing digital.",
      timestamp: "2024-03-20T09:30:00",
      attachments: [
        { name: "Cenarios_Marketing_Q2.xlsx", type: "excel" }
      ]
    },
    {
      id: 4,
      sender: "Ana Silva",
      senderType: "consultant",
      message: "Ótimo! Os direcionadores estão bem alinhados com a estratégia. Podemos agendar uma reunião para discutir os cenários?",
      timestamp: "2024-03-20T10:30:00",
      attachments: []
    }
  ];

  const upcomingMeetings = [
    {
      id: 1,
      title: "Revisão Mensal - Performance Março",
      consultant: "Ana Silva",
      date: "2024-03-25T14:00:00",
      duration: "60 min",
      type: "video",
      status: "confirmed"
    },
    {
      id: 2,
      title: "Análise de Cenários Q2",
      consultant: "Carlos Mendes",
      date: "2024-03-28T10:00:00",
      duration: "45 min",
      type: "phone",
      status: "pending"
    }
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive">Alta</Badge>;
      case 'medium': return <Badge className="bg-yellow-100 text-yellow-700">Média</Badge>;
      case 'low': return <Badge variant="outline">Baixa</Badge>;
      default: return <Badge variant="outline">Normal</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'waiting': return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Comunicação Segura</h1>
          <p className="text-gray-600 mt-1">
            Canal direto de comunicação com seus consultores FP&A
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Nova Conversa
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conversas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      conversation.id === selectedConversation.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-sm">{conversation.consultant}</span>
                      </div>
                      {conversation.unread > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {conversation.unread}
                        </Badge>
                      )}
                    </div>
                    
                    <h4 className="font-medium text-sm text-gray-900 mb-1">
                      {conversation.subject}
                    </h4>
                    
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {conversation.lastMessage}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatDate(conversation.timestamp)}
                      </span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(conversation.status)}
                        {getPriorityBadge(conversation.priority)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Meetings */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximas Reuniões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{meeting.title}</h4>
                      {meeting.type === 'video' ? (
                        <Video className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Phone className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Com: {meeting.consultant}</div>
                      <div>{formatDate(meeting.date)}</div>
                      <div>Duração: {meeting.duration}</div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      {meeting.status === 'confirmed' ? 'Entrar' : 'Confirmar'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            {/* Chat Header */}
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{selectedConversation.subject}</CardTitle>
                  <p className="text-sm text-gray-600">
                    Conversa com {selectedConversation.consultant}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getPriorityBadge(selectedConversation.priority)}
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Video className="h-4 w-4" />
                    Videochamada
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderType === 'client' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.senderType === 'client'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{message.sender}</span>
                        <span className="text-xs opacity-70">
                          {formatDate(message.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-sm">{message.message}</p>
                      
                      {message.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.attachments.map((attachment, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 bg-black bg-opacity-10 rounded text-xs"
                            >
                              <FileText className="h-3 w-3" />
                              <span>{attachment.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 min-h-[60px]"
                  />
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="icon">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button className="flex items-center gap-1">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Pressione Enter para enviar</span>
                  <span>•</span>
                  <span>Shift + Enter para nova linha</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientFPACommunication;
