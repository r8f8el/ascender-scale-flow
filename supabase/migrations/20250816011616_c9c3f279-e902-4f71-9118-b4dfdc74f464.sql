
-- Fix database function security by adding proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Fix handle_team_member_signup function
CREATE OR REPLACE FUNCTION public.handle_team_member_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Fix auto_create_fpa_client function
CREATE OR REPLACE FUNCTION public.auto_create_fpa_client()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Restrict reference data access - require authentication for sensitive tables
DROP POLICY IF EXISTS "Todos podem ver cargos" ON public.cargos;
CREATE POLICY "Authenticated users can view cargos" 
  ON public.cargos 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Add more restrictive policy for client_profiles to prevent cross-company data access
DROP POLICY IF EXISTS "Admins can view all client profiles" ON public.client_profiles;
CREATE POLICY "Admins and own company can view profiles" 
  ON public.client_profiles 
  FOR SELECT 
  USING (
    is_admin_user_safe() OR 
    auth.uid() = id OR
    (company IS NOT NULL AND company = (
      SELECT company FROM public.client_profiles WHERE id = auth.uid()
    ))
  );

-- Add file validation function for uploads
CREATE OR REPLACE FUNCTION public.validate_file_upload()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check file size (max 50MB)
  IF NEW.file_size > 52428800 THEN
    RAISE EXCEPTION 'File size exceeds maximum limit of 50MB';
  END IF;
  
  -- Validate file extensions
  IF NEW.filename !~* '\.(pdf|doc|docx|xls|xlsx|jpg|jpeg|png|txt|csv)$' THEN
    RAISE EXCEPTION 'File type not allowed. Only PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT, CSV files are permitted';
  END IF;
  
  -- Sanitize filename
  NEW.filename := regexp_replace(NEW.filename, '[^a-zA-Z0-9._-]', '_', 'g');
  
  RETURN NEW;
END;
$$;

-- Add triggers for file validation
DROP TRIGGER IF EXISTS validate_document_upload ON public.documents;
CREATE TRIGGER validate_document_upload
  BEFORE INSERT OR UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.validate_file_upload();

DROP TRIGGER IF EXISTS validate_client_document_upload ON public.client_documents;
CREATE TRIGGER validate_client_document_upload
  BEFORE INSERT OR UPDATE ON public.client_documents
  FOR EACH ROW EXECUTE FUNCTION public.validate_file_upload();

-- Add content type validation
ALTER TABLE public.documents 
ADD CONSTRAINT valid_content_types 
CHECK (content_type IN (
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'text/plain',
  'text/csv'
));

ALTER TABLE public.client_documents 
ADD CONSTRAINT valid_content_types 
CHECK (content_type IN (
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'text/plain',
  'text/csv'
));
