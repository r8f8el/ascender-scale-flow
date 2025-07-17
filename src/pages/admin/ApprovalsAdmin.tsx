
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useApprovalFlow } from '@/hooks/useApprovalFlow';
import { ApprovalRequestList } from '@/components/approval/ApprovalRequestList';
import { ApprovalRequestDetails } from '@/components/approval/ApprovalRequestDetails';
import type { ApprovalRequest, ApprovalHistory } from '@/types/approval';

const ApprovalsAdmin = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [requestHistory, setRequestHistory] = useState<ApprovalHistory[]>([]);

  const {
    requests,
    pendingApprovals,
    loading,
    approveRequest,
    rejectRequest,
    fetchRequestHistory,
  } = useApprovalFlow();

  const handleViewDetails = async (request: ApprovalRequest) => {
    setSelectedRequest(request);
    const history = await fetchRequestHistory(request.id);
    setRequestHistory(history);
    setActiveTab('details');
  };

  const handleApprove = async (requestId: string, comments?: string) => {
    await approveRequest(requestId, comments);
    // Atualizar histórico após aprovação
    if (selectedRequest?.id === requestId) {
      const history = await fetchRequestHistory(requestId);
      setRequestHistory(history);
    }
  };

  const handleReject = async (requestId: string, comments: string) => {
    await rejectRequest(requestId, comments);
    // Atualizar histórico após rejeição
    if (selectedRequest?.id === requestId) {
      const history = await fetchRequestHistory(requestId);
      setRequestHistory(history);
    }
  };

  // Estatísticas rápidas
  const stats = {
    pending: pendingApprovals.length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    total: requests.length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Administração de Aprovações</h1>
        <p className="text-gray-600">Gerencie todas as solicitações de aprovação</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Aprovadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Rejeitadas</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            Pendentes de Aprovação
            {stats.pending > 0 && (
              <Badge variant="secondary" className="ml-1">
                {stats.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">Todas as Solicitações</TabsTrigger>
          {selectedRequest && (
            <TabsTrigger value="details">Detalhes</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          <ApprovalRequestList
            requests={pendingApprovals}
            onViewDetails={handleViewDetails}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          <ApprovalRequestList
            requests={requests}
            onViewDetails={handleViewDetails}
            loading={loading}
          />
        </TabsContent>

        {selectedRequest && (
          <TabsContent value="details" className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setActiveTab(activeTab === 'details' ? 'pending' : 'all')}
                className="text-blue-600 hover:text-blue-800"
              >
                ← Voltar para Lista
              </button>
            </div>
            <ApprovalRequestDetails
              request={selectedRequest}
              history={requestHistory}
              onApprove={handleApprove}
              onReject={handleReject}
              canApprove={true}
              loading={loading}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ApprovalsAdmin;
