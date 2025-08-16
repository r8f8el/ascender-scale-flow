
-- Phase 1: Critical Database Security Fixes

-- 1. Make user_id columns NOT NULL in security-sensitive tables
ALTER TABLE public.tickets 
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.team_members 
ALTER COLUMN user_id SET NOT NULL;

-- 2. Update database functions to include SET search_path = 'public' for security
-- This prevents privilege escalation attacks through search_path manipulation

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if it's an admin email based on domain
  IF NEW.email LIKE '%@ascalate.com.br' THEN
    INSERT INTO public.admin_profiles (id, name, email, role)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
      NEW.email,
      CASE 
        WHEN NEW.email IN ('daniel@ascalate.com.br', 'rafael.gontijo@ascalate.com.br') 
        THEN 'super_admin'
        ELSE 'admin'
      END
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      role = EXCLUDED.role;
  ELSE
    -- Insert or update client profile
    INSERT INTO public.client_profiles (id, name, email, company, is_primary_contact)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
      NEW.email,
      NEW.raw_user_meta_data->>'company',
      COALESCE((NEW.raw_user_meta_data->>'is_primary_contact')::boolean, true)
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      company = EXCLUDED.company,
      is_primary_contact = EXCLUDED.is_primary_contact;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update handle_team_member_signup function
CREATE OR REPLACE FUNCTION public.handle_team_member_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  invitation_record public.company_teams%ROWTYPE;
BEGIN
  -- Check if this user was invited as a team member
  SELECT * INTO invitation_record 
  FROM public.company_teams 
  WHERE invited_email = NEW.email 
  AND status = 'pending';
  
  IF FOUND THEN
    -- Update the invitation record with the actual user ID
    UPDATE public.company_teams 
    SET member_id = NEW.id, status = 'active', updated_at = now()
    WHERE id = invitation_record.id;
    
    -- Create client profile linked to the company
    INSERT INTO public.client_profiles (id, name, email, company, cnpj, is_primary_contact)
    SELECT 
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
      NEW.email,
      cp.company,
      cp.cnpj,
      false
    FROM public.client_profiles cp
    WHERE cp.id = invitation_record.company_id;
  ELSE
    -- Regular company signup - check if not an admin domain
    IF NEW.email NOT LIKE '%@ascalate.com.br' THEN
      INSERT INTO public.client_profiles (id, name, email, company, is_primary_contact)
      VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
        NEW.email,
        NEW.raw_user_meta_data->>'company',
        true
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update process_team_invitation function
CREATE OR REPLACE FUNCTION public.process_team_invitation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  team_record public.team_members%ROWTYPE;
BEGIN
  -- Verificar se existe convite pendente para este email
  SELECT * INTO team_record 
  FROM public.team_members 
  WHERE invited_email = NEW.email 
  AND status = 'pending'
  AND user_id IS NULL;
  
  IF FOUND THEN
    -- Ativar o convite
    UPDATE public.team_members 
    SET user_id = NEW.id, 
        status = 'active', 
        joined_at = now(),
        updated_at = now()
    WHERE id = team_record.id;
    
    -- Criar ou atualizar client profile para o membro da equipe
    INSERT INTO public.client_profiles (
      id, name, email, company, is_primary_contact, hierarchy_level_id
    )
    SELECT 
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', team_record.name),
      NEW.email,
      cp.company,
      false,
      team_record.hierarchy_level_id
    FROM public.client_profiles cp
    WHERE cp.id = team_record.company_id
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      company = EXCLUDED.company,
      hierarchy_level_id = EXCLUDED.hierarchy_level_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update auto_create_fpa_client function
CREATE OR REPLACE FUNCTION public.auto_create_fpa_client()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  rec jsonb := to_jsonb(NEW);
  email_val text;
  company_val text;
  name_val text;
BEGIN
  -- Extract email
  IF rec ? 'email' THEN
    email_val := rec->>'email';
  ELSE
    email_val := NULL;
  END IF;

  -- Extract company from either a column or raw_user_meta_data
  IF rec ? 'company' THEN
    company_val := rec->>'company';
  ELSIF rec ? 'raw_user_meta_data' THEN
    company_val := (rec->'raw_user_meta_data'->>'company');
  END IF;

  -- Extract display name similarly
  IF rec ? 'name' THEN
    name_val := rec->>'name';
  ELSIF rec ? 'raw_user_meta_data' THEN
    name_val := (rec->'raw_user_meta_data'->>'name');
  END IF;

  -- Skip admins
  IF email_val IS NULL OR email_val LIKE '%@ascalate.com.br' THEN
    RETURN NEW;
  END IF;

  -- Create FPA client if missing
  INSERT INTO public.fpa_clients (
    client_profile_id,
    company_name,
    onboarding_completed,
    current_phase
  ) VALUES (
    NEW.id,
    COALESCE(company_val, name_val, split_part(email_val, '@', 1)),
    false,
    1
  )
  ON CONFLICT (client_profile_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 3. Add RLS policy to handle null user_id scenarios more securely
-- Update tickets table policy to be more restrictive
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.tickets;
CREATE POLICY "Users can view their own tickets" 
ON public.tickets 
FOR SELECT 
USING (
  user_id IS NOT NULL AND 
  user_id = auth.uid()
);

-- 4. Restrict public access to reference tables - require authentication
DROP POLICY IF EXISTS "Anyone can view document categories" ON public.document_categories;
CREATE POLICY "Authenticated users can view document categories" 
ON public.document_categories 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can view hierarchy levels" ON public.hierarchy_levels;
CREATE POLICY "Authenticated users can view hierarchy levels" 
ON public.hierarchy_levels 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can view cargos" ON public.cargos;
CREATE POLICY "Authenticated users can view cargos" 
ON public.cargos 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 5. Add audit logging table for security events
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  event_type text NOT NULL,
  event_description text NOT NULL,
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view all audit logs"
ON public.security_audit_logs
FOR SELECT
USING (is_admin_user_safe());

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_event_description text,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.security_audit_logs (
    user_id, event_type, event_description, ip_address, user_agent, metadata
  ) VALUES (
    auth.uid(), p_event_type, p_event_description, p_ip_address, p_user_agent, p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;
