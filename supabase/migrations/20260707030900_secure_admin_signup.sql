-- Update public.handle_new_user trigger function to block public signups for admin domain
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if it's an admin email based on domain
  IF NEW.email LIKE '%@ascalate.com.br' THEN
    -- Only allow signups from administrative roles/service role (Supabase console or custom admin panel)
    -- This prevents public signups (anon key / client SDK auth.signUp) with @ascalate.com.br
    IF auth.role() <> 'service_role' THEN
      RAISE EXCEPTION 'Cadastros públicos com e-mail @ascalate.com.br não são permitidos.';
    END IF;

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
