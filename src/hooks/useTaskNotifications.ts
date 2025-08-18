
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCreateNotification } from './useNotifications';

export const useTaskNotifications = () => {
  const createNotification = useCreateNotification();

  const notifyTaskAssignment = useMutation({
    mutationFn: async ({ taskName, assignedToEmail, assignedToName, projectName }: {
      taskName: string;
      assignedToEmail: string;
      assignedToName: string;
      projectName: string;
    }) => {
      // Notificar o usuário atribuído
      await createNotification.mutateAsync({
        recipient_email: assignedToEmail,
        subject: `Nova tarefa atribuída: ${taskName}`,
        message: `Você foi designado para a tarefa "${taskName}" no projeto "${projectName}". Acesse o sistema para visualizar os detalhes.`,
        type: 'task_assignment'
      });

      // Notificar membros da Ascalate
      const { data: ascalateMembers } = await supabase
        .from('admin_profiles')
        .select('email, name')
        .neq('email', assignedToEmail); // Não enviar para o próprio usuário se for admin

      if (ascalateMembers) {
        const notifications = ascalateMembers.map(member => 
          createNotification.mutateAsync({
            recipient_email: member.email,
            subject: `Tarefa atribuída no projeto ${projectName}`,
            message: `A tarefa "${taskName}" foi atribuída para ${assignedToName} no projeto "${projectName}".`,
            type: 'task_assignment'
          })
        );

        await Promise.all(notifications);
      }
    },
    onSuccess: () => {
      toast.success('Notificações de atribuição de tarefa enviadas!');
    },
    onError: (error) => {
      console.error('Erro ao enviar notificações de tarefa:', error);
      toast.error('Erro ao enviar notificações de tarefa');
    }
  });

  return { notifyTaskAssignment };
};
