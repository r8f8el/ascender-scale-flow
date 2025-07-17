
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ApprovalFlowType, ApprovalRequest, ApprovalStep, ApprovalHistory } from '@/types/approval';

export const useApprovalFlow = () => {
  const [flowTypes, setFlowTypes] = useState<ApprovalFlowType[]>([]);
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchFlowTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('approval_flow_types')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setFlowTypes(data || []);
    } catch (error) {
      console.error('Error fetching flow types:', error);
      toast.error('Erro ao carregar tipos de fluxo');
    }
  };

  const fetchRequests = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('approval_requests')
        .select(`
          *,
          flow_type:approval_flow_types(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  };

  const createRequest = async (requestData: {
    flow_type_id: string;
    title: string;
    description?: string;
    amount?: number;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('approval_requests')
        .insert({
          ...requestData,
          requested_by_user_id: user.id,
          requested_by_name: user.user_metadata?.name || user.email?.split('@')[0] || '',
          requested_by_email: user.email || '',
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Solicitação criada com sucesso');
      fetchRequests();
      return data;
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Erro ao criar solicitação');
      return null;
    }
  };

  const updateRequestStatus = async (
    requestId: string, 
    action: 'approved' | 'rejected',
    comments?: string
  ) => {
    if (!user) return false;

    try {
      // First, add to history
      const { error: historyError } = await supabase
        .from('approval_history')
        .insert({
          request_id: requestId,
          step_order: 1, // Simplified for now
          action,
          approver_user_id: user.id,
          approver_name: user.user_metadata?.name || user.email?.split('@')[0] || '',
          approver_email: user.email || '',
          comments,
        });

      if (historyError) throw historyError;

      // Then update the request status
      const newStatus = action === 'approved' ? 'approved' : 'rejected';
      const { error: updateError } = await supabase
        .from('approval_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (updateError) throw updateError;

      toast.success(`Solicitação ${action === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso`);
      fetchRequests();
      return true;
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Erro ao atualizar solicitação');
      return false;
    }
  };

  const fetchRequestHistory = async (requestId: string): Promise<ApprovalHistory[]> => {
    try {
      const { data, error } = await supabase
        .from('approval_history')
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

  useEffect(() => {
    fetchFlowTypes();
    fetchRequests();
  }, [user]);

  return {
    flowTypes,
    requests,
    loading,
    createRequest,
    updateRequestStatus,
    fetchRequestHistory,
    refetch: fetchRequests,
  };
};
