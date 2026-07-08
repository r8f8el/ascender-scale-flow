
-- Criar função para verificar se usuário tem acesso via equipe
CREATE OR REPLACE FUNCTION public.has_team_access(p_user_id uuid, p_target_company text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM team_members tm
    JOIN client_profiles cp ON cp.id = tm.company_id
    WHERE tm.user_id = p_user_id
      AND tm.status = 'active'
      AND cp.company = p_target_company
  ) OR EXISTS (
    SELECT 1
    FROM client_profiles cp
    WHERE cp.id = p_user_id
      AND cp.company = p_target_company
  );
$function$;

-- Atualizar função has_company_access para incluir membros da equipe
CREATE OR REPLACE FUNCTION public.has_company_access(p_user_id uuid, p_target_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM client_profiles cp1
    JOIN client_profiles cp2 ON cp1.company = cp2.company
    WHERE cp1.id = p_user_id
      AND cp2.id = p_target_user_id
      AND cp1.company IS NOT NULL
      AND cp2.company IS NOT NULL
  ) OR EXISTS (
    SELECT 1
    FROM team_members tm
    JOIN client_profiles cp ON cp.id = tm.company_id
    WHERE tm.user_id = p_user_id
      AND tm.status = 'active'
      AND cp.id = p_target_user_id
  ) OR p_user_id = p_target_user_id;
$function$;

-- Melhorar função accept_team_invitation para criar automaticamente dados FPA
CREATE OR REPLACE FUNCTION public.accept_team_invitation(p_token text, p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invitation_record public.team_invitations%ROWTYPE;
  company_record public.client_profiles%ROWTYPE;
  fpa_client_record public.fpa_clients%ROWTYPE;
  result jsonb;
BEGIN
  -- Log security event
  PERFORM log_security_event('accept_team_invitation', 'team_invitation', p_token, 
    jsonb_build_object('user_id', p_user_id, 'ip', inet_client_addr()));

  -- Get invitation using secure validation
  SELECT * INTO invitation_record
  FROM public.team_invitations
  WHERE token = p_token
  AND status = 'pending'
  AND expires_at > now();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Convite inválido ou expirado';
  END IF;
  
  -- Get company record
  SELECT * INTO company_record
  FROM public.client_profiles
  WHERE id = invitation_record.company_id;
  
  -- Update invitation status
  UPDATE public.team_invitations
  SET status = 'accepted',
      accepted_at = now()
  WHERE id = invitation_record.id;
  
  -- Update team member record
  UPDATE public.team_members
  SET user_id = p_user_id,
      status = 'active',
      joined_at = now(),
      updated_at = now()
  WHERE company_id = invitation_record.company_id
  AND invited_email = invitation_record.email;
  
  -- Create or update client profile
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

  -- Check if FPA client exists for the company
  SELECT * INTO fpa_client_record
  FROM public.fpa_clients
  WHERE client_profile_id = invitation_record.company_id;

  -- If FPA client doesn't exist, create one
  IF NOT FOUND THEN
    INSERT INTO public.fpa_clients (
      client_profile_id,
      company_name,
      onboarding_completed,
      current_phase
    ) VALUES (
      invitation_record.company_id,
      COALESCE(company_record.company, company_record.name),
      false,
      1
    );
  END IF;

  -- Build result
  result := jsonb_build_object(
    'success', true,
    'company_name', company_record.company,
    'user_id', p_user_id,
    'message', 'Convite aceito com sucesso'
  );
  
  RETURN result;
END;
$function$;

-- Atualizar políticas RLS para documentos para incluir membros da equipe
DROP POLICY IF EXISTS "Users can view company documents" ON public.client_documents;
CREATE POLICY "Users can view company documents" ON public.client_documents
FOR SELECT USING (
  is_admin_user_secure() OR 
  has_company_access(auth.uid(), user_id) OR
  EXISTS (
    SELECT 1 FROM client_profiles cp1
    JOIN client_profiles cp2 ON cp1.company = cp2.company
    WHERE cp1.id = auth.uid() AND cp2.id = client_documents.user_id
    AND cp1.company IS NOT NULL
  ) OR
  EXISTS (
    SELECT 1 FROM team_members tm
    JOIN client_profiles cp ON cp.id = tm.company_id
    WHERE tm.user_id = auth.uid() 
    AND tm.status = 'active'
    AND cp.id = client_documents.user_id
  )
);

-- Atualizar políticas RLS para arquivos
DROP POLICY IF EXISTS "Clients can view company files" ON public.files;
CREATE POLICY "Clients can view company files" ON public.files
FOR SELECT USING (
  is_admin_user_secure() OR 
  has_company_access(auth.uid(), client_id) OR
  EXISTS (
    SELECT 1 FROM client_profiles cp1
    JOIN client_profiles cp2 ON cp1.company = cp2.company
    WHERE cp1.id = auth.uid() AND cp2.id = files.client_id
    AND cp1.company IS NOT NULL
  ) OR
  EXISTS (
    SELECT 1 FROM team_members tm
    JOIN client_profiles cp ON cp.id = tm.company_id
    WHERE tm.user_id = auth.uid() 
    AND tm.status = 'active'
    AND cp.id = files.client_id
  )
);

-- Atualizar políticas RLS para projetos Gantt
DROP POLICY IF EXISTS "Clients can view company gantt projects" ON public.gantt_projects;
CREATE POLICY "Clients can view company gantt projects" ON public.gantt_projects
FOR SELECT USING (
  is_admin_user_secure() OR 
  has_company_access(auth.uid(), client_id) OR
  EXISTS (
    SELECT 1 FROM client_profiles cp1
    JOIN client_profiles cp2 ON cp1.company = cp2.company
    WHERE cp1.id = auth.uid() AND cp2.id = gantt_projects.client_id
    AND cp1.company IS NOT NULL
  ) OR
  EXISTS (
    SELECT 1 FROM team_members tm
    JOIN client_profiles cp ON cp.id = tm.company_id
    WHERE tm.user_id = auth.uid() 
    AND tm.status = 'active'
    AND cp.id = gantt_projects.client_id
  )
);

-- Função para obter dados do dashboard da empresa
CREATE OR REPLACE FUNCTION public.get_company_dashboard_data(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_company text;
  dashboard_data jsonb;
BEGIN
  -- Get user's company
  SELECT company INTO user_company
  FROM client_profiles
  WHERE id = p_user_id;

  IF user_company IS NULL THEN
    -- Check if user is a team member
    SELECT cp.company INTO user_company
    FROM team_members tm
    JOIN client_profiles cp ON cp.id = tm.company_id
    WHERE tm.user_id = p_user_id AND tm.status = 'active'
    LIMIT 1;
  END IF;

  IF user_company IS NULL THEN
    RETURN jsonb_build_object('error', 'Usuário não pertence a nenhuma empresa');
  END IF;

  -- Build dashboard data
  dashboard_data := jsonb_build_object(
    'company_name', user_company,
    'projects', (
      SELECT COALESCE(json_agg(json_build_object(
        'id', gp.id,
        'name', gp.name,
        'status', gp.status,
        'progress', gp.progress,
        'start_date', gp.start_date,
        'end_date', gp.end_date
      )), '[]'::json)
      FROM gantt_projects gp
      JOIN client_profiles cp ON cp.id = gp.client_id
      WHERE cp.company = user_company
      ORDER BY gp.updated_at DESC
      LIMIT 10
    ),
    'documents', (
      SELECT COALESCE(json_agg(json_build_object(
        'id', cd.id,
        'filename', cd.filename,
        'category', cd.category,
        'uploaded_at', cd.uploaded_at
      )), '[]'::json)
      FROM client_documents cd
      JOIN client_profiles cp ON cp.id = cd.user_id
      WHERE cp.company = user_company
      ORDER BY cd.uploaded_at DESC
      LIMIT 10
    ),
    'team_members', (
      SELECT COALESCE(json_agg(json_build_object(
        'id', cp.id,
        'name', cp.name,
        'email', cp.email,
        'is_primary_contact', cp.is_primary_contact,
        'hierarchy_level', hl.name
      )), '[]'::json)
      FROM client_profiles cp
      LEFT JOIN hierarchy_levels hl ON hl.id = cp.hierarchy_level_id
      WHERE cp.company = user_company
      ORDER BY cp.is_primary_contact DESC, cp.name
    ),
    'pending_invitations', (
      SELECT COALESCE(json_agg(json_build_object(
        'id', tm.id,
        'name', tm.name,
        'email', tm.invited_email,
        'invited_at', tm.invited_at
      )), '[]'::json)
      FROM team_members tm
      JOIN client_profiles cp ON cp.id = tm.company_id
      WHERE cp.company = user_company AND tm.status = 'pending'
    )
  );

  RETURN dashboard_data;
END;
$function$;
