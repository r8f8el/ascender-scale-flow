-- Corrigir políticas RLS para client_profiles permitindo que admins vejam e gerenciem todos os clientes
-- Verificar e atualizar políticas de client_profiles

-- Deletar políticas existentes que podem estar conflitando
DROP POLICY IF EXISTS "Clients can update their own profile" ON public.client_profiles;
DROP POLICY IF EXISTS "Clients can view their own profile" ON public.client_profiles;
DROP POLICY IF EXISTS "Users can insert their own client profile" ON public.client_profiles;
DROP POLICY IF EXISTS "Users can update their own client profile" ON public.client_profiles;
DROP POLICY IF EXISTS "Users can view their own client profile" ON public.client_profiles;

-- Criar políticas mais abrangentes
-- Admins podem ver todos os perfis de clientes
CREATE POLICY "Admins can view all client profiles" 
ON public.client_profiles 
FOR SELECT 
USING (
  is_admin_user_safe() 
  OR auth.uid() = id
);

-- Admins podem inserir novos perfis de clientes
CREATE POLICY "Admins can insert client profiles" 
ON public.client_profiles 
FOR INSERT 
WITH CHECK (
  is_admin_user_safe() 
  OR auth.uid() = id
);

-- Admins podem atualizar perfis de clientes
CREATE POLICY "Admins can update client profiles" 
ON public.client_profiles 
FOR UPDATE 
USING (
  is_admin_user_safe() 
  OR auth.uid() = id
);

-- Admins podem deletar perfis de clientes
CREATE POLICY "Admins can delete client profiles" 
ON public.client_profiles 
FOR DELETE 
USING (is_admin_user_safe());

-- Clientes podem ver e atualizar apenas seus próprios perfis
CREATE POLICY "Clients can manage their own profile" 
ON public.client_profiles 
FOR ALL 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);