
-- Phase 1: Critical Database Security Fixes

-- 1. Secure reference data tables by adding authentication requirements
ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hierarchy_levels ENABLE ROW LEVEL SECURITY;

-- Update document_categories policies to require authentication
DROP POLICY IF EXISTS "Anyone can view document categories" ON public.document_categories;
CREATE POLICY "Authenticated users can view document categories" 
  ON public.document_categories 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Update hierarchy_levels policies to require authentication  
DROP POLICY IF EXISTS "Anyone can view hierarchy levels" ON public.hierarchy_levels;
CREATE POLICY "Authenticated users can view hierarchy levels" 
  ON public.hierarchy_levels 
  FOR SELECT 
  TO authenticated
  USING (true);

-- 2. Fix function security by adding proper search_path to functions missing it
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    ticket_num TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        ticket_num := 'TCK-' || LPAD((FLOOR(RANDOM() * 999999) + 1)::TEXT, 6, '0');
        SELECT EXISTS(SELECT 1 FROM public.tickets WHERE ticket_number = ticket_num) INTO exists_check;
        IF NOT exists_check THEN
            EXIT;
        END IF;
    END LOOP;
    RETURN ticket_num;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_ticket_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
        NEW.ticket_number := generate_ticket_number();
    END IF;
    NEW.updated_at := now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role 
  FROM public.admin_profiles 
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'client');
END;
$function$;

-- 3. Add comprehensive input validation triggers for critical tables
CREATE OR REPLACE FUNCTION public.validate_team_invitation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  
  -- Ensure token is secure
  IF LENGTH(NEW.token) < 32 THEN
    RAISE EXCEPTION 'Security token too short';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for team invitations validation
DROP TRIGGER IF EXISTS validate_team_invitation_trigger ON public.team_invitations;
CREATE TRIGGER validate_team_invitation_trigger
  BEFORE INSERT OR UPDATE ON public.team_invitations
  FOR EACH ROW EXECUTE FUNCTION validate_team_invitation();

-- 4. Add validation for solicitacoes (approval requests)
CREATE OR REPLACE FUNCTION public.validate_solicitacao()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Validate title
  NEW.titulo := TRIM(NEW.titulo);
  IF LENGTH(NEW.titulo) < 3 THEN
    RAISE EXCEPTION 'Título deve ter pelo menos 3 caracteres';
  END IF;
  IF LENGTH(NEW.titulo) > 200 THEN
    RAISE EXCEPTION 'Título muito longo (máximo 200 caracteres)';
  END IF;
  
  -- Sanitize description
  NEW.descricao := TRIM(COALESCE(NEW.descricao, ''));
  IF LENGTH(NEW.descricao) > 2000 THEN
    RAISE EXCEPTION 'Descrição muito longa (máximo 2000 caracteres)';
  END IF;
  
  -- Validate status
  IF NEW.status NOT IN ('Em Elaboração', 'Pendente', 'Aprovado', 'Rejeitado', 'Requer Ajuste') THEN
    RAISE EXCEPTION 'Status inválido';
  END IF;
  
  -- Validate priority
  IF NEW.prioridade NOT IN ('Baixa', 'Media', 'Alta') THEN
    RAISE EXCEPTION 'Prioridade inválida';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for solicitacoes validation
DROP TRIGGER IF EXISTS validate_solicitacao_trigger ON public.solicitacoes;
CREATE TRIGGER validate_solicitacao_trigger
  BEFORE INSERT OR UPDATE ON public.solicitacoes
  FOR EACH ROW EXECUTE FUNCTION validate_solicitacao();

-- 5. Improve file upload security
CREATE OR REPLACE FUNCTION public.validate_file_upload()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check file size (max 50MB)
  IF NEW.file_size > 52428800 THEN
    RAISE EXCEPTION 'File size exceeds maximum limit of 50MB';
  END IF;
  
  -- Validate file extensions (more restrictive)
  IF NEW.filename !~* '\.(pdf|doc|docx|xls|xlsx|jpg|jpeg|png|txt|csv)$' THEN
    RAISE EXCEPTION 'File type not allowed. Only PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT, CSV files are permitted';
  END IF;
  
  -- Sanitize filename more thoroughly
  NEW.filename := regexp_replace(NEW.filename, '[^a-zA-Z0-9._-]', '_', 'g');
  
  -- Prevent path traversal attacks
  IF NEW.filename ~ '\.\./|/\.\.' THEN
    RAISE EXCEPTION 'Invalid filename: path traversal not allowed';
  END IF;
  
  -- Ensure filename isn't too long
  IF LENGTH(NEW.filename) > 255 THEN
    RAISE EXCEPTION 'Filename too long (maximum 255 characters)';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 6. Add rate limiting for sensitive operations
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  attempts integer DEFAULT 1,
  last_attempt timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rate limits" 
  ON public.rate_limits 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage rate limits" 
  ON public.rate_limits 
  FOR ALL 
  USING (is_admin_user_secure());

-- Rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id uuid,
  p_action_type text,
  p_max_attempts integer DEFAULT 5,
  p_window_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_attempts integer;
BEGIN
  -- Clean old entries
  DELETE FROM public.rate_limits 
  WHERE last_attempt < (now() - (p_window_minutes || ' minutes')::interval);
  
  -- Get current attempts
  SELECT COALESCE(SUM(attempts), 0) INTO current_attempts
  FROM public.rate_limits
  WHERE user_id = p_user_id 
    AND action_type = p_action_type
    AND last_attempt > (now() - (p_window_minutes || ' minutes')::interval);
  
  -- Check if limit exceeded
  IF current_attempts >= p_max_attempts THEN
    RETURN false;
  END IF;
  
  -- Record attempt
  INSERT INTO public.rate_limits (user_id, action_type)
  VALUES (p_user_id, p_action_type)
  ON CONFLICT (user_id, action_type) 
  DO UPDATE SET 
    attempts = rate_limits.attempts + 1,
    last_attempt = now();
  
  RETURN true;
END;
$function$;
