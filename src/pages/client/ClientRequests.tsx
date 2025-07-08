import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { PlusCircle, Send, Calendar, CheckCircle, Clock } from 'lucide-react';

interface Request {
  id: string;
  title: string;
  description: string;
  status: string;
  response: string | null;
  created_at: string;
  updated_at: string;
}

const ClientRequests = () => {
  const { client, user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newRequest, setNewRequest] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, []);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar solicitações:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar solicitações",
          variant: "destructive"
        });
        return;
      }

      setRequests(data || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !user) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('requests')
        .insert({
          user_id: user.id,
          title,
          description,
          status: 'pending'
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Solicitação enviada",
        description: "Sua solicitação foi recebida. Entraremos em contato em breve.",
      });
      
      // Reset form
      setNewRequest(false);
      setTitle('');
      setDescription('');
      
      // Recarregar solicitações
      loadRequests();
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar solicitação",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="mr-1" />;
      case 'in_progress':
        return <Clock size={16} className="mr-1" />;
      case 'pending':
      default:
        return <Clock size={16} className="mr-1" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'in_progress':
        return 'Em andamento';
      case 'pending':
      default:
        return 'Pendente';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando solicitações...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Solicitações - {client?.name || user?.email}
          </h1>
          <p className="text-gray-600 mt-1">
            Envie novas solicitações ou acompanhe o status das existentes
          </p>
        </div>
        
        {!newRequest && (
          <Button 
            onClick={() => setNewRequest(true)}
            className="bg-[#f07c00] hover:bg-[#e56b00]"
          >
            <PlusCircle size={18} className="mr-2" />
            Nova Solicitação
          </Button>
        )}
      </div>
      
      {newRequest ? (
        <div className="bg-white rounded-lg border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Nova Solicitação</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título*
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Resumo da sua solicitação"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição*
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva detalhadamente sua solicitação..."
                rows={5}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setNewRequest(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-[#f07c00] hover:bg-[#e56b00]"
              >
                <Send size={18} className="mr-2" />
                {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {requests.length > 0 ? (
            <div className="space-y-6">
              {requests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg border overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-lg">{request.title}</h3>
                      <div className={`flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {getStatusLabel(request.status)}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mt-2">
                      <Calendar size={16} className="mr-1" />
                      <span>Enviado em {new Date(request.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    
                    <div className="mt-4 text-gray-700">
                      <p>{request.description}</p>
                    </div>
                    
                    {request.response && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium text-gray-800 mb-2">Resposta:</h4>
                        <p className="text-gray-700">{request.response}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-lg border">
              <p className="text-gray-500 mb-4">Nenhuma solicitação registrada ainda.</p>
              <Button 
                onClick={() => setNewRequest(true)}
                className="bg-[#f07c00] hover:bg-[#e56b00]"
              >
                <PlusCircle size={18} className="mr-2" />
                Criar Nova Solicitação
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClientRequests;