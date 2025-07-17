
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  status_id: string;
  priority_id: string;
  category_id: string;
  assigned_to: string | null;
  user_name: string;
  user_email: string;
  user_phone: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
}

interface TicketStatus {
  id: string;
  name: string;
  color: string;
  is_closed: boolean;
}

export const useTicketActions = (
  tickets: Ticket[],
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>,
  statuses: TicketStatus[]
) => {
  const assignTicket = async (ticketId: string, adminId: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ 
          assigned_to: adminId,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) throw error;

      setTickets(prev => prev.map(t => 
        t.id === ticketId 
          ? { ...t, assigned_to: adminId }
          : t
      ));

      toast.success('Chamado atribuído com sucesso');
      return true;
    } catch (error) {
      console.error('Error assigning ticket:', error);
      toast.error('Erro ao atribuir chamado');
      return false;
    }
  };

  const updateTicketStatus = async (ticketId: string, statusId: string) => {
    try {
      const status = statuses.find(s => s.id === statusId);
      const updateData: any = { 
        status_id: statusId,
        updated_at: new Date().toISOString()
      };

      if (status?.is_closed) {
        updateData.resolved_at = new Date().toISOString();
        updateData.closed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tickets')
        .update(updateData)
        .eq('id', ticketId);

      if (error) throw error;

      setTickets(prev => prev.map(t => 
        t.id === ticketId 
          ? { ...t, ...updateData }
          : t
      ));

      toast.success('Status do chamado atualizado');
      return true;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast.error('Erro ao atualizar status');
      return false;
    }
  };

  const addResponse = async (ticketId: string, response: string) => {
    if (!response.trim()) {
      toast.error('Digite uma resposta');
      return false;
    }

    try {
      const { error } = await supabase
        .from('ticket_responses')
        .insert({
          ticket_id: ticketId,
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          message: response.trim(),
          is_internal_note: false
        });

      if (error) throw error;

      toast.success('Resposta adicionada com sucesso');
      return true;
    } catch (error) {
      console.error('Error adding response:', error);
      toast.error('Erro ao adicionar resposta');
      return false;
    }
  };

  return {
    assignTicket,
    updateTicketStatus,
    addResponse
  };
};
