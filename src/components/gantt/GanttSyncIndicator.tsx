import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Clock, Users, RotateCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GanttSyncIndicatorProps {
  projectId: string;
  isAdmin: boolean;
}

export const GanttSyncIndicator: React.FC<GanttSyncIndicatorProps> = ({
  projectId,
  isAdmin
}) => {
  const [isConnected, setIsConnected] = useState(true);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  useEffect(() => {
    // Set up real-time subscription for project tasks
    const channel = supabase.channel(`gantt-project-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gantt_tasks',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          setLastSync(new Date());
          setSyncStatus('syncing');
          
          // Show notification for changes
          if (payload.eventType === 'INSERT') {
            toast.success('Nova tarefa criada', {
              description: 'O cronograma foi atualizado em tempo real'
            });
          } else if (payload.eventType === 'UPDATE') {
            toast.info('Tarefa atualizada', {
              description: 'Mudanças sincronizadas automaticamente'
            });
          } else if (payload.eventType === 'DELETE') {
            toast.warning('Tarefa removida', {
              description: 'O cronograma foi atualizado'
            });
          }
          
          setTimeout(() => setSyncStatus('idle'), 1000);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Track active users (simplified)
    const presenceChannel = supabase.channel(`presence-gantt-${projectId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        setActiveUsers(Object.keys(state).length);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            role: isAdmin ? 'admin' : 'client',
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(presenceChannel);
    };
  }, [projectId, isAdmin]);

  const formatLastSync = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffSeconds < 60) {
      return 'agora mesmo';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}min atrás`;
    } else if (diffHours < 24) {
      return `${diffHours}h atrás`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        {isConnected ? (
          <div className="flex items-center gap-1 text-green-600">
            <Wifi className="h-4 w-4" />
            <span className="text-xs font-medium">Online</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-red-600">
            <WifiOff className="h-4 w-4" />
            <span className="text-xs font-medium">Offline</span>
          </div>
        )}
      </div>

      {/* Sync Status */}
      <div className="flex items-center gap-1">
        {syncStatus === 'syncing' ? (
          <div className="flex items-center gap-1 text-blue-600">
            <RotateCw className="h-4 w-4 animate-spin" />
            <span className="text-xs">Sincronizando...</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="h-4 w-4" />
            <span className="text-xs">Última sincronização: {formatLastSync(lastSync)}</span>
          </div>
        )}
      </div>

      {/* Active Users */}
      {activeUsers > 0 && (
        <div className="flex items-center gap-1">
          <Badge variant="secondary" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            {activeUsers} {activeUsers === 1 ? 'usuário' : 'usuários'} online
          </Badge>
        </div>
      )}

      {/* Role Indicator */}
      <div className="ml-auto">
        <Badge variant={isAdmin ? "default" : "outline"} className="text-xs">
          {isAdmin ? 'Admin' : 'Cliente'}
        </Badge>
      </div>
    </div>
  );
};
