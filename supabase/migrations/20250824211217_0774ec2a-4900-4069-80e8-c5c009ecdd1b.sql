-- Criar política mais robusta para client_profiles
-- que garante acesso ao próprio perfil

-- Remover políticas duplicadas/conflitantes
DROP POLICY IF EXISTS "Clients can manage their own profile" ON public.client_profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.client_profiles;

-- Política unificada para usuários acessarem seus próprios perfis
CREATE POLICY "Users can access own profile unified"
ON public.client_profiles
FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Garantir que admins sempre tenham acesso total
CREATE POLICY "Admins full access to profiles"
ON public.client_profiles
FOR ALL
TO authenticated
USING (is_admin_user_secure())
WITH CHECK (is_admin_user_secure());