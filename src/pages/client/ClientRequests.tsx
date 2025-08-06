
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle,
  FileText,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ClientRequests = () => {
  const { user, client } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Dados mockados para demonstração
  const requests = [
    {
      id: '1',
      title: 'Solicitação de Relatório Mensal',
      description: 'Preciso do relatório financeiro do mês de janeiro',
      status: 'pending',
      priority: 'medium',
      created_at: '2024-01-15T10:30:00Z',
      due_date: '2024-01-20T23:59:59Z'
    },
    {
      id: '2',
      title: 'Revisão de Contrato',
      description: 'Solicitação de revisão do contrato de prestação de serviços',
      status: 'approved',
      priority: 'high',
      created_at: '2024-01-10T14:20:00Z',
      due_date: '2024-01-18T23:59:59Z'
    },
    {
      id: '3',
      title: 'Atualização de Documentos',
      description: 'Necessário atualizar documentação fiscal',
      status: 'rejected',
      priority: 'low',
      created_at: '2024-01-05T09:15:00Z',
      due_date: '2024-01-15T23:59:59Z'
    }
  ];

  const filteredRequests = requests.filter(request =>
    request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-700"><XCircle className="h-3 w-3 mr-1" />Rejeitado</Badge>;
      default:
        return <Badge variant="outline">Indefinido</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Alta</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700">Média</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-100 text-green-700">Baixa</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  const handleNewRequest = () => {
    toast.info('Funcionalidade de nova solicitação em desenvolvimento');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Minhas Solicitações</h1>
          <p className="text-gray-600 mt-1">
            Acompanhe suas solicitações e aprovações
          </p>
        </div>
        <Button onClick={handleNewRequest}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Solicitação
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Solicitações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por título ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma solicitação encontrada</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Tente ajustar sua busca' : 'Você ainda não fez nenhuma solicitação'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                      {getStatusBadge(request.status)}
                      {getPriorityBadge(request.priority)}
                    </div>
                    <p className="text-gray-600 mb-4">{request.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Criado em: {new Date(request.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Prazo: {new Date(request.due_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientRequests;
