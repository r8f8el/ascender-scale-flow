
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useClientTicketActions = () => {
  const deleteTicket = async (ticketId: string) => {
    try {
      // First delete related responses
      const { error: responsesError } = await supabase
        .from('ticket_responses')
        .delete()
        .eq('ticket_id', ticketId);

      if (responsesError) throw responsesError;

      // Then delete the ticket
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticketId);

      if (error) throw error;

      toast.success('Chamado excluído com sucesso');
      return true;
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast.error('Erro ao excluir chamado');
      return false;
    }
  };

  return {
    deleteTicket
  };
};
