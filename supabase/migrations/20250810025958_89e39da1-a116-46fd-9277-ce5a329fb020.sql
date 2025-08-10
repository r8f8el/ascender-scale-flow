begin;

-- Ensure full row data for realtime
ALTER TABLE public.kanban_task_comments REPLICA IDENTITY FULL;
ALTER TABLE public.gantt_task_comments REPLICA IDENTITY FULL;
ALTER TABLE public.kanban_time_logs REPLICA IDENTITY FULL;
ALTER TABLE public.gantt_time_logs REPLICA IDENTITY FULL;

-- Add tables to supabase_realtime publication idempotently
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'kanban_task_comments'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.kanban_task_comments';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'gantt_task_comments'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.gantt_task_comments';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'kanban_time_logs'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.kanban_time_logs';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'gantt_time_logs'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.gantt_time_logs';
  END IF;
END $$;

-- Harden functions with SECURITY DEFINER and safe search_path
CREATE OR REPLACE FUNCTION public.set_duration_minutes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL THEN
    NEW.duration_minutes := GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at)) / 60)::int);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

CREATE OR REPLACE FUNCTION public.enforce_wip_limit()
RETURNS TRIGGER AS $$
DECLARE
  target_column UUID;
  current_count INT;
  wip_limit INT;
BEGIN
  target_column := COALESCE(NEW.column_id, OLD.column_id);
  SELECT COUNT(*) INTO current_count FROM public.kanban_tasks t 
  WHERE t.column_id = target_column AND (TG_OP = 'UPDATE' AND t.id <> NEW.id OR TG_OP = 'INSERT');

  SELECT kc.wip_limit INTO wip_limit FROM public.kanban_columns kc WHERE kc.id = target_column;
  IF wip_limit IS NOT NULL AND current_count >= wip_limit THEN
    RAISE EXCEPTION 'WIP limit excedido para esta coluna (limite: %, atual: %)', wip_limit, current_count;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

commit;