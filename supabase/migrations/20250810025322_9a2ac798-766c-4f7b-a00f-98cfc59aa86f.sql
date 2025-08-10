-- 1) Comentários em tarefas Kanban
CREATE TABLE IF NOT EXISTS public.kanban_task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.kanban_tasks(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.kanban_task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all kanban comments"
ON public.kanban_task_comments
AS PERMISSIVE
FOR ALL
USING (is_admin_user_safe())
WITH CHECK (is_admin_user_safe());

CREATE POLICY "Users can view kanban comments for accessible tasks"
ON public.kanban_task_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.kanban_tasks kt
    JOIN public.kanban_boards kb ON kb.id = kt.board_id
    WHERE kt.id = kanban_task_comments.task_id
      AND (kb.client_id = auth.uid() OR is_admin_user_safe())
  )
);

CREATE POLICY "Users can insert own kanban comments on accessible tasks"
ON public.kanban_task_comments
FOR INSERT
WITH CHECK (
  author_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.kanban_tasks kt
    JOIN public.kanban_boards kb ON kb.id = kt.board_id
    WHERE kt.id = kanban_task_comments.task_id
      AND (kb.client_id = auth.uid() OR is_admin_user_safe())
  )
);

CREATE POLICY "Users can update/delete own kanban comments"
ON public.kanban_task_comments
FOR UPDATE USING (author_id = auth.uid() OR is_admin_user_safe())
WITH CHECK (author_id = auth.uid() OR is_admin_user_safe());

CREATE POLICY "Users can delete own kanban comments"
ON public.kanban_task_comments
FOR DELETE
USING (author_id = auth.uid() OR is_admin_user_safe());

-- trigger to maintain updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

DROP TRIGGER IF EXISTS trg_kanban_task_comments_updated_at ON public.kanban_task_comments;
CREATE TRIGGER trg_kanban_task_comments_updated_at
BEFORE UPDATE ON public.kanban_task_comments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Comentários em tarefas Gantt
CREATE TABLE IF NOT EXISTS public.gantt_task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.gantt_tasks(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gantt_task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all gantt comments"
ON public.gantt_task_comments
AS PERMISSIVE
FOR ALL
USING (is_admin_user_safe())
WITH CHECK (is_admin_user_safe());

CREATE POLICY "Users can view gantt comments for accessible tasks"
ON public.gantt_task_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.gantt_tasks gt
    JOIN public.gantt_projects gp ON gp.id = gt.project_id
    WHERE gt.id = gantt_task_comments.task_id
      AND (gp.client_id = auth.uid() OR is_admin_user_safe())
  )
);

CREATE POLICY "Users can insert own gantt comments on accessible tasks"
ON public.gantt_task_comments
FOR INSERT
WITH CHECK (
  author_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.gantt_tasks gt
    JOIN public.gantt_projects gp ON gp.id = gt.project_id
    WHERE gt.id = gantt_task_comments.task_id
      AND (gp.client_id = auth.uid() OR is_admin_user_safe())
  )
);

CREATE POLICY "Users can update/delete own gantt comments"
ON public.gantt_task_comments
FOR UPDATE USING (author_id = auth.uid() OR is_admin_user_safe())
WITH CHECK (author_id = auth.uid() OR is_admin_user_safe());

CREATE POLICY "Users can delete own gantt comments"
ON public.gantt_task_comments
FOR DELETE
USING (author_id = auth.uid() OR is_admin_user_safe());

DROP TRIGGER IF EXISTS trg_gantt_task_comments_updated_at ON public.gantt_task_comments;
CREATE TRIGGER trg_gantt_task_comments_updated_at
BEFORE UPDATE ON public.gantt_task_comments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Time logs (apontamento de horas) para Kanban
CREATE TABLE IF NOT EXISTS public.kanban_time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.kanban_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.kanban_time_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all kanban time logs"
ON public.kanban_time_logs
AS PERMISSIVE
FOR ALL
USING (is_admin_user_safe())
WITH CHECK (is_admin_user_safe());

CREATE POLICY "Users can view kanban time logs for accessible tasks"
ON public.kanban_time_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.kanban_tasks kt
    JOIN public.kanban_boards kb ON kb.id = kt.board_id
    WHERE kt.id = kanban_time_logs.task_id
      AND (kb.client_id = auth.uid() OR is_admin_user_safe())
  )
);

CREATE POLICY "Users can insert/update own kanban time logs"
ON public.kanban_time_logs
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.kanban_tasks kt
    JOIN public.kanban_boards kb ON kb.id = kt.board_id
    WHERE kt.id = kanban_time_logs.task_id
      AND (kb.client_id = auth.uid() OR is_admin_user_safe())
  )
);

CREATE POLICY "Users can update own kanban time logs"
ON public.kanban_time_logs
FOR UPDATE USING (user_id = auth.uid() OR is_admin_user_safe())
WITH CHECK (user_id = auth.uid() OR is_admin_user_safe());

CREATE POLICY "Users can delete own kanban time logs"
ON public.kanban_time_logs
FOR DELETE
USING (user_id = auth.uid() OR is_admin_user_safe());

DROP TRIGGER IF EXISTS trg_kanban_time_logs_updated_at ON public.kanban_time_logs;
CREATE TRIGGER trg_kanban_time_logs_updated_at
BEFORE UPDATE ON public.kanban_time_logs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.set_duration_minutes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL THEN
    NEW.duration_minutes := GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at)) / 60)::int);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_kanban_time_logs_duration ON public.kanban_time_logs;
CREATE TRIGGER trg_kanban_time_logs_duration
BEFORE INSERT OR UPDATE OF ended_at, started_at ON public.kanban_time_logs
FOR EACH ROW EXECUTE FUNCTION public.set_duration_minutes();

-- 4) Time logs para Gantt
CREATE TABLE IF NOT EXISTS public.gantt_time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.gantt_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gantt_time_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all gantt time logs"
ON public.gantt_time_logs
AS PERMISSIVE
FOR ALL
USING (is_admin_user_safe())
WITH CHECK (is_admin_user_safe());

CREATE POLICY "Users can view gantt time logs for accessible tasks"
ON public.gantt_time_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.gantt_tasks gt
    JOIN public.gantt_projects gp ON gp.id = gt.project_id
    WHERE gt.id = gantt_time_logs.task_id
      AND (gp.client_id = auth.uid() OR is_admin_user_safe())
  )
);

CREATE POLICY "Users can insert/update own gantt time logs"
ON public.gantt_time_logs
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.gantt_tasks gt
    JOIN public.gantt_projects gp ON gp.id = gt.project_id
    WHERE gt.id = gantt_time_logs.task_id
      AND (gp.client_id = auth.uid() OR is_admin_user_safe())
  )
);

CREATE POLICY "Users can update own gantt time logs"
ON public.gantt_time_logs
FOR UPDATE USING (user_id = auth.uid() OR is_admin_user_safe())
WITH CHECK (user_id = auth.uid() OR is_admin_user_safe());

CREATE POLICY "Users can delete own gantt time logs"
ON public.gantt_time_logs
FOR DELETE
USING (user_id = auth.uid() OR is_admin_user_safe());

DROP TRIGGER IF EXISTS trg_gantt_time_logs_updated_at ON public.gantt_time_logs;
CREATE TRIGGER trg_gantt_time_logs_updated_at
BEFORE UPDATE ON public.gantt_time_logs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_gantt_time_logs_duration ON public.gantt_time_logs;
CREATE TRIGGER trg_gantt_time_logs_duration
BEFORE INSERT OR UPDATE OF ended_at, started_at ON public.gantt_time_logs
FOR EACH ROW EXECUTE FUNCTION public.set_duration_minutes();

-- 5) Anexos e labels em Gantt
ALTER TABLE public.gantt_tasks
  ADD COLUMN IF NOT EXISTS attachments jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS labels jsonb NOT NULL DEFAULT '[]';

-- 6) Sprint para Kanban
CREATE TABLE IF NOT EXISTS public.kanban_sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.kanban_boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  goal TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.kanban_sprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all kanban sprints"
ON public.kanban_sprints
AS PERMISSIVE
FOR ALL
USING (is_admin_user_safe())
WITH CHECK (is_admin_user_safe());

CREATE POLICY "Clients can view sprints of their boards"
ON public.kanban_sprints
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.kanban_boards kb
    WHERE kb.id = kanban_sprints.board_id
      AND (kb.client_id = auth.uid() OR is_admin_user_safe())
  )
);

ALTER TABLE public.kanban_tasks
  ADD COLUMN IF NOT EXISTS sprint_id UUID REFERENCES public.kanban_sprints(id) ON DELETE SET NULL;

-- 7) Enforce WIP limit em Kanban
CREATE OR REPLACE FUNCTION public.enforce_wip_limit()
RETURNS TRIGGER AS $$
DECLARE
  target_column UUID;
  current_count INT;
  wip_limit INT;
BEGIN
  target_column := COALESCE(NEW.column_id, OLD.column_id);
  SELECT COUNT(*) INTO current_count FROM public.kanban_tasks t WHERE t.column_id = target_column AND (TG_OP = 'UPDATE' AND t.id <> NEW.id OR TG_OP = 'INSERT');
  SELECT kc.wip_limit INTO wip_limit FROM public.kanban_columns kc WHERE kc.id = target_column;
  IF wip_limit IS NOT NULL AND current_count >= wip_limit THEN
    RAISE EXCEPTION 'WIP limit excedido para esta coluna (limite: %, atual: %)', wip_limit, current_count;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_wip_insert ON public.kanban_tasks;
CREATE TRIGGER trg_enforce_wip_insert
BEFORE INSERT ON public.kanban_tasks
FOR EACH ROW EXECUTE FUNCTION public.enforce_wip_limit();

DROP TRIGGER IF EXISTS trg_enforce_wip_update ON public.kanban_tasks;
CREATE TRIGGER trg_enforce_wip_update
BEFORE UPDATE OF column_id ON public.kanban_tasks
FOR EACH ROW EXECUTE FUNCTION public.enforce_wip_limit();

-- 8) Atualizar progresso do projeto Gantt com base nas tarefas
CREATE OR REPLACE FUNCTION public.update_gantt_project_progress()
RETURNS TRIGGER AS $$
DECLARE
  new_progress INT;
BEGIN
  SELECT COALESCE(ROUND(AVG(progress))::int, 0) INTO new_progress
  FROM public.gantt_tasks WHERE project_id = COALESCE(NEW.project_id, OLD.project_id);

  UPDATE public.gantt_projects
  SET progress = new_progress, updated_at = now()
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_gantt_tasks_progress_ins ON public.gantt_tasks;
CREATE TRIGGER trg_gantt_tasks_progress_ins
AFTER INSERT ON public.gantt_tasks
FOR EACH ROW EXECUTE FUNCTION public.update_gantt_project_progress();

DROP TRIGGER IF EXISTS trg_gantt_tasks_progress_upd ON public.gantt_tasks;
CREATE TRIGGER trg_gantt_tasks_progress_upd
AFTER UPDATE OF progress, project_id ON public.gantt_tasks
FOR EACH ROW EXECUTE FUNCTION public.update_gantt_project_progress();

DROP TRIGGER IF EXISTS trg_gantt_tasks_progress_del ON public.gantt_tasks;
CREATE TRIGGER trg_gantt_tasks_progress_del
AFTER DELETE ON public.gantt_tasks
FOR EACH ROW EXECUTE FUNCTION public.update_gantt_project_progress();

-- 9) Notificações de atribuição (Kanban)
DROP TRIGGER IF EXISTS trg_notify_kanban_assignment_ins ON public.kanban_tasks;
CREATE TRIGGER trg_notify_kanban_assignment_ins
AFTER INSERT ON public.kanban_tasks
FOR EACH ROW
WHEN (NEW.assigned_to IS NOT NULL)
EXECUTE FUNCTION public.notify_task_assignment();

DROP TRIGGER IF EXISTS trg_notify_kanban_assignment_upd ON public.kanban_tasks;
CREATE TRIGGER trg_notify_kanban_assignment_upd
AFTER UPDATE OF assigned_to ON public.kanban_tasks
FOR EACH ROW
WHEN (NEW.assigned_to IS DISTINCT FROM OLD.assigned_to AND NEW.assigned_to IS NOT NULL)
EXECUTE FUNCTION public.notify_task_assignment();

-- 10) Notificações de atribuição (Gantt)
CREATE OR REPLACE FUNCTION public.notify_gantt_task_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_to IS NOT NULL AND (TG_OP = 'INSERT' OR (OLD.assigned_to IS DISTINCT FROM NEW.assigned_to)) THEN
    INSERT INTO public.notifications (recipient_email, subject, message, type)
    SELECT 
      c.email,
      'Nova tarefa atribuída (Gantt): ' || NEW.name,
      'Você foi designado para a tarefa "' || NEW.name || '". Prazo: ' || COALESCE(NEW.end_date::text, 'Não definido'),
      'task_assignment'
    FROM public.collaborators c
    WHERE c.id = NEW.assigned_to;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

DROP TRIGGER IF EXISTS trg_notify_gantt_assignment_ins ON public.gantt_tasks;
CREATE TRIGGER trg_notify_gantt_assignment_ins
AFTER INSERT ON public.gantt_tasks
FOR EACH ROW
WHEN (NEW.assigned_to IS NOT NULL)
EXECUTE FUNCTION public.notify_gantt_task_assignment();

DROP TRIGGER IF EXISTS trg_notify_gantt_assignment_upd ON public.gantt_tasks;
CREATE TRIGGER trg_notify_gantt_assignment_upd
AFTER UPDATE OF assigned_to ON public.gantt_tasks
FOR EACH ROW
WHEN (NEW.assigned_to IS DISTINCT FROM OLD.assigned_to AND NEW.assigned_to IS NOT NULL)
EXECUTE FUNCTION public.notify_gantt_task_assignment();

-- 11) Índices
CREATE INDEX IF NOT EXISTS idx_kanban_task_comments_task_id ON public.kanban_task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_gantt_task_comments_task_id ON public.gantt_task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_kanban_time_logs_task_id ON public.kanban_time_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_gantt_time_logs_task_id ON public.gantt_time_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_kanban_tasks_column_id ON public.kanban_tasks(column_id);
CREATE INDEX IF NOT EXISTS idx_gantt_tasks_project_id ON public.gantt_tasks(project_id);
