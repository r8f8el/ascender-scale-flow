-- Verificar e corrigir a função handle_new_user para garantir que perfis de clientes sejam criados
-- Atualizar a função para garantir que funcione corretamente

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

-- Garantir que o trigger existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();