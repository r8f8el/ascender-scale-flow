
-- Add missing columns to projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'medium';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS budget numeric;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS progress integer NOT NULL DEFAULT 0;

-- Add missing columns to tasks
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS estimated_hours numeric;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS actual_hours numeric NOT NULL DEFAULT 0;

-- Add missing columns to client_documents
ALTER TABLE public.client_documents ADD COLUMN IF NOT EXISTS content_type text;
ALTER TABLE public.client_documents ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.client_documents ADD COLUMN IF NOT EXISTS uploaded_by_admin_id uuid REFERENCES auth.users(id);
ALTER TABLE public.client_documents ADD COLUMN IF NOT EXISTS uploaded_at timestamptz NOT NULL DEFAULT now();

-- Add missing columns to files
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS size bigint;
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS type text;
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS client_name text;
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS uploaded_at timestamptz NOT NULL DEFAULT now();

-- Add missing columns to ticket_responses
ALTER TABLE public.ticket_responses ADD COLUMN IF NOT EXISTS is_internal_note boolean NOT NULL DEFAULT false;
ALTER TABLE public.ticket_responses ADD COLUMN IF NOT EXISTS message text;
ALTER TABLE public.ticket_responses ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE public.ticket_responses ADD COLUMN IF NOT EXISTS admin_id uuid REFERENCES public.admin_profiles(id);

-- Add missing columns to client_profiles  
ALTER TABLE public.client_profiles ADD COLUMN IF NOT EXISTS pode_aprovar boolean NOT NULL DEFAULT false;

-- Add missing columns to time log tables (started_at, ended_at, duration_minutes, note)
ALTER TABLE public.gantt_time_logs ADD COLUMN IF NOT EXISTS started_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.gantt_time_logs ADD COLUMN IF NOT EXISTS ended_at timestamptz;
ALTER TABLE public.gantt_time_logs ADD COLUMN IF NOT EXISTS duration_minutes integer;
ALTER TABLE public.gantt_time_logs ADD COLUMN IF NOT EXISTS note text;

ALTER TABLE public.kanban_time_logs ADD COLUMN IF NOT EXISTS started_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.kanban_time_logs ADD COLUMN IF NOT EXISTS ended_at timestamptz;
ALTER TABLE public.kanban_time_logs ADD COLUMN IF NOT EXISTS duration_minutes integer;
ALTER TABLE public.kanban_time_logs ADD COLUMN IF NOT EXISTS note text;

-- Create cargos table referenced by SeletorAprovadores
CREATE TABLE IF NOT EXISTS public.cargos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  nivel integer NOT NULL DEFAULT 1,
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cargos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated select on cargos" ON public.cargos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert on cargos" ON public.cargos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on cargos" ON public.cargos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete on cargos" ON public.cargos FOR DELETE TO authenticated USING (true);

-- Create empresa_funcionarios table
CREATE TABLE IF NOT EXISTS public.empresa_funcionarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid REFERENCES public.client_profiles(id),
  funcionario_id uuid REFERENCES public.client_profiles(id),
  cargo_id uuid REFERENCES public.cargos(id),
  pode_aprovar boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.empresa_funcionarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated select on empresa_funcionarios" ON public.empresa_funcionarios FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert on empresa_funcionarios" ON public.empresa_funcionarios FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on empresa_funcionarios" ON public.empresa_funcionarios FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete on empresa_funcionarios" ON public.empresa_funcionarios FOR DELETE TO authenticated USING (true);

-- Create secure RPC functions referenced by the code
CREATE OR REPLACE FUNCTION public.is_admin_user_secure()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin_secure()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_company()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT company FROM public.client_profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- Create invite_team_member_secure function
CREATE OR REPLACE FUNCTION public.invite_team_member_secure(
  p_email text,
  p_inviter_name text,
  p_company_id uuid,
  p_company_name text DEFAULT NULL,
  p_message text DEFAULT NULL,
  p_hierarchy_level_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_invite_id uuid;
  v_token text;
BEGIN
  v_token := gen_random_uuid()::text;
  
  INSERT INTO public.team_invitations (
    email, inviter_name, company_id, company_name, message, token, status, expires_at
  ) VALUES (
    p_email, p_inviter_name, p_company_id, p_company_name, p_message, v_token, 'pending', now() + interval '7 days'
  )
  RETURNING id INTO v_invite_id;
  
  RETURN v_invite_id;
END;
$$;
