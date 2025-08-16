
-- Phase 1: Critical Database Security Fixes

-- 1. Create security definer functions to prevent RLS infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin_user_secure()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_profiles 
    WHERE id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin_secure()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_profiles 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_company()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT company
  FROM public.client_profiles
  WHERE id = auth.uid();
$$;

-- 2. Create secure team invitations table with proper token handling
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  inviter_name text NOT NULL,
  company_id uuid NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  message text,
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  accepted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on team_invitations
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- 3. Create secure RLS policies for team_invitations
CREATE POLICY "Company owners can manage their team invitations"
ON public.team_invitations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.client_profiles 
    WHERE id = company_id 
    AND id = auth.uid() 
    AND is_primary_contact = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.client_profiles 
    WHERE id = company_id 
    AND id = auth.uid() 
    AND is_primary_contact = true
  )
);

CREATE POLICY "Admins can view all team invitations"
ON public.team_invitations
FOR SELECT
USING (is_admin_user_secure());

-- 4. Update client_profiles policies to use secure functions
DROP POLICY IF EXISTS "Admins and own company can view profiles" ON public.client_profiles;
DROP POLICY IF EXISTS "Admins can delete client profiles" ON public.client_profiles;
DROP POLICY IF EXISTS "Admins can insert client profiles" ON public.client_profiles;
DROP POLICY IF EXISTS "Admins can update client profiles" ON public.client_profiles;

CREATE POLICY "Secure profile access policy"
ON public.client_profiles
FOR SELECT
USING (
  is_admin_user_secure() 
  OR auth.uid() = id 
  OR (company IS NOT NULL AND company = get_user_company())
);

CREATE POLICY "Admins can manage all profiles"
ON public.client_profiles
FOR ALL
USING (is_admin_user_secure())
WITH CHECK (is_admin_user_secure());

CREATE POLICY "Users can manage own profile"
ON public.client_profiles
FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. Fix search_path in existing functions
CREATE OR REPLACE FUNCTION public.invite_team_member(p_email text, p_name text, p_hierarchy_level_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invitation_id uuid;
  company_record public.client_profiles%ROWTYPE;
  secure_token text;
BEGIN
  -- Verificar se o usuário atual é contato primário
  SELECT * INTO company_record
  FROM public.client_profiles 
  WHERE id = auth.uid() 
  AND is_primary_contact = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Apenas contatos primários podem convidar membros da equipe';
  END IF;

  -- Verificar se já existe convite para este email
  IF EXISTS (
    SELECT 1 FROM public.team_invitations 
    WHERE company_id = company_record.id 
    AND email = p_email
    AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'Já existe um convite pendente para este email';
  END IF;

  -- Generate secure token
  secure_token := gen_random_uuid()::text || '-' || extract(epoch from now())::text;

  -- Criar convite na nova tabela
  INSERT INTO public.team_invitations (
    company_id,
    email,
    inviter_name,
    token,
    message
  ) VALUES (
    company_record.id,
    p_email,
    company_record.name,
    secure_token,
    'Você foi convidado para se juntar à nossa equipe'
  )
  RETURNING id INTO invitation_id;

  -- Criar entrada em team_members
  INSERT INTO public.team_members (
    company_id, 
    invited_email, 
    name,
    hierarchy_level_id,
    invited_by
  ) VALUES (
    company_record.id,
    p_email,
    p_name,
    p_hierarchy_level_id,
    auth.uid()
  );

  RETURN invitation_id;
END;
$$;

-- 6. Update other functions with proper search_path
CREATE OR REPLACE FUNCTION public.log_system_action(
  p_user_name text, 
  p_type text, 
  p_ip_address text, 
  p_action text, 
  p_details text DEFAULT NULL::text, 
  p_level text DEFAULT 'info'::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.system_logs (user_name, type, ip_address, action, details, level)
  VALUES (p_user_name, p_type, p_ip_address, p_action, p_details, p_level)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- 7. Add invitation token validation function
CREATE OR REPLACE FUNCTION public.validate_invitation_token(p_token text)
RETURNS TABLE(
  invitation_id uuid,
  email text,
  company_id uuid,
  inviter_name text,
  message text,
  is_valid boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ti.id,
    ti.email,
    ti.company_id,
    ti.inviter_name,
    ti.message,
    (ti.status = 'pending' AND ti.expires_at > now()) as is_valid
  FROM public.team_invitations ti
  WHERE ti.token = p_token;
END;
$$;

-- 8. Add audit trigger for sensitive operations
CREATE OR REPLACE FUNCTION public.audit_sensitive_operations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.system_logs (
    user_name,
    type,
    ip_address,
    action,
    details,
    level
  ) VALUES (
    COALESCE((auth.jwt() ->> 'email'), 'system'),
    'audit',
    COALESCE((auth.jwt() ->> 'ip'), 'unknown'),
    TG_OP || ' on ' || TG_TABLE_NAME,
    json_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    )::text,
    'info'
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply audit trigger to sensitive tables
DROP TRIGGER IF EXISTS audit_team_invitations ON public.team_invitations;
CREATE TRIGGER audit_team_invitations
  AFTER INSERT OR UPDATE OR DELETE ON public.team_invitations
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_operations();

DROP TRIGGER IF EXISTS audit_admin_profiles ON public.admin_profiles;
CREATE TRIGGER audit_admin_profiles
  AFTER INSERT OR UPDATE OR DELETE ON public.admin_profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_operations();
