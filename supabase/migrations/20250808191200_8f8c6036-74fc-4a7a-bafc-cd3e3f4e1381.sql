-- Fix signup failure: make auto_create_fpa_client function robust across trigger sources
-- It previously referenced NEW.company/NEW.name which fails when triggered on auth.users
-- New version derives fields safely from JSONB and works whether the trigger is on auth.users or client_profiles

CREATE OR REPLACE FUNCTION public.auto_create_fpa_client()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;