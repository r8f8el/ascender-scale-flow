
-- Fix the team_invitations table structure
ALTER TABLE public.team_invitations 
ALTER COLUMN inviter_id DROP NOT NULL;

-- Add company_id if it doesn't exist
ALTER TABLE public.team_invitations 
ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.client_profiles(id);

-- Update the invite_team_member function to handle the inviter_id properly
CREATE OR REPLACE FUNCTION public.invite_team_member_secure(p_email text, p_name text, p_hierarchy_level_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  invitation_id uuid;
  company_record public.client_profiles%ROWTYPE;
  secure_token text;
  invite_url text;
BEGIN
  -- Get the current user's company info
  SELECT * INTO company_record
  FROM public.client_profiles 
  WHERE id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Perfil do usuário não encontrado';
  END IF;

  -- Check if invitation already exists
  IF EXISTS (
    SELECT 1 FROM public.team_invitations 
    WHERE email = p_email
    AND status = 'pending'
    AND company_id = company_record.id
  ) THEN
    RAISE EXCEPTION 'Já existe um convite pendente para este email nesta empresa';
  END IF;

  -- Generate secure token
  secure_token := encode(gen_random_bytes(32), 'hex');
  
  -- Generate invite URL
  invite_url := 'https://klcfzhpttcsjuynumzgi.supabase.co/convite-seguro?token=' || secure_token;

  -- Create invitation
  INSERT INTO public.team_invitations (
    email,
    inviter_name,
    company_id,
    token,
    message,
    expires_at,
    status
  ) VALUES (
    p_email,
    company_record.name,
    company_record.id,
    secure_token,
    'Você foi convidado para se juntar à nossa equipe na plataforma Ascalate',
    now() + interval '7 days',
    'pending'
  )
  RETURNING id INTO invitation_id;

  -- Create team member record
  INSERT INTO public.team_members (
    company_id, 
    invited_email, 
    name,
    hierarchy_level_id,
    invited_by,
    status
  ) VALUES (
    company_record.id,
    p_email,
    p_name,
    p_hierarchy_level_id,
    auth.uid(),
    'pending'
  );

  -- Send invitation email
  PERFORM net.http_post(
    url := 'https://klcfzhpttcsjuynumzgi.supabase.co/functions/v1/send-invitation-email',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('request.headers')::json->>'authorization' || '"}'::jsonb,
    body := json_build_object(
      'to', p_email,
      'inviterName', company_record.name,
      'invitedName', p_name,
      'companyName', COALESCE(company_record.company, company_record.name),
      'inviteUrl', invite_url,
      'message', 'Você foi convidado para se juntar à nossa equipe na plataforma Ascalate'
    )::jsonb
  );

  RETURN invitation_id;
END;
$function$;
