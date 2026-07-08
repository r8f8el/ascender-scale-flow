
-- Add content_type to ticket_attachments
ALTER TABLE public.ticket_attachments ADD COLUMN IF NOT EXISTS content_type text;

-- Add can_manage_permissions to hierarchy_levels
ALTER TABLE public.hierarchy_levels ADD COLUMN IF NOT EXISTS can_manage_permissions boolean NOT NULL DEFAULT false;

-- Add missing columns to company_teams
ALTER TABLE public.company_teams ADD COLUMN IF NOT EXISTS invited_email text;
ALTER TABLE public.company_teams ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Create invite_team_member function (non-secure version)
CREATE OR REPLACE FUNCTION public.invite_team_member(
  p_email text,
  p_name text,
  p_hierarchy_level_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_invite_id uuid;
  v_company text;
  v_inviter_name text;
BEGIN
  SELECT company, name INTO v_company, v_inviter_name
  FROM public.client_profiles
  WHERE id = auth.uid();

  INSERT INTO public.team_invitations (
    email, inviter_name, company_id, company_name, token, status, expires_at
  ) VALUES (
    p_email, COALESCE(v_inviter_name, 'Admin'), auth.uid(), v_company,
    gen_random_uuid()::text, 'pending', now() + interval '7 days'
  )
  RETURNING id INTO v_invite_id;

  INSERT INTO public.team_members (
    invited_email, name, company_id, status, hierarchy_level_id, invited_by
  ) VALUES (
    p_email, p_name, auth.uid(), 'pending', p_hierarchy_level_id, v_inviter_name
  );

  RETURN v_invite_id;
END;
$$;

-- Update invite_team_member_secure to accept p_name parameter
DROP FUNCTION IF EXISTS public.invite_team_member_secure(text, text, uuid, text, text, uuid);
CREATE OR REPLACE FUNCTION public.invite_team_member_secure(
  p_email text,
  p_inviter_name text DEFAULT NULL,
  p_company_id uuid DEFAULT NULL,
  p_company_name text DEFAULT NULL,
  p_message text DEFAULT NULL,
  p_hierarchy_level_id uuid DEFAULT NULL,
  p_name text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_invite_id uuid;
  v_inviter text;
  v_company_id uuid;
  v_company_name text;
BEGIN
  -- Get inviter info from current user if not provided
  IF p_inviter_name IS NULL THEN
    SELECT name INTO v_inviter FROM public.client_profiles WHERE id = auth.uid();
  ELSE
    v_inviter := p_inviter_name;
  END IF;

  IF p_company_id IS NULL THEN
    v_company_id := auth.uid();
  ELSE
    v_company_id := p_company_id;
  END IF;

  IF p_company_name IS NULL THEN
    SELECT company INTO v_company_name FROM public.client_profiles WHERE id = auth.uid();
  ELSE
    v_company_name := p_company_name;
  END IF;

  INSERT INTO public.team_invitations (
    email, inviter_name, company_id, company_name, message, token, status, expires_at, hierarchy_level_id
  ) VALUES (
    p_email, COALESCE(v_inviter, 'Admin'), v_company_id, v_company_name, p_message,
    gen_random_uuid()::text, 'pending', now() + interval '7 days', p_hierarchy_level_id
  )
  RETURNING id INTO v_invite_id;

  RETURN v_invite_id;
END;
$$;
