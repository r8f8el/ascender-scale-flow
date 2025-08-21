
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useTicketNotifications = () => {
  const notifyNewTicket = useMutation({
    mutationFn: async ({ ticketNumber, title, userName, userEmail, priority, description }: {
      ticketNumber: string;
      title: string;
      userName: string;
      userEmail: string;
      priority: string;
      description: string;
    }) => {
      console.log('Enviando notificação de novo chamado via edge function...');
      
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: {
          type: 'ticket_created',
          data: {
            ticketNumber,
            title,
            userName,
            userEmail,
            priority,
            description
          }
        }
      });

      if (error) {
        console.error('Erro na edge function de notificação:', error);
        throw new Error(`Erro ao enviar notificação: ${error.message}`);
      }

      console.log('Notificação enviada com sucesso:', data);
      return data;
    },
    onSuccess: () => {
      toast.success('Equipe Ascalate notificada sobre o novo chamado!');
    },
    onError: (error: any) => {
      console.error('Erro ao notificar novo chamado:', error);
      toast.error('Erro ao notificar equipe sobre novo chamado');
    }
  });

  return { notifyNewTicket };
};
