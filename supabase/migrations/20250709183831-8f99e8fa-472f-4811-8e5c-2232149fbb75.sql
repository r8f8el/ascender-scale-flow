-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create the function to handle new user registration
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
    );
  ELSE
    INSERT INTO public.client_profiles (id, name, email, company)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
      NEW.email,
      NEW.raw_user_meta_data->>'company'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();