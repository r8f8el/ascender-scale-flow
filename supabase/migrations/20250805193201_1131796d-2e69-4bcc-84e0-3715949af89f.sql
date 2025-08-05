-- Melhorar função de convite de membro da equipe
CREATE OR REPLACE FUNCTION public.invite_team_member(p_email text, p_company_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  invitation_id UUID;
  company_name TEXT;
  inviter_name TEXT;
  function_url TEXT;
BEGIN
  -- Check if the authenticated user is the primary contact of the company
  IF NOT EXISTS (
    SELECT 1 FROM public.client_profiles 
    WHERE id = auth.uid()
    AND id = p_company_id
    AND is_primary_contact = true
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only primary contacts can invite team members';
  END IF;

  -- Check if email is already invited to this company
  IF EXISTS (
    SELECT 1 FROM public.company_teams 
    WHERE company_id = p_company_id 
    AND invited_email = p_email
    AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'User already invited to this company';
  END IF;

  -- Check if user with this email already exists and is active in this company
  IF EXISTS (
    SELECT 1 FROM public.company_teams ct
    JOIN public.client_profiles cp ON ct.member_id = cp.id
    WHERE ct.company_id = p_company_id 
    AND cp.email = p_email
    AND ct.status = 'active'
  ) THEN
    RAISE EXCEPTION 'User with this email is already a member of this company';
  END IF;

  -- Get company and inviter information
  SELECT company, name INTO company_name, inviter_name
  FROM public.client_profiles 
  WHERE id = p_company_id;

  -- Create invitation record with email only (member_id will be NULL initially)
  INSERT INTO public.company_teams (company_id, invited_email, invited_by, status, role)
  VALUES (
    p_company_id,
    p_email,
    auth.uid(),
    'pending',
    'member'
  )
  RETURNING id INTO invitation_id;

  -- Get the function URL from environment or use default
  function_url := 'https://klcfzhpttcsjuynumzgi.supabase.co/functions/v1/send-invitation-email';

  -- Send invitation email via edge function using the correct pg_net
  BEGIN
    PERFORM net.http_post(
      url := function_url,
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('request.headers')::json->>'authorization' || '"}'::jsonb,
      body := json_build_object(
        'invitedEmail', p_email,
        'companyName', COALESCE(company_name, 'Empresa'),
        'inviterName', COALESCE(inviter_name, 'Administrador'),
        'invitationId', invitation_id::text
      )::jsonb
    );
  EXCEPTION WHEN OTHERS THEN
    -- Se o envio de email falhar, não cancelar o convite
    -- Apenas log o erro e continue
    RAISE WARNING 'Failed to send invitation email: %', SQLERRM;
  END;

  RETURN invitation_id;
END;
$function$;