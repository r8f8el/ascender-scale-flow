
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Send, 
  Paperclip,
  Calendar,
  User,
  Users,
  Phone,
  Video,
  Loader2,
  FileText,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFPAClients } from '@/hooks/useFPAClients';
import { toast } from 'sonner';

const ClientFPACommunication = () => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: clients = [], isLoading: clientsLoading } = useFPAClients();
  
  const currentClient = clients.find(client => 
    client.client_profile?.id === user?.id
  );

  // Dados mock para comunicação
  const messages = [
    {
      id: '1',
      sender_type: 'admin',
      sender_name: 'Rafael Gontijo',
      sender_role: 'Consultor Senior FP&A',
      message: 'Olá! Finalizei a análise dos dados financeiros de Q1. Os resultados mostram uma melhoria significativa na margem EBITDA. Gostaria de agendar uma reunião para apresentar os insights detalhados?',
      created_at: '2024-01-15T10:30:00Z',
      context_type: 'analysis_complete',
      attachments: ['Relatório Q1 2024.pdf'],
      is_read: true
    },
    {
      id: '2',
      sender_type: 'client',
      sender_name: user?.user_metadata?.name || 'Cliente',
      message: 'Perfeito, Rafael! Sim, podemos agendar para esta semana? Tenho algumas dúvidas específicas sobre as variações no custo de produção.',
      created_at: '2024-01-15T14:15:00Z',
      context_type: 'meeting_request',
      is_read: true
    },
    {
      id: '3',
      sender_type: 'admin',
      sender_name: 'Daniel Ascalate',
      sender_role: 'Gerente de Projeto',
      message: 'Oi! Estou acompanhando o progresso do projeto. A implementação do dashboard está 80% concluída. Na próxima semana teremos a versão beta disponível para testes.',
      created_at: '2024-01-16T09:45:00Z',
      context_type: 'project_update',
      is_read: true
    },
    {
      id: '4',
      sender_type: 'admin',
      sender_name: 'Rafael Gontijo',
      sender_role: 'Consultor Senior FP&A',
      message: 'Consegui agendar nossa reunião para quinta-feira, 18/01, às 14h. Vou preparar uma apresentação focada nas suas dúvidas sobre custos. Te envio o link da videochamada até amanhã.',
      created_at: '2024-01-16T16:20:00Z',
      context_type: 'meeting_scheduled',
      is_read: false
    }
  ];

  // Equipe FP&A
  const team = [
    {
      id: '1',
      name: 'Rafael Gontijo',
      role: 'Consultor Senior FP&A',
      email: 'rafael.gontijo@ascalate.com.br',
      phone: '(11) 99999-0001',
      status: 'online',
      specialties: ['Análise Financeira', 'Modelagem', 'Cenários']
    },
    {
      id: '2',
      name: 'Daniel Ascalate',
      role: 'Gerente de Projeto',
      email: 'daniel@ascalate.com.br',
      phone: '(11) 99999-0002',
      status: 'busy',
      specialties: ['Gestão de Projetos', 'Estratégia']
    },
    {
      id: '3',
      name: 'Ana Silva',
      role: 'Analista de Dados',
      email: 'ana.silva@ascalate.com.br',
      phone: '(11) 99999-0003',
      status: 'online',
      specialties: ['Business Intelligence', 'Automação']
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-100 text-green-700">● Online</Badge>;
      case 'busy':
        return <Badge className="bg-yellow-100 text-yellow-700">● Ocupado</Badge>;
      case 'away':
        return <Badge className="bg-gray-100 text-gray-700">● Ausente</Badge>;
      default:
        return <Badge variant="outline">● Offline</Badge>;
    }
  };

  const getContextBadge = (contextType: string) => {
    switch (contextType) {
      case 'analysis_complete':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700">Análise</Badge>;
      case 'meeting_request':
        return <Badge variant="outline" className="bg-green-100 text-green-700">Reunião</Badge>;
      case 'project_update':
        return <Badge variant="outline" className="bg-purple-100 text-purple-700">Projeto</Badge>;
      case 'meeting_scheduled':
        return <Badge variant="outline" className="bg-orange-100 text-orange-700">Agendado</Badge>;
      default:
        return null;
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) {
      toast.error('Digite uma mensagem ou anexe um arquivo');
      return;
    }

    setIsSending(true);
    try {
      // Simular envio
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Mensagem enviada com sucesso!');
      setNewMessage('');
      setSelectedFile(null);
    } catch (error) {
      toast.error('Erro ao enviar mensagem');
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast.success(`Arquivo "${file.name}" selecionado`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (clientsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-600">Carregando comunicação...</p>
        </div>
      </div>
    );
  }

  if (!currentClient) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Configuração FP&A Necessária</h3>
        <p className="text-gray-600">
          Complete o onboarding FP&A para acessar a comunicação com sua equipe.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Comunicação FP&A</h1>
        <p className="text-gray-600 mt-1">
          Mantenha contato direto com sua equipe de análise financeira
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Principal */}
        <div className="lg:col-span-3">
          <Card className="h-[700px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversa com Equipe FP&A
                <Badge className="bg-green-100 text-green-700">
                  {team.filter(t => t.status === 'online').length} online
                </Badge>
              </CardTitle>
            </CardHeader>
            
            {/* Mensagens */}
            <CardContent className="flex-1 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex ${message.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${
                    message.sender_type === 'client' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  } rounded-lg p-4 shadow-sm`}>
                    <div className="flex items-center gap-2 mb-1">
                      {message.sender_type === 'admin' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Users className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium">{message.sender_name}</span>
                      {message.sender_role && (
                        <span className="text-xs opacity-75">({message.sender_role})</span>
                      )}
                      {getContextBadge(message.context_type)}
                      {!message.is_read && message.sender_type === 'admin' && (
                        <Badge variant="destructive" className="text-xs">Novo</Badge>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed">{message.message}</p>
                    
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-black bg-opacity-10 rounded text-xs">
                            <FileText className="h-3 w-3" />
                            <span>{attachment}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1 mt-2 text-xs opacity-75">
                      <Clock className="h-3 w-3" />
                      {formatDate(message.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>

            {/* Campo de Nova Mensagem */}
            <div className="p-4 border-t bg-gray-50">
              {selectedFile && (
                <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span>{selectedFile.name}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedFile(null)}
                      className="ml-auto"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Textarea
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 resize-none"
                  rows={2}
                />
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={handleSendMessage}
                    disabled={isSending || (!newMessage.trim() && !selectedFile)}
                    size="icon"
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Equipe Online */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Equipe FP&A</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {team.map(member => (
                <div key={member.id} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-gray-600">{member.role}</p>
                    </div>
                  </div>
                  {getStatusBadge(member.status)}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Video className="h-4 w-4 mr-2" />
                Agendar Reunião
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Ligar para Equipe
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Solicitar Relatório
              </Button>
            </CardContent>
          </Card>

          {/* Status do Projeto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status do Projeto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Fase Atual:</span>
                <Badge>Desenvolvimento Dashboard</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Progresso:</span>
                <span className="font-medium">80%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
              <p className="text-xs text-gray-600">
                Próxima entrega: Dashboard Beta (25/01)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientFPACommunication;
