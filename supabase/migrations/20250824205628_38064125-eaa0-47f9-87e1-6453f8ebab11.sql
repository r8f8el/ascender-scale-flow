-- Verificar se há algum problema com a sessão do usuário
-- e criar uma função para debug da autenticação

-- Função para debug de autenticação
CREATE OR REPLACE FUNCTION public.debug_auth_context()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN jsonb_build_object(
    'auth_uid', auth.uid(),
    'auth_role', auth.role(),
    'jwt_claims', auth.jwt()
  );
END;
$function$;

-- Função para buscar perfil do cliente com debug
CREATE OR REPLACE FUNCTION public.get_client_profile_debug(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  profile_data client_profiles%ROWTYPE;
  auth_debug jsonb;
BEGIN
  -- Get auth context
  auth_debug := debug_auth_context();
  
  -- Try to get profile
  SELECT * INTO profile_data 
  FROM client_profiles 
  WHERE id = p_user_id;
  
  RETURN jsonb_build_object(
    'profile', to_jsonb(profile_data),
    'auth_context', auth_debug,
    'user_id_param', p_user_id,
    'profile_found', FOUND
  );
END;
$function$;

-- Função para buscar perfil sem RLS (temporária para debug)
CREATE OR REPLACE FUNCTION public.get_client_profile_bypass(p_user_id uuid)
RETURNS client_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  profile_data client_profiles%ROWTYPE;
BEGIN
  SELECT * INTO profile_data 
  FROM client_profiles 
  WHERE id = p_user_id;
  
  RETURN profile_data;
END;
$function$;