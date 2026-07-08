
-- Remove duplicate hierarchy levels, keeping the first one per (level, name)
DELETE FROM hierarchy_levels
WHERE id NOT IN (
  SELECT DISTINCT ON (level, name) id
  FROM hierarchy_levels
  ORDER BY level, name, created_at ASC
);

-- Fix accept_team_invitation to properly link user to company
CREATE OR REPLACE FUNCTION public.accept_team_invitation(p_token text, p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_invitation record;
  v_company_name text;
  v_inviter_profile record;
BEGIN
  SELECT * INTO v_invitation
  FROM public.team_invitations
  WHERE token = p_token
    AND status = 'pending'
    AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  SELECT company, name INTO v_inviter_profile
  FROM public.client_profiles
  WHERE id = v_invitation.company_id;
  
  v_company_name := COALESCE(v_inviter_profile.company, v_inviter_profile.name, 'Empresa');
  
  UPDATE public.team_invitations
  SET status = 'accepted', accepted_at = now()
  WHERE id = v_invitation.id;
  
  UPDATE public.client_profiles
  SET 
    company = v_company_name,
    hierarchy_level_id = v_invitation.hierarchy_level_id,
    is_primary_contact = false
  WHERE id = p_user_id;
  
  UPDATE public.team_members
  SET 
    user_id = p_user_id,
    status = 'active',
    joined_at = now(),
    email = (SELECT email FROM public.client_profiles WHERE id = p_user_id)
  WHERE company_id = v_invitation.company_id
    AND invited_email = v_invitation.email
    AND status = 'pending';
  
  IF NOT FOUND THEN
    INSERT INTO public.team_members (
      user_id, company_id, invited_email, name, status, 
      hierarchy_level_id, invited_by, joined_at, is_primary_contact
    )
    SELECT 
      p_user_id, 
      v_invitation.company_id, 
      v_invitation.email,
      cp.name,
      'active',
      v_invitation.hierarchy_level_id,
      v_invitation.inviter_name,
      now(),
      false
    FROM public.client_profiles cp
    WHERE cp.id = p_user_id;
  END IF;
  
  RETURN true;
END;
$function$;

-- Fix invite_team_member_secure to also create team_members record
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
AS $function$
DECLARE
  v_invite_id uuid;
  v_inviter text;
  v_company_id uuid;
  v_company_name text;
BEGIN
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

  INSERT INTO public.team_members (
    company_id, invited_email, name, status, hierarchy_level_id, invited_by
  ) VALUES (
    v_company_id, p_email, COALESCE(p_name, p_email), 'pending', p_hierarchy_level_id, v_inviter
  )
  ON CONFLICT DO NOTHING;

  RETURN v_invite_id;
END;
$function$;
