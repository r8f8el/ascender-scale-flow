
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  recipient_email: string;
  subject: string;
  message: string;
  type: 'general' | 'task_assignment' | 'document_update' | 'fpa_report' | 'system_alert';
  sent_at?: string;
  error_message?: string;
  created_at: string;
}

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_email', user.email!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Notification[];
    }
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notification: Omit<Notification, 'id' | 'created_at' | 'sent_at'>) => {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select()
        .single();
      
      if (error) throw error;

      // Trigger email sending via edge function
      const { error: emailError } = await supabase.functions.invoke('send-notification', {
        body: { notificationId: data.id }
      });

      if (emailError) {
        console.error('Error sending notification email:', emailError);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notificação enviada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating notification:', error);
      toast.error('Erro ao criar notificação');
    }
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
};
