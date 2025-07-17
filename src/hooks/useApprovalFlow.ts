
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
      const { data, error } = await supabase
        .from('approval_flow_types')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setFlowTypes(data || []);
    } catch (error) {
      console.error('Error fetching flow types:', error);
      setError('Erro ao carregar tipos de fluxo');
    }
  };

  // Buscar solicitações do usuário
  const fetchUserRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('approval_requests')
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
    } finally {
      setLoading(false);
    }
  };

  // Buscar aprovações pendentes para o usuário
  const fetchPendingApprovals = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Consulta complexa para buscar solicitações que precisam da aprovação do usuário
      const { data, error } = await supabase
        .rpc('get_pending_approvals_for_user', { user_id: user.id });

      if (error) throw error;
      setPendingApprovals(data || []);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      // Fallback para uma consulta mais simples se a função RPC não existir
      const { data, error: fallbackError } = await supabase
        .from('approval_requests')
        .select(`
          *,
          flow_type:approval_flow_types(*)
        `)
        .in('status', ['pending', 'in_progress'])
        .order('created_at', { ascending: false });

      if (!fallbackError) {
        setPendingApprovals(data || []);
      }
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
      
      // Buscar informações do tipo de fluxo para calcular total_steps
      const { data: flowType, error: flowError } = await supabase
        .from('approval_flow_types')
        .select('id')
        .eq('id', requestData.flow_type_id)
        .single();

      if (flowError) throw flowError;

      const { data: steps, error: stepsError } = await supabase
        .from('approval_steps')
        .select('step_number')
        .eq('flow_type_id', requestData.flow_type_id)
        .eq('is_active', true);

      if (stepsError) throw stepsError;

      const totalSteps = steps?.length || 1;

      const { data, error } = await supabase
        .from('approval_requests')
        .insert([
          {
            ...requestData,
            requested_by_user_id: user.id,
            total_steps: totalSteps,
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
      
      // Buscar informações da solicitação atual
      const { data: request, error: requestError } = await supabase
        .from('approval_requests')
        .select('*, flow_type:approval_flow_types(*)')
        .eq('id', requestId)
        .single();

      if (requestError) throw requestError;

      // Determinar próximo step ou status final
      const nextStep = request.current_step + 1;
      const isLastStep = nextStep > (request.total_steps || 1);
      
      const newStatus = isLastStep ? 'approved' : 'in_progress';
      const newCurrentStep = isLastStep ? request.current_step : nextStep;

      // Atualizar solicitação
      const { error: updateError } = await supabase
        .from('approval_requests')
        .update({
          status: newStatus,
          current_step: newCurrentStep,
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Adicionar comentário ao histórico se fornecido
      if (comments) {
        await supabase
          .from('approval_history')
          .insert([
            {
              request_id: requestId,
              actor_user_id: user?.id,
              action: 'commented',
              comments,
              step_number: request.current_step,
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
        .from('approval_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      // Adicionar comentário obrigatório para rejeição
      await supabase
        .from('approval_history')
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

  // Configurar subscriptions em tempo real
  useEffect(() => {
    if (!user) return;

    const requestsChannel = supabase
      .channel('approval_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'approval_requests',
        },
        () => {
          fetchUserRequests();
          fetchPendingApprovals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(requestsChannel);
    };
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
