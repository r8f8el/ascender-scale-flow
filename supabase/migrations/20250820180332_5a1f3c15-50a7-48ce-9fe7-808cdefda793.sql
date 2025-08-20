
-- Atualizar a tabela team_invitations para incluir campos necessários
ALTER TABLE team_invitations ADD COLUMN IF NOT EXISTS hierarchy_level_id UUID REFERENCES hierarchy_levels(id);
ALTER TABLE team_invitations ADD COLUMN IF NOT EXISTS invited_by_name TEXT;
ALTER TABLE team_invitations ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email_status ON team_invitations(email, status);

-- Atualizar a função de convite para ser mais robusta
CREATE OR REPLACE FUNCTION public.invite_team_member_secure(
  p_email text, 
  p_name text, 
  p_hierarchy_level_id uuid
) 
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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

  -- Generate secure token (64 characters)
  secure_token := encode(gen_random_bytes(32), 'hex');
  
  -- Generate invite URL pointing to the signup page
  invite_url := current_setting('app.base_url', true) || '/convite-equipe?token=' || secure_token;
  IF invite_url IS NULL OR invite_url = '/convite-equipe?token=' || secure_token THEN
    invite_url := 'https://klcfzhpttcsjuynumzgi.supabase.co/convite-equipe?token=' || secure_token;
  END IF;

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
$$;

-- Função para processar o aceite do convite
CREATE OR REPLACE FUNCTION public.accept_team_invitation(p_token text, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invitation_record public.team_invitations%ROWTYPE;
  company_record public.client_profiles%ROWTYPE;
BEGIN
  -- Get invitation
  SELECT * INTO invitation_record
  FROM public.team_invitations
  WHERE token = p_token
  AND status = 'pending'
  AND expires_at > now();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Convite inválido ou expirado';
  END IF;
  
  -- Obter dados da empresa
  SELECT * INTO company_record
  FROM public.client_profiles
  WHERE id = invitation_record.company_id;
  
  -- Atualizar status do convite
  UPDATE public.team_invitations
  SET status = 'accepted',
      accepted_at = now()
  WHERE id = invitation_record.id;
  
  -- Atualizar membro da equipe
  UPDATE public.team_members
  SET user_id = p_user_id,
      status = 'active',
      joined_at = now(),
      updated_at = now()
  WHERE company_id = invitation_record.company_id
  AND invited_email = invitation_record.email;
  
  -- Criar/atualizar perfil do cliente
  INSERT INTO public.client_profiles (
    id,
    name,
    email,
    company,
    hierarchy_level_id,
    is_primary_contact
  ) VALUES (
    p_user_id,
    invitation_record.inviter_name,
    invitation_record.email,
    company_record.company,
    invitation_record.hierarchy_level_id,
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    company = EXCLUDED.company,
    hierarchy_level_id = EXCLUDED.hierarchy_level_id,
    is_primary_contact = false;
  
  -- Adicionar ao fluxo de aprovadores se necessário
  INSERT INTO public.fluxo_aprovadores (
    cliente_id,
    aprovador_id,
    nome_aprovador,
    email_aprovador,
    ordem
  )
  SELECT 
    invitation_record.company_id,
    p_user_id,
    invitation_record.inviter_name,
    invitation_record.email,
    COALESCE(MAX(fa.ordem), 0) + 1
  FROM public.fluxo_aprovadores fa
  WHERE fa.cliente_id = invitation_record.company_id
  AND EXISTS (
    SELECT 1 FROM hierarchy_levels hl
    WHERE hl.id = invitation_record.hierarchy_level_id
    AND hl.can_approve = true
  );
  
  RETURN true;
END;
$$;
