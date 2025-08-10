import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from 'sonner';

interface Comment {
  id: string;
  task_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

export const TaskCommentsGantt: React.FC<{ taskId: string }>=({ taskId })=>{
  const { user } = useAuth();
  const { user: adminUser } = useAdminAuth();
  const currentUserId = user?.id || adminUser?.id || null;

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('gantt_task_comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });
    if (error) toast.error('Erro ao carregar comentários');
    setComments((data as Comment[]) || []);
    setLoading(false);
  };

  useEffect(()=>{ load(); },[taskId]);

  const addComment = async () => {
    if (!currentUserId) { toast.error('Usuário não autenticado'); return; }
    if (!text.trim()) return;
    const { error } = await supabase
      .from('gantt_task_comments')
      .insert({ task_id: taskId, author_id: currentUserId, content: text.trim() });
    if (error) { toast.error(error.message); return; }
    setText('');
    load();
  };

  return (
    <Card>
      <CardContent className="p-3 space-y-3">
        <div className="flex gap-2">
          <Input value={text} onChange={(e)=>setText(e.target.value)} placeholder="Escreva um comentário..." />
          <Button onClick={addComment} disabled={loading || !text.trim()}>Enviar</Button>
        </div>
        <div className="space-y-2 max-h-56 overflow-auto">
          {comments.length===0 && <p className="text-sm text-muted-foreground">Sem comentários ainda.</p>}
          {comments.map((c)=> (
            <div key={c.id} className="text-sm">
              <div className="text-muted-foreground text-xs">{new Date(c.created_at).toLocaleString()}</div>
              <div>{c.content}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
