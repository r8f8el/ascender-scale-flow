import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Send, 
  Paperclip,
  Calendar,
  User,
  Users
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFPAClients } from '@/hooks/useFPAClients';
import { toast } from 'sonner';

const ClientFPACommunication = () => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const { data: clients = [], isLoading: clientsLoading } = useFPAClients();
  
  const currentClient = clients.find(client => {
    return client.client_profile && 
           typeof client.client_profile === 'object' && 
           'id' in client.client_profile && 
           client.client_profile.id === user?.id;
  });

  const messages = [
    {
      id: '1',
      sender_type: 'admin',
      sender_name: 'Rafael Gontijo',
      message: 'Olá! Recebi os dados financeiros de março. Vou começar a análise e retorno com o relatório em breve.',
      created_at: '2024-03-15T10:30:00Z',
      context_type: 'data_upload'
    },
    {
      id: '2',
      sender_type: 'client',
      sender_name: user?.email?.split('@')[0] || 'Cliente',
      message: 'Perfeito! Aguardo o retorno. Há alguma informação adicional que precisa?',
      created_at: '2024-03-15T11:15:00Z',
      context_type: 'general'
    },
    {
      id: '3',
      sender_type: 'admin',
      sender_name: 'Rafael Gontijo',
      message: 'Finalizei a análise preliminar. O relatório está disponível na aba de relatórios. Notei um crescimento interessante na receita!',
      created_at: '2024-03-16T09:45:00Z',
      context_type: 'report'
    }
  ];

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      toast.error('Digite uma mensagem');
      return;
    }

    setIsSending(true);
    try {
      // Simular envio de mensagem
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Mensagem enviada com sucesso!');
      setNewMessage('');
    } catch (error) {
      toast.error('Erro ao enviar mensagem');
    } finally {
      setIsSending(false);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Principal */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversa com Equipe FP&A
              </CardTitle>
            </CardHeader>
            
            {/* Mensagens */}
            <CardContent className="flex-1 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex ${message.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${
                    message.sender_type === 'client' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  } rounded-lg p-3`}>
                    <div className="flex items-center gap-2 mb-1">
                      {message.sender_type === 'admin' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Users className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium">{message.sender_name}</span>
                      {message.context_type && message.context_type !== 'general' && (
                        <Badge variant="secondary" className="text-xs">
                          {message.context_type === 'data_upload' ? 'Upload' : 
                           message.context_type === 'report' ? 'Relatório' : message.context_type}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">{message.message}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs opacity-75">
                      <Calendar className="h-3 w-3" />
                      {formatDate(message.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>

            {/* Campo de Nova Mensagem */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 resize-none"
                  rows={2}
                />
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="icon">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={handleSendMessage}
                    disabled={isSending || !newMessage.trim()}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar de Informações */}
        <div className="space-y-6">
          {/* Status do Projeto */}
          <Card>
            <CardHeader>
              <CardTitle>Status do Projeto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Fase Atual:</span>
                <Badge>Análise de Cenários</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Progresso:</span>
                <span className="font-medium">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </CardContent>
          </Card>

          {/* Equipe Responsável */}
          <Card>
            <CardHeader>
              <CardTitle>Equipe FP&A</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  RG
                </div>
                <div>
                  <p className="font-medium text-sm">Rafael Gontijo</p>
                  <p className="text-xs text-gray-600">Analista Senior</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  DA
                </div>
                <div>
                  <p className="font-medium text-sm">Daniel Ascalate</p>
                  <p className="text-xs text-gray-600">Supervisor</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Próximas Ações */}
          <Card>
            <CardHeader>
              <CardTitle>Próximas Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium">Reunião de Revisão</p>
                <p className="text-xs text-gray-600">Agendada para 20/03</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium">Enviar Dados Q1</p>
                <p className="text-xs text-gray-600">Prazo: 25/03</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientFPACommunication;
