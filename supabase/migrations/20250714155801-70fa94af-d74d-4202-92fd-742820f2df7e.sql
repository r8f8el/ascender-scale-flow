-- Update invite_team_member function to send email after creating invitation
CREATE OR REPLACE FUNCTION public.invite_team_member(
  p_email TEXT,
  p_company_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_id UUID;
  company_name TEXT;
  inviter_name TEXT;
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

  -- Send invitation email via edge function
  PERFORM net.http_post(
    url := 'https://klcfzhpttcsjuynumzgi.supabase.co/functions/v1/send-invitation-email',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := json_build_object(
      'invitedEmail', p_email,
      'companyName', COALESCE(company_name, 'Empresa'),
      'inviterName', COALESCE(inviter_name, 'Administrador'),
      'invitationId', invitation_id::text
    )::jsonb
  );

  RETURN invitation_id;
END;
$$;