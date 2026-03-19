
-- Create trigger function to auto-create client_profiles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.client_profiles (id, name, email, company, cnpj, is_primary_contact)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'company',
    NEW.raw_user_meta_data->>'cnpj',
    COALESCE((NEW.raw_user_meta_data->>'is_primary_contact')::boolean, true)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also create the profile for any existing auth users who don't have one yet
INSERT INTO public.client_profiles (id, name, email, company, cnpj, is_primary_contact)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'name', u.email),
  u.email,
  u.raw_user_meta_data->>'company',
  u.raw_user_meta_data->>'cnpj',
  COALESCE((u.raw_user_meta_data->>'is_primary_contact')::boolean, true)
FROM auth.users u
LEFT JOIN public.client_profiles cp ON cp.id = u.id
LEFT JOIN public.admin_profiles ap ON ap.id = u.id
WHERE cp.id IS NULL AND ap.id IS NULL;
