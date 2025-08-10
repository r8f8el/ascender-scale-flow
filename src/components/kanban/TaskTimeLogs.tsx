import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from 'sonner';

interface TimeLog {
  id: string;
  task_id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  note: string | null;
}

export const TaskTimeLogsKanban: React.FC<{ taskId: string }>=({ taskId })=>{
  const { user } = useAuth();
  const { user: adminUser } = useAdminAuth();
  const currentUserId = user?.id || adminUser?.id || null;

  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const runningLog = useMemo(()=> logs.find(l=>!l.ended_at && l.user_id===currentUserId) || null, [logs, currentUserId]);

  const load = async () => {
    const { data, error } = await supabase
      .from('kanban_time_logs')
      .select('*')
      .eq('task_id', taskId)
      .order('started_at', { ascending: false });
    if (error) toast.error('Erro ao carregar tempo');
    setLogs((data as TimeLog[]) || []);
  };
  useEffect(()=>{ load(); },[taskId]);

  useEffect(() => {
    const channel = supabase
      .channel(`rt-kanban-time-logs-${taskId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'kanban_time_logs',
        filter: `task_id=eq.${taskId}`,
      }, (payload) => {
        console.log('Realtime kanban_time_logs change', payload);
        load();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId]);

  const start = async () => {
    if (!currentUserId) { toast.error('Usuário não autenticado'); return; }
    setLoading(true);
    const { error } = await supabase.from('kanban_time_logs').insert({ task_id: taskId, user_id: currentUserId, note: note || null });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setNote('');
    load();
  };

  const stop = async () => {
    if (!runningLog) return;
    setLoading(true);
    const { error } = await supabase
      .from('kanban_time_logs')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', runningLog.id);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    load();
  };

  const addManual = async (minutes: number) => {
    if (!currentUserId) { toast.error('Usuário não autenticado'); return; }
    if (!minutes || minutes <= 0) return;
    const ended = new Date();
    const started = new Date(ended.getTime() - minutes*60000);
    const { error } = await supabase
      .from('kanban_time_logs')
      .insert({ task_id: taskId, user_id: currentUserId, started_at: started.toISOString(), ended_at: ended.toISOString(), note: note || null });
    if (error) { toast.error(error.message); return; }
    setNote('');
    load();
  };

  const totalMin = logs.reduce((s,l)=> s + (l.duration_minutes||0), 0);

  return (
    <Card>
      <CardContent className="p-3 space-y-3">
        <div className="flex items-center gap-2">
          <Input value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Nota (opcional)" />
          {runningLog ? (
            <Button onClick={stop} disabled={loading}>Parar</Button>
          ) : (
            <Button onClick={start} disabled={loading}>Iniciar</Button>
          )}
          <Button variant="outline" onClick={()=>addManual(30)}>+30m</Button>
          <Button variant="outline" onClick={()=>addManual(60)}>+1h</Button>
        </div>
        <div className="text-sm text-muted-foreground">Total: {Math.floor(totalMin/60)}h {totalMin%60}m</div>
        <div className="space-y-2 max-h-56 overflow-auto">
          {logs.length===0 && <p className="text-sm text-muted-foreground">Sem apontamentos.</p>}
          {logs.map((l)=> (
            <div key={l.id} className="text-sm">
              <div className="text-xs text-muted-foreground">
                {new Date(l.started_at).toLocaleString()} {l.ended_at ? '→ '+ new Date(l.ended_at).toLocaleString(): '(em andamento)'} · {l.duration_minutes? `${Math.floor(l.duration_minutes/60)}h ${l.duration_minutes%60}m` : ''}
              </div>
              {l.note && <div>{l.note}</div>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
