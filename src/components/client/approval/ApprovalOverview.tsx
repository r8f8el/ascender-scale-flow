import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export const ApprovalOverview = () => {
  const { user } = useAuth();

  // Buscar estatísticas das aprovações
  const { data: stats } = useQuery({
    queryKey: ['approval-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: myRequests } = await supabase
        .from('approval_requests')
        .select('status')
        .eq('requested_by_user_id', user.id);

      const { data: pendingForMe } = await supabase
        .from('approval_requests')
        .select('id')
        .eq('status', 'pending')
        .in('flow_type_id', 
          (await supabase
            .from('approval_steps')
            .select('flow_type_id')
            .or(`approver_user_id.eq.${user.id},approver_email.eq.${user.email}`)
          ).data?.map(step => step.flow_type_id) || []
        );

      return {
        totalRequests: myRequests?.length || 0,
        pendingRequests: myRequests?.filter(r => r.status === 'pending').length || 0,
        approvedRequests: myRequests?.filter(r => r.status === 'approved').length || 0,
        rejectedRequests: myRequests?.filter(r => r.status === 'rejected').length || 0,
        pendingForMe: pendingForMe?.length || 0
      };
    },
    enabled: !!user
  });

  // Buscar solicitações recentes
  const { data: recentRequests } = useQuery({
    queryKey: ['recent-approval-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data } = await supabase
        .from('approval_requests')
        .select(`
          id,
          title,
          status,
          created_at,
          requested_by_name,
          approval_flow_types (name)
        `)
        .eq('requested_by_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      return data || [];
    },
    enabled: !!user
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejeitado</Badge>;
      default:
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
    }
  };

  console.log('🔍 ApprovalOverview renderizando');
  console.log('🔍 ApprovalOverview - stats:', stats);
  console.log('🔍 ApprovalOverview - recentRequests:', recentRequests);

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Solicitações</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRequests || 0}</div>
            <p className="text-xs text-muted-foreground">
              Todas as suas solicitações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingRequests || 0}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando aprovação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.approvedRequests || 0}</div>
            <p className="text-xs text-muted-foreground">
              Concluídas com sucesso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Para Aprovar</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingForMe || 0}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando sua aprovação
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Solicitações Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Solicitações Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentRequests && recentRequests.length > 0 ? (
            <div className="space-y-3">
              {recentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <p className="font-medium">{request.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Você ainda não possui solicitações de aprovação
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};