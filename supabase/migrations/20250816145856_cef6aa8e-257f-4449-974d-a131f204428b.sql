
-- Fix database functions to include proper search path security
-- This prevents search path injection attacks

-- Update existing functions to include SET search_path TO 'public'
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

CREATE OR REPLACE FUNCTION public.is_admin_user_safe()
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

CREATE OR REPLACE FUNCTION public.is_current_user_super_admin()
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

CREATE OR REPLACE FUNCTION public.is_admin_user()
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

CREATE OR REPLACE FUNCTION public.is_super_admin()
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

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role 
  FROM public.admin_profiles 
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'client');
END;
$$;

-- Add RLS policies for ticket support tables that were missing them
-- These tables contain system configuration data that should be protected

-- Ticket categories RLS policies
ALTER TABLE public.ticket_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage ticket categories"
ON public.ticket_categories
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can view ticket categories"
ON public.ticket_categories
FOR SELECT
TO authenticated
USING (true);

-- Ticket priorities RLS policies  
ALTER TABLE public.ticket_priorities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage ticket priorities"
ON public.ticket_priorities
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can view ticket priorities"
ON public.ticket_priorities
FOR SELECT
TO authenticated
USING (true);

-- Ticket statuses RLS policies
ALTER TABLE public.ticket_statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage ticket statuses"
ON public.ticket_statuses
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can view ticket statuses"
ON public.ticket_statuses
FOR SELECT
TO authenticated
USING (true);

-- Create security audit log table for tracking sensitive operations
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.security_audit_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE id = auth.uid()
  )
);

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
ON public.security_audit_log
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_details
  );
END;
$$;

-- Create rate limiting table for authentication
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- email or IP
  attempt_type TEXT NOT NULL, -- 'login', 'signup', 'password_reset'
  attempts INTEGER DEFAULT 1,
  first_attempt TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_attempt TIMESTAMP WITH TIME ZONE DEFAULT now(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  UNIQUE(identifier, attempt_type)
);

-- Enable RLS on rate limits
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only system can manage rate limits
CREATE POLICY "System can manage rate limits"
ON public.auth_rate_limits
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE id = auth.uid()
  )
);

-- Function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_auth_rate_limit(
  p_identifier TEXT,
  p_attempt_type TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 15,
  p_block_minutes INTEGER DEFAULT 30
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_record RECORD;
  is_allowed BOOLEAN := true;
BEGIN
  -- Clean up old records
  DELETE FROM public.auth_rate_limits 
  WHERE first_attempt < (now() - (p_window_minutes || ' minutes')::interval)
    AND (blocked_until IS NULL OR blocked_until < now());
  
  -- Get current record
  SELECT * INTO current_record
  FROM public.auth_rate_limits
  WHERE identifier = p_identifier 
    AND attempt_type = p_attempt_type;
  
  -- Check if currently blocked
  IF current_record.blocked_until IS NOT NULL AND current_record.blocked_until > now() THEN
    RETURN false;
  END IF;
  
  -- Update or create record
  IF current_record.id IS NOT NULL THEN
    -- Check if within rate limit
    IF current_record.attempts >= p_max_attempts THEN
      -- Block the identifier
      UPDATE public.auth_rate_limits
      SET blocked_until = now() + (p_block_minutes || ' minutes')::interval,
          last_attempt = now()
      WHERE id = current_record.id;
      is_allowed := false;
    ELSE
      -- Increment attempts
      UPDATE public.auth_rate_limits
      SET attempts = attempts + 1,
          last_attempt = now()
      WHERE id = current_record.id;
    END IF;
  ELSE
    -- Create new record
    INSERT INTO public.auth_rate_limits (identifier, attempt_type)
    VALUES (p_identifier, p_attempt_type);
  END IF;
  
  RETURN is_allowed;
END;
$$;
