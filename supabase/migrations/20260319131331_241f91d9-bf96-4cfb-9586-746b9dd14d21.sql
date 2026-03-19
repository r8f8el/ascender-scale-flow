
-- Add missing columns to documents table
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS filename text;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS content_type text;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.document_categories(id);

-- Add color to document_categories
ALTER TABLE public.document_categories ADD COLUMN IF NOT EXISTS color text DEFAULT '#808080';

-- Add missing columns to system_logs
ALTER TABLE public.system_logs ADD COLUMN IF NOT EXISTS user_name text;
ALTER TABLE public.system_logs ADD COLUMN IF NOT EXISTS type text;
ALTER TABLE public.system_logs ADD COLUMN IF NOT EXISTS level text DEFAULT 'info';

-- Add missing columns to project_schedules
ALTER TABLE public.project_schedules ADD COLUMN IF NOT EXISTS published boolean DEFAULT false;
ALTER TABLE public.project_schedules ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE public.project_schedules ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.client_profiles(id);

-- Add missing columns to schedule_phases
ALTER TABLE public.schedule_phases ADD COLUMN IF NOT EXISTS schedule_id uuid REFERENCES public.project_schedules(id);
ALTER TABLE public.schedule_phases ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.schedule_phases ADD COLUMN IF NOT EXISTS phase_order integer DEFAULT 0;

-- Make hours NOT required on time logs (since we use started_at/ended_at pattern too)
ALTER TABLE public.gantt_time_logs ALTER COLUMN hours DROP NOT NULL;
ALTER TABLE public.gantt_time_logs ALTER COLUMN hours SET DEFAULT 0;
ALTER TABLE public.kanban_time_logs ALTER COLUMN hours DROP NOT NULL;
ALTER TABLE public.kanban_time_logs ALTER COLUMN hours SET DEFAULT 0;

-- Add ticket_id foreign key to ticket_responses (fix the insert issue)
-- ticket_id already exists, the issue is the insert type checking
-- The problem is the generated types require an array for insert
-- This is actually a TS type issue, not a DB issue

-- Add approval_requests table referenced by ClientDocumentSync
CREATE TABLE IF NOT EXISTS public.approval_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by_user_id uuid REFERENCES auth.users(id),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated select on approval_requests" ON public.approval_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert on approval_requests" ON public.approval_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on approval_requests" ON public.approval_requests FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete on approval_requests" ON public.approval_requests FOR DELETE TO authenticated USING (true);
