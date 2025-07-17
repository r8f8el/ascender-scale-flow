
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ApprovalFlowType, ApprovalRequest, ApprovalHistory } from '@/types/approval';

export const useApprovalFlow = () => {
  const [flowTypes, setFlowTypes] = useState<ApprovalFlowType[]>([]);
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);

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
      setFlowTypes([]);
    }
  };

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('approval_requests')
        .select(`
          *,
          flow_type:approval_flow_types(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type-safe transformation
      const typedRequests: ApprovalRequest[] = (data || []).map(item => ({
        id: item.id,
        flow_type_id: item.flow_type_id,
        title: item.title,
        description: item.description,
        amount: item.amount,
        priority: (item.priority as ApprovalRequest['priority']) || 'medium',
        status: (item.status as ApprovalRequest['status']) || 'pending',
        current_step: item.current_step,
        total_steps: item.total_steps,
        requested_by_user_id: item.requested_by_user_id,
        requested_by_name: item.requested_by_name,
        requested_by_email: item.requested_by_email,
        created_at: item.created_at,
        updated_at: item.updated_at,
        flow_type: item.flow_type
      }));

      setRequests(typedRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests([]);
    }
  };

  const createRequest = async (requestData: {
    flow_type_id: string;
    title: string;
    description?: string;
    amount?: number;
    priority: ApprovalRequest['priority'];
  }) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('approval_requests')
        .insert({
          ...requestData,
          requested_by_user_id: user.id,
          requested_by_name: user.user_metadata?.name || user.email || 'Unknown',
          requested_by_email: user.email || '',
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchRequests();
      return data;
    } catch (error) {
      console.error('Error creating request:', error);
      throw error;
    }
  };

  const updateRequestStatus = async (
    requestId: string, 
    action: ApprovalHistory['action'], 
    comments?: string
  ) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      
      if (!user) throw new Error('User not authenticated');

      // Update request status
      const newStatus = action === 'approved' ? 'approved' : action === 'rejected' ? 'rejected' : 'pending';
      
      const { error: updateError } = await supabase
        .from('approval_requests')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Add to history
      const { error: historyError } = await supabase
        .from('approval_history')
        .insert({
          request_id: requestId,
          step_order: 1,
          action,
          approver_user_id: user.id,
          approver_name: user.user_metadata?.name || user.email || 'Unknown',
          approver_email: user.email || '',
          comments
        });

      if (historyError) throw historyError;
      
      await fetchRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      throw error;
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
      
      // Type-safe transformation
      const typedHistory: ApprovalHistory[] = (data || []).map(item => ({
        id: item.id,
        request_id: item.request_id,
        step_order: item.step_order,
        action: item.action as ApprovalHistory['action'],
        approver_user_id: item.approver_user_id,
        approver_name: item.approver_name,
        approver_email: item.approver_email,
        comments: item.comments,
        created_at: item.created_at
      }));

      return typedHistory;
    } catch (error) {
      console.error('Error fetching request history:', error);
      return [];
    }
  };

  const refetch = async () => {
    setLoading(true);
    await Promise.all([fetchFlowTypes(), fetchRequests()]);
    setLoading(false);
  };

  useEffect(() => {
    refetch();
  }, []);

  return {
    flowTypes,
    requests,
    loading,
    createRequest,
    updateRequestStatus,
    fetchRequestHistory,
    refetch
  };
};
