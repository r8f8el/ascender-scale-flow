
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCreateNotification } from './useNotifications';

export const useTicketNotifications = () => {
  const createNotification = useCreateNotification();

  const notifyNewTicket = useMutation({
    mutationFn: async ({ ticketNumber, title, userName, userEmail, priority }: {
      ticketNumber: string;
      title: string;
      userName: string;
      userEmail: string;
      priority: string;
    }) => {
      // Buscar todos os membros da Ascalate
      const { data: ascalateMembers } = await supabase
        .from('admin_profiles')
        .select('email, name');

      if (ascalateMembers) {
        const notifications = ascalateMembers.map(member => 
          createNotification.mutateAsync({
            recipient_email: member.email,
            subject: `Novo chamado aberto: ${ticketNumber}`,
            message: `Um novo chamado foi aberto:
            
Número: ${ticketNumber}
Título: ${title}
Cliente: ${userName} (${userEmail})
Prioridade: ${priority}

Acesse o painel administrativo para visualizar e atribuir o chamado.`,
            type: 'system_alert'
          })
        );

        await Promise.all(notifications);
      }
    },
    onSuccess: () => {
      toast.success('Equipe Ascalate notificada sobre o novo chamado!');
    },
    onError: (error) => {
      console.error('Erro ao notificar novo chamado:', error);
      toast.error('Erro ao notificar equipe sobre novo chamado');
    }
  });

  return { notifyNewTicket };
};
