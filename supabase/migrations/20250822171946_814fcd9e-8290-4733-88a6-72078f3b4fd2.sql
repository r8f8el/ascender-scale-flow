
-- CRITICAL SECURITY FIX: Remove dangerous public SELECT policy on team_invitations
DROP POLICY IF EXISTS "Public can validate invitation tokens" ON public.team_invitations;

-- Create a secure token validation function that doesn't expose the full table
CREATE OR REPLACE FUNCTION public.validate_invitation_token_secure(p_token text)
RETURNS TABLE(
  invitation_id uuid,
  email text,
  company_id uuid,
  company_name text,
  inviter_name text,
  message text,
  hierarchy_level_id uuid,
  is_valid boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log security event
  PERFORM log_security_event('validate_invitation_token', 'team_invitation', p_token, 
    jsonb_build_object('ip', inet_client_addr(), 'timestamp', now()));

  RETURN QUERY
  SELECT 
    ti.id,
    ti.email,
    ti.company_id,
    ti.company_name,
    ti.inviter_name,
    ti.message,
    ti.hierarchy_level_id,
    (ti.status = 'pending' AND ti.expires_at > now()) as is_valid
  FROM public.team_invitations ti
  WHERE ti.token = p_token;
END;
$$;

-- Update existing functions to include proper search_path for security
CREATE OR REPLACE FUNCTION public.invite_team_member_secure(p_email text, p_name text, p_hierarchy_level_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  invitation_id uuid;
  company_record public.client_profiles%ROWTYPE;
  secure_token text;
  invite_url text;
BEGIN
  -- Log security event
  PERFORM log_security_event('invite_team_member', 'team_invitation', null, 
    jsonb_build_object('invitee_email', p_email, 'inviter_id', auth.uid()));

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

  -- Generate secure token using gen_random_uuid for better security
  secure_token := gen_random_uuid()::text || '-' || extract(epoch from now())::text;
  
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
    now() + interval '24 hours', -- Reduced from 7 days for security
    'pending',
    p_hierarchy_level_id
  )
  RETURNING id INTO invitation_id;

  -- Rest of function remains the same...
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

  RETURN invitation_id;
END;
$$;

-- Update accept team invitation function with proper security
CREATE OR REPLACE FUNCTION public.accept_team_invitation(p_token text, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  invitation_record public.team_invitations%ROWTYPE;
  company_record public.client_profiles%ROWTYPE;
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
  
  -- Rest of function remains the same...
  SELECT * INTO company_record
  FROM public.client_profiles
  WHERE id = invitation_record.company_id;
  
  UPDATE public.team_invitations
  SET status = 'accepted',
      accepted_at = now()
  WHERE id = invitation_record.id;
  
  UPDATE public.team_members
  SET user_id = p_user_id,
      status = 'active',
      joined_at = now(),
      updated_at = now()
  WHERE company_id = invitation_record.company_id
  AND invited_email = invitation_record.email;
  
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
  
  RETURN true;
END;
$$;

-- Add rate limiting for team invitations
CREATE OR REPLACE FUNCTION public.check_invitation_rate_limit(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  invitation_count integer;
BEGIN
  -- Check how many invitations sent in last hour
  SELECT COUNT(*) INTO invitation_count
  FROM public.team_invitations
  WHERE invited_by_name = (SELECT name FROM public.client_profiles WHERE id = p_user_id)
  AND created_at > now() - interval '1 hour';
  
  -- Allow max 10 invitations per hour
  RETURN invitation_count < 10;
END;
$$;

-- Update other security-critical functions to include search_path
CREATE OR REPLACE FUNCTION public.validate_team_invitation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Validate email format
  IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Sanitize and validate inviter name
  IF LENGTH(TRIM(NEW.inviter_name)) < 2 THEN
    RAISE EXCEPTION 'Inviter name must be at least 2 characters';
  END IF;
  
  -- Sanitize message content
  NEW.message := TRIM(COALESCE(NEW.message, ''));
  IF LENGTH(NEW.message) > 500 THEN
    RAISE EXCEPTION 'Message too long (max 500 characters)';
  END IF;
  
  -- Ensure token is secure (minimum 32 characters)
  IF LENGTH(NEW.token) < 32 THEN
    RAISE EXCEPTION 'Security token too short';
  END IF;
  
  -- Prevent XSS in message
  NEW.message := regexp_replace(NEW.message, '<[^>]*>', '', 'g');
  
  RETURN NEW;
END;
$$;

-- Create secure audit trigger for team invitations
CREATE OR REPLACE FUNCTION public.audit_team_invitations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    TG_OP || '_team_invitation',
    'team_invitation',
    COALESCE(NEW.id, OLD.id)::text,
    jsonb_build_object(
      'email', COALESCE(NEW.email, OLD.email),
      'company_id', COALESCE(NEW.company_id, OLD.company_id),
      'old_status', OLD.status,
      'new_status', NEW.status,
      'ip_address', inet_client_addr()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add audit trigger to team_invitations table
DROP TRIGGER IF EXISTS audit_team_invitations_trigger ON public.team_invitations;
CREATE TRIGGER audit_team_invitations_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.team_invitations
  FOR EACH ROW EXECUTE FUNCTION public.audit_team_invitations();

-- Secure RLS policies for team_invitations (remove public access)
CREATE POLICY "Users can create invitations for their company"
  ON public.team_invitations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.client_profiles
      WHERE id = auth.uid() 
      AND id = team_invitations.company_id
      AND is_primary_contact = true
    )
  );

CREATE POLICY "Users can view their own company invitations"
  ON public.team_invitations
  FOR SELECT
  USING (
    company_id = auth.uid() OR 
    is_admin_user_secure()
  );

CREATE POLICY "Admins can manage all invitations"
  ON public.team_invitations
  FOR ALL
  USING (is_admin_user_secure());
