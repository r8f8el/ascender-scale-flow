
-- Add missing columns
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS invited_at timestamptz DEFAULT now();
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS is_primary_contact boolean DEFAULT false;

-- Add hierarchy_level_id to team_invitations
ALTER TABLE public.team_invitations ADD COLUMN IF NOT EXISTS hierarchy_level_id uuid REFERENCES public.hierarchy_levels(id);

-- Add ticket_responses missing foreign key to ticket_attachments
ALTER TABLE public.ticket_attachments ADD COLUMN IF NOT EXISTS response_id uuid REFERENCES public.ticket_responses(id);

-- Create get_client_profile_bypass function
CREATE OR REPLACE FUNCTION public.get_client_profile_bypass(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  phone text,
  company text,
  cnpj text,
  is_primary_contact boolean,
  hierarchy_level_id uuid,
  pode_aprovar boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id, name, email, phone, company, cnpj, is_primary_contact, hierarchy_level_id, pode_aprovar, created_at, updated_at
  FROM public.client_profiles
  WHERE id = p_user_id
  LIMIT 1;
$$;

-- Create get_invitation_by_token function
CREATE OR REPLACE FUNCTION public.get_invitation_by_token(p_token text)
RETURNS TABLE (
  invitation_id uuid,
  email text,
  company_id uuid,
  company_name text,
  inviter_name text,
  message text,
  hierarchy_level_id uuid,
  is_valid boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    ti.id as invitation_id,
    ti.email,
    ti.company_id,
    ti.company_name,
    ti.inviter_name,
    ti.message,
    ti.hierarchy_level_id,
    (ti.status = 'pending' AND ti.expires_at > now()) as is_valid
  FROM public.team_invitations ti
  WHERE ti.token = p_token;
$$;

-- Create log_system_action function
CREATE OR REPLACE FUNCTION public.log_system_action(
  p_user_name text,
  p_type text,
  p_ip_address text,
  p_action text,
  p_details text DEFAULT NULL,
  p_level text DEFAULT 'info'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.system_logs (action, details, user_id, user_email, ip_address)
  VALUES (
    p_action,
    COALESCE(p_details, ''),
    auth.uid(),
    p_user_name,
    p_ip_address
  );
END;
$$;

-- Create check_rate_limit function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id uuid,
  p_action_type text,
  p_max_attempts integer DEFAULT 5,
  p_window_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.system_logs
  WHERE user_id = p_user_id
    AND action = p_action_type
    AND created_at > now() - (p_window_minutes || ' minutes')::interval;
  
  RETURN v_count < p_max_attempts;
END;
$$;

-- Create accept_team_invitation function
CREATE OR REPLACE FUNCTION public.accept_team_invitation(
  p_token text,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_invitation record;
BEGIN
  SELECT * INTO v_invitation
  FROM public.team_invitations
  WHERE token = p_token
    AND status = 'pending'
    AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  UPDATE public.team_invitations
  SET status = 'accepted', accepted_at = now()
  WHERE id = v_invitation.id;
  
  RETURN true;
END;
$$;
