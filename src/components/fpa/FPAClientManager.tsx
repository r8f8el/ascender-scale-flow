
import React, { useState, useEffect } from 'react';
import { useFPAClients, useCreateFPAClientFromProfile } from '@/hooks/useFPAClients';
import { useFPAPeriods } from '@/hooks/useFPAPeriods';
import { useFPAReports } from '@/hooks/useFPAReports';
import { useFPADataUploads } from '@/hooks/useFPADataUploads';
import { useCompanyAccess } from '@/hooks/useCompanyAccess';
import { useClients } from '@/hooks/useClients';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import FPAClientList from './FPAClientList';
import FPAClientDetails from './FPAClientDetails';

const FPAClientManager: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  
  // Verificar acesso à empresa primeiro
  const { data: companyAccess, isLoading: companyLoading } = useCompanyAccess();
  
  const { data: clients = [], isLoading: clientsLoading } = useFPAClients();
  const { data: clientProfiles = [] } = useClients();
  const createFPAClientMutation = useCreateFPAClientFromProfile();
  
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
  
  const availableProfiles = clientProfiles.filter(
    profile => !clients.some(client => client.client_profile_id === profile.id)
  );

  const handleAddFPAClient = async () => {
    if (!selectedProfileId || selectedProfileId === 'none') return;
    
    try {
      await createFPAClientMutation.mutateAsync(selectedProfileId);
      setSelectedProfileId('');
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Gerenciamento de Clientes FP&A</h2>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Vincular Cliente ao FP&A
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Vincular Cliente ao FP&A</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <p className="text-sm text-gray-500">
                  Selecione um perfil de cliente cadastrado para habilitar o módulo de FP&A para ele.
                </p>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cliente</label>
                  <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um cliente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProfiles.length === 0 ? (
                        <SelectItem value="none" disabled>
                          Nenhum cliente disponível para vincular
                        </SelectItem>
                      ) : (
                        availableProfiles.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.company || profile.name} ({profile.email})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAddFPAClient} 
                  disabled={!selectedProfileId || selectedProfileId === 'none' || createFPAClientMutation.isPending}
                >
                  {createFPAClientMutation.isPending ? 'Vinculando...' : 'Vincular Cliente'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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
