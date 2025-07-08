-- Corrigir recursão infinita nas políticas RLS de admin_profiles
-- Primeiro, vamos remover a política problemática
DROP POLICY IF EXISTS "Super admins can manage admin profiles" ON public.admin_profiles;

-- Criar uma função security definer para verificar se o usuário é super admin
CREATE OR REPLACE FUNCTION public.is_current_user_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_profiles 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  );
$$;

-- Recriar a política usando a função security definer
CREATE POLICY "Super admins can manage admin profiles" 
ON public.admin_profiles
FOR ALL 
USING (public.is_current_user_super_admin());