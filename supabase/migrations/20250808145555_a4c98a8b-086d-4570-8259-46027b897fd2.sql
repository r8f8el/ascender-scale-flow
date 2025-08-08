-- Create triggers to auto-populate profiles and FPA client on new auth user
-- Safe-create pattern: drop existing triggers if they exist, then create

-- 1) Trigger to handle general new user profile mapping
DROP TRIGGER IF EXISTS on_auth_user_created_handle_new_user ON auth.users;
CREATE TRIGGER on_auth_user_created_handle_new_user
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2) Trigger to auto create FPA client
DROP TRIGGER IF EXISTS on_auth_user_created_auto_create_fpa_client ON auth.users;
CREATE TRIGGER on_auth_user_created_auto_create_fpa_client
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.auto_create_fpa_client();