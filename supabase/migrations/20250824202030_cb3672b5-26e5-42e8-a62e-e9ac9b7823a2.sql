-- Função para limpar usuários órfãos (no auth mas sem perfil confirmado)
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_users()
RETURNS TABLE(cleaned_users_count int, details jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  orphaned_count int := 0;
  cleanup_details jsonb := '[]'::jsonb;
  user_record RECORD;
BEGIN
  -- Verificar se é admin
  IF NOT is_admin_user_safe() THEN
    RAISE EXCEPTION 'Apenas administradores podem executar limpeza de usuários órfãos';
  END IF;

  -- Buscar usuários no auth que não têm perfil ou têm email não confirmado há mais de 24h
  FOR user_record IN
    SELECT 
      au.id,
      au.email,
      au.created_at,
      au.email_confirmed_at,
      CASE WHEN cp.id IS NULL THEN 'no_profile' ELSE 'unconfirmed' END as issue_type
    FROM auth.users au
    LEFT JOIN public.client_profiles cp ON au.id = cp.id
    WHERE 
      -- Usuários sem perfil OU com email não confirmado há mais de 24h
      (cp.id IS NULL OR au.email_confirmed_at IS NULL)
      AND au.created_at < now() - interval '24 hours'
      AND au.email NOT LIKE '%@ascalate.com.br' -- Não mexer em admins
    ORDER BY au.created_at DESC
    LIMIT 50 -- Limitar para segurança
  LOOP
    -- Log do que será limpo
    cleanup_details := cleanup_details || jsonb_build_object(
      'user_id', user_record.id,
      'email', user_record.email,
      'created_at', user_record.created_at,
      'issue', user_record.issue_type
    );
    
    -- Remover perfil se existir
    DELETE FROM public.client_profiles WHERE id = user_record.id;
    
    -- Incrementar contador
    orphaned_count := orphaned_count + 1;
  END LOOP;

  RETURN QUERY SELECT orphaned_count, cleanup_details;
END;
$$;