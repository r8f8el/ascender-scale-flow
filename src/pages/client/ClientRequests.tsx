
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { PlusCircle, FileUp, Send, Calendar, CheckCircle, Clock } from 'lucide-react';

// Mock requests data
const mockRequests = [
  { 
    id: '1',
    title: 'Solicitação de análise financeira adicional',
    date: '2023-12-01',
    status: 'Concluído',
    description: 'Necessitamos de uma análise mais detalhada do fluxo de caixa para o próximo trimestre.',
    response: 'Análise entregue conforme solicitado. Os arquivos foram disponibilizados na pasta "Relatórios Financeiros".'
  },
  { 
    id: '2',
    title: 'Agendamento de reunião de alinhamento',
    date: '2023-12-10',
    status: 'Em andamento',
    description: 'Gostaríamos de agendar uma reunião para discutir os resultados preliminares da consultoria.',
    response: null
  },
];

const ClientRequests = () => {
  const { client } = useAuth();
  const { toast } = useToast();
  const [newRequest, setNewRequest] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would send the request to the server
    toast({
      title: "Solicitação enviada",
      description: "Sua solicitação foi recebida. Entraremos em contato em breve.",
    });
    
    // Reset form
    setNewRequest(false);
    setTitle('');
    setDescription('');
    setFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Solicitações - {client?.name}
          </h1>
          <p className="text-gray-600 mt-1">
            Envie novas solicitações ou acompanhe o status das existentes
          </p>
        </div>
        
        {!newRequest && (
          <Button onClick={() => setNewRequest(true)}>
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
              />
            </div>
            
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
                Anexo (opcional)
              </label>
              <div className="mt-1 flex items-center">
                <label className="block w-full">
                  <span className="sr-only">Escolher arquivo</span>
                  <input
                    id="file"
                    type="file"
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4 file:rounded-md
                      file:border-0 file:text-sm file:font-medium
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              {file && (
                <p className="text-sm text-gray-500 mt-2 flex items-center">
                  <FileUp size={16} className="mr-1" />
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={() => setNewRequest(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                <Send size={18} className="mr-2" />
                Enviar Solicitação
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {mockRequests.length > 0 ? (
            <div className="space-y-6">
              {mockRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg border overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-lg">{request.title}</h3>
                      <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
                        request.status === 'Concluído' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.status === 'Concluído' ? (
                          <CheckCircle size={16} className="mr-1" />
                        ) : (
                          <Clock size={16} className="mr-1" />
                        )}
                        {request.status}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mt-2">
                      <Calendar size={16} className="mr-1" />
                      <span>Enviado em {request.date}</span>
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
              <Button onClick={() => setNewRequest(true)}>
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
