
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { 
  ApprovalRequest, 
  ApprovalFlowType, 
  ApprovalStep, 
  ApprovalHistory, 
  CreateApprovalRequestData,
  ApprovalDecisionData 
} from '@/types/approval';

export const useApprovalFlow = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>([]);
  const [flowTypes, setFlowTypes] = useState<ApprovalFlowType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar tipos de fluxo
  const fetchFlowTypes = async () => {
    try {
      // Using direct SQL query since types haven't been updated yet
      const { data, error } = await supabase
        .rpc('log_system_action', {
          p_user_name: 'system',
          p_type: 'approval_flow',
          p_ip_address: '127.0.0.1',
          p_action: 'fetch_flow_types'
        })
        .then(() => 
          supabase
            .from('approval_flow_types' as any)
            .select('*')
            .eq('is_active', true)
            .order('name')
        );

      if (error) throw error;
      setFlowTypes(data || []);
    } catch (error) {
      console.error('Error fetching flow types:', error);
      // Fallback data for testing
      setFlowTypes([
        {
          id: '1',
          name: 'Aprovação de Orçamento',
          description: 'Fluxo para aprovação de propostas orçamentárias',
          required_fields: { amount: true, department: true, business_justification: true },
          routing_rules: {},
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Solicitação de Investimento',
          description: 'Fluxo para aprovação de investimentos de capital',
          required_fields: { amount: true, expected_outcome: true, risk_assessment: true },
          routing_rules: {},
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ]);
    }
  };

  // Buscar solicitações do usuário
  const fetchUserRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Using direct query since types haven't been updated
      const { data, error } = await supabase
        .from('approval_requests' as any)
        .select(`
          *,
          flow_type:approval_flow_types(*)
        `)
        .eq('requested_by_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching user requests:', error);
      setError('Erro ao carregar solicitações');
      // Set empty array as fallback
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Buscar aprovações pendentes para o usuário
  const fetchPendingApprovals = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // For now, return empty array until types are updated
      setPendingApprovals([]);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      setPendingApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  // Criar nova solicitação
  const createRequest = async (requestData: CreateApprovalRequestData) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('approval_requests' as any)
        .insert([
          {
            ...requestData,
            requested_by_user_id: user.id,
            total_steps: 2, // Default for now
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success('Solicitação criada com sucesso!');
      await fetchUserRequests();
      return true;
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Erro ao criar solicitação');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Aprovar solicitação
  const approveRequest = async (requestId: string, comments?: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('approval_requests' as any)
        .update({
          status: 'approved',
        })
        .eq('id', requestId);

      if (error) throw error;

      // Add comment to history if provided
      if (comments) {
        await supabase
          .from('approval_history' as any)
          .insert([
            {
              request_id: requestId,
              actor_user_id: user?.id,
              action: 'commented',
              comments,
            }
          ]);
      }

      toast.success('Solicitação aprovada com sucesso!');
      await fetchPendingApprovals();
      await fetchUserRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Erro ao aprovar solicitação');
    } finally {
      setLoading(false);
    }
  };

  // Rejeitar solicitação
  const rejectRequest = async (requestId: string, comments: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('approval_requests' as any)
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      // Add mandatory comment for rejection
      await supabase
        .from('approval_history' as any)
        .insert([
          {
            request_id: requestId,
            actor_user_id: user?.id,
            action: 'rejected',
            comments,
          }
        ]);

      toast.success('Solicitação rejeitada');
      await fetchPendingApprovals();
      await fetchUserRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Erro ao rejeitar solicitação');
    } finally {
      setLoading(false);
    }
  };

  // Buscar histórico de uma solicitação
  const fetchRequestHistory = async (requestId: string): Promise<ApprovalHistory[]> => {
    try {
      const { data, error } = await supabase
        .from('approval_history' as any)
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching request history:', error);
      return [];
    }
  };

  // Efeitos para carregar dados iniciais
  useEffect(() => {
    fetchFlowTypes();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserRequests();
      fetchPendingApprovals();
    }
  }, [user]);

  return {
    requests,
    pendingApprovals,
    flowTypes,
    loading,
    error,
    createRequest,
    approveRequest,
    rejectRequest,
    fetchRequestHistory,
    refetch: () => {
      fetchUserRequests();
      fetchPendingApprovals();
      fetchFlowTypes();
    },
  };
};
