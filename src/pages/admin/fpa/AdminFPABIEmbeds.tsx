
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3 } from 'lucide-react';
import { useFPAClients } from '@/hooks/useFPAClients';
import { useClientBIEmbeds } from '@/hooks/useClientBIEmbeds';
import AdminBIEmbedManager from '@/components/fpa/AdminBIEmbedManager';

const AdminFPABIEmbeds: React.FC = () => {
  useEffect(() => {
    document.title = 'Admin • Embeds de BI | Ascalate';
  }, []);

  const { data: clients = [], isLoading: loadingClients } = useFPAClients();
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const { data: embeds = [], isLoading: loadingEmbeds } = useClientBIEmbeds(clientId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Embeds de BI por Cliente</h1>
          <p className="text-gray-600 mt-1">Configure múltiplos dashboards de BI para cada cliente</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" /> Seleção do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Cliente FP&A</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder={loadingClients ? 'Carregando...' : 'Selecione um cliente'} />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {clientId && (
        <AdminBIEmbedManager 
          clientId={clientId}
          embeds={embeds}
        />
      )}

      {!clientId && (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Selecione um Cliente FP&A
            </h3>
            <p className="text-gray-600 mb-4">
              Escolha um cliente acima para configurar os dashboards de BI
            </p>
            {loadingClients && (
              <p className="text-gray-500">Carregando clientes...</p>
            )}
            {!loadingClients && clients.length === 0 && (
              <p className="text-gray-500">Nenhum cliente FP&A encontrado.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminFPABIEmbeds;
