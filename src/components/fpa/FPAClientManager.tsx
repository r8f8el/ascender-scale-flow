
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useFPAClients } from '@/hooks/useFPAClients';
import { useFPAPeriods } from '@/hooks/useFPAPeriods';
import { useFPAReports } from '@/hooks/useFPAReports';
import { useFPADataUploads } from '@/hooks/useFPADataUploads';
import FPAClientList from './FPAClientList';
import FPAClientDetails from './FPAClientDetails';
import FPAOnboardingWizard from './FPAOnboardingWizard';

const FPAClientManager: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

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

  if (clientsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <FPAOnboardingWizard
        clientProfile={null}
        onComplete={() => setShowOnboarding(false)}
      />
    );
  }

  const selectedClientData = clients.find(c => c.id === selectedClient) || null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciamento de Clientes FP&A</h2>
        <Button onClick={() => setShowOnboarding(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
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
