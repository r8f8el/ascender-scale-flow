
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface Client {
  id: string;
  company_name: string;
  industry?: string;
  onboarding_completed: boolean;
  current_phase: number;
}

interface FPAClientListProps {
  clients: Client[];
  selectedClient: string | null;
  onClientSelect: (clientId: string) => void;
}

const FPAClientList: React.FC<FPAClientListProps> = ({
  clients,
  selectedClient,
  onClientSelect
}) => {
  const getClientStatus = (client: Client) => {
    if (!client.onboarding_completed) return 'onboarding';
    if (client.current_phase === 1) return 'setup';
    if (client.current_phase === 2) return 'data_collection';
    if (client.current_phase === 3) return 'analysis';
    return 'active';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'onboarding':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700">Onboarding</Badge>;
      case 'setup':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700">Configuração</Badge>;
      case 'data_collection':
        return <Badge variant="outline" className="bg-orange-100 text-orange-700">Coleta de Dados</Badge>;
      case 'analysis':
        return <Badge variant="outline" className="bg-purple-100 text-purple-700">Análise</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Ativo</Badge>;
      default:
        return <Badge variant="outline">Indefinido</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Clientes ({clients.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {clients.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum cliente FP&A cadastrado
            </p>
          ) : (
            clients.map((client) => (
              <div
                key={client.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedClient === client.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => onClientSelect(client.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{client.company_name}</h4>
                    <p className="text-sm text-gray-600">{client.industry}</p>
                  </div>
                  {getStatusBadge(getClientStatus(client))}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FPAClientList;
