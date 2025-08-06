
import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const ClientDocumentSync: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Configurar listener de tempo real para documentos
    const channel = supabase
      .channel('document-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Document change detected:', payload);
          
          // Invalidar query dos documentos para atualizar a UI
          queryClient.invalidateQueries({ queryKey: ['client-documents'] });
          
          // Mostrar notificação baseada no tipo de evento
          if (payload.eventType === 'INSERT') {
            toast({
              title: "Novo documento",
              description: "Um novo documento foi adicionado à sua conta.",
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: "Documento atualizado",
              description: "Um documento foi atualizado em sua conta.",
            });
          } else if (payload.eventType === 'DELETE') {
            toast({
              title: "Documento removido",
              description: "Um documento foi removido de sua conta.",
            });
          }
        }
      )
      .subscribe();

    // Configurar listener para solicitações de aprovação
    const approvalChannel = supabase
      .channel('approval-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'approval_requests',
          filter: `requested_by_user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Approval change detected:', payload);
          
          // Invalidar queries relacionadas
          queryClient.invalidateQueries({ queryKey: ['client-approvals'] });
          queryClient.invalidateQueries({ queryKey: ['approval-history'] });
          
          // Notificar sobre mudanças de status
          if (payload.eventType === 'UPDATE' && payload.new && payload.old) {
            const oldStatus = payload.old.status;
            const newStatus = payload.new.status;
            
            if (oldStatus !== newStatus) {
              let message = '';
              if (newStatus === 'approved') {
                message = 'Sua solicitação foi aprovada!';
              } else if (newStatus === 'rejected') {
                message = 'Sua solicitação foi rejeitada.';
              }
              
              if (message) {
                toast({
                  title: "Atualização de Aprovação",
                  description: message,
                });
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(approvalChannel);
    };
  }, [user, queryClient, toast]);

  return null; // Este é um componente de sincronização, não renderiza nada
};

export default ClientDocumentSync;
