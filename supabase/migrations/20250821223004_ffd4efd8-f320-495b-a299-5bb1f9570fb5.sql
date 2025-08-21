
-- Corrigir a URL do convite para usar a rota correta de cadastro seguro
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

  -- Check if invitation already exists and is pending
  IF EXISTS (
    SELECT 1 FROM public.team_invitations 
    WHERE email = p_email
    AND status = 'pending'
    AND company_id = company_record.id
    AND expires_at > now()
  ) THEN
    RAISE EXCEPTION 'Já existe um convite pendente para este email nesta empresa';
  END IF;

  -- Generate secure token using MD5 with random elements (fallback method)
  secure_token := md5(random()::text || clock_timestamp()::text || p_email || company_record.id::text);
  
  -- Generate invite URL pointing to the correct secure signup page
  invite_url := 'https://loving-lacework-434619.lovableproject.com/convite-seguro?token=' || secure_token;

  -- Create invitation record
  INSERT INTO public.team_invitations (
    email,
    inviter_name,
    invited_by_name,
    company_id,
    company_name,
    token,
    message,
    expires_at,
    status,
    hierarchy_level_id
  ) VALUES (
    p_email,
    company_record.name,
    company_record.name,
    company_record.id,
    COALESCE(company_record.company, company_record.name),
    secure_token,
    'Você foi convidado para se juntar à nossa equipe na plataforma Ascalate',
    now() + interval '7 days',
    'pending',
    p_hierarchy_level_id
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
  )
  ON CONFLICT (company_id, invited_email) 
  DO UPDATE SET
    name = EXCLUDED.name,
    hierarchy_level_id = EXCLUDED.hierarchy_level_id,
    invited_by = EXCLUDED.invited_by,
    status = 'pending',
    updated_at = now();

  -- Send invitation email via edge function
  PERFORM net.http_post(
    url := 'https://klcfzhpttcsjuynumzgi.supabase.co/functions/v1/send-invitation-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || coalesce(
        current_setting('request.jwt.claims', true)::json->>'token',
        current_setting('request.headers', true)::json->>'authorization'
      )
    ),
    body := jsonb_build_object(
      'to', p_email,
      'inviterName', company_record.name,
      'invitedName', p_name,
      'companyName', COALESCE(company_record.company, company_record.name),
      'inviteUrl', invite_url,
      'message', 'Você foi convidado para se juntar à nossa equipe na plataforma Ascalate',
      'hierarchyLevel', (
        SELECT hl.name 
        FROM hierarchy_levels hl 
        WHERE hl.id = p_hierarchy_level_id
      )
    )
  );

  RETURN invitation_id;
END;
$function$;
