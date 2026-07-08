
-- Corrigir recursão infinita nas políticas RLS do admin_profiles
-- Primeiro, remover as políticas problemáticas
DROP POLICY IF EXISTS "Admins can view all admin profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "Admins can view their own admin profile" ON public.admin_profiles;

-- Criar função de segurança para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role 
  FROM public.admin_profiles 
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'client');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recriar as políticas usando a função de segurança
CREATE POLICY "Admins can view all admin profiles" 
ON public.admin_profiles 
FOR SELECT 
USING (public.get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can view their own admin profile" 
ON public.admin_profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Corrigir também as políticas dos tickets que podem ter o mesmo problema
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admins can update tickets" ON public.tickets;

CREATE POLICY "Admins can view all tickets" 
ON public.tickets 
FOR SELECT 
USING (public.get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can update tickets" 
ON public.tickets 
FOR UPDATE 
USING (public.get_current_user_role() IN ('admin', 'super_admin'));

-- Corrigir políticas das respostas de tickets
DROP POLICY IF EXISTS "Admins can create responses" ON public.ticket_responses;

CREATE POLICY "Admins can create responses" 
ON public.ticket_responses 
FOR INSERT 
WITH CHECK (public.get_current_user_role() IN ('admin', 'super_admin'));
