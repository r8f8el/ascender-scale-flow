
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useApprovalFlow } from '@/hooks/useApprovalFlow';
import { ApprovalRequestForm } from '@/components/approval/ApprovalRequestForm';
import { ApprovalRequestList } from '@/components/approval/ApprovalRequestList';
import { ApprovalRequestDetails } from '@/components/approval/ApprovalRequestDetails';
import type { ApprovalRequest, ApprovalHistory } from '@/types/approval';

const ClientApprovals = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [requestHistory, setRequestHistory] = useState<ApprovalHistory[]>([]);
  
  const {
    requests,
    flowTypes,
    loading,
    error,
    createRequest,
    fetchRequestHistory,
  } = useApprovalFlow();

  const handleViewDetails = async (request: ApprovalRequest) => {
    setSelectedRequest(request);
    const history = await fetchRequestHistory(request.id);
    setRequestHistory(history);
    setActiveTab('details');
  };

  const handleCreateRequest = async (data: any) => {
    const success = await createRequest(data);
    if (success) {
      setActiveTab('list');
    }
    return success;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fluxo de Aprovações</h1>
          <p className="text-gray-600">Gerencie suas solicitações de aprovação</p>
        </div>
        <Button 
          onClick={() => setActiveTab('create')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Solicitação
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Minhas Solicitações</TabsTrigger>
          <TabsTrigger value="create">Nova Solicitação</TabsTrigger>
          {selectedRequest && (
            <TabsTrigger value="details">Detalhes</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <ApprovalRequestList
            requests={requests}
            onViewDetails={handleViewDetails}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <ApprovalRequestForm
            flowTypes={flowTypes}
            onSubmit={handleCreateRequest}
            loading={loading}
          />
        </TabsContent>

        {selectedRequest && (
          <TabsContent value="details" className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="outline"
                onClick={() => setActiveTab('list')}
              >
                ← Voltar para Lista
              </Button>
            </div>
            <ApprovalRequestDetails
              request={selectedRequest}
              history={requestHistory}
              onApprove={async () => {}}
              onReject={async () => {}}
              canApprove={false}
              loading={loading}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ClientApprovals;
