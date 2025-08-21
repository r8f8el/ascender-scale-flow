
import React, { useState, useEffect } from 'react';
import { useFPAClients } from '@/hooks/useFPAClients';
import { useFPAPeriods } from '@/hooks/useFPAPeriods';
import { useFPAReports } from '@/hooks/useFPAReports';
import { useFPADataUploads } from '@/hooks/useFPADataUploads';
import { useCompanyAccess } from '@/hooks/useCompanyAccess';
import FPAClientList from './FPAClientList';
import FPAClientDetails from './FPAClientDetails';

const FPAClientManager: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  
  // Verificar acesso à empresa primeiro
  const { data: companyAccess, isLoading: companyLoading } = useCompanyAccess();
  
  const { data: clients = [], isLoading: clientsLoading } = useFPAClients();
  const { data: periods = [] } = useFPAPeriods(selectedClient || undefined);
  const { data: reports = [] } = useFPAReports(selectedClient || undefined);
  const { data: uploads = [] } = useFPADataUploads(selectedClient || undefined);

  // Auto-seleciona o primeiro cliente ao carregar
  useEffect(() => {
    if (!clientsLoading && clients.length && !selectedClient) {
      setSelectedClient(clients[0].id);
    }
  }, [clientsLoading, clients, selectedClient]);

  // Mostrar loading se ainda estiver verificando acesso da empresa
  if (companyLoading || clientsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Se não tem acesso à empresa, mostrar mensagem
  if (!companyAccess?.hasCompanyAccess) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Acesso Negado</h3>
          <p className="text-gray-600">
            Você não tem acesso aos dados de FP&A. Entre em contato com o administrador.
          </p>
        </div>
      </div>
    );
  }

  const selectedClientData = clients.find(c => c.id === selectedClient) || null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciamento de Clientes FP&A</h2>
        {companyAccess.profile?.company && (
          <div className="text-sm text-gray-600">
            Empresa: {companyAccess.profile.company}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FPAClientList 
          clients={clients}
          selectedClient={selectedClient}
          onClientSelect={setSelectedClient}
        />
        
        <FPAClientDetails
          client={selectedClientData}
          periods={periods}
          reports={reports}
          uploads={uploads}
        />
      </div>
    </div>
  );
};

export default FPAClientManager;
