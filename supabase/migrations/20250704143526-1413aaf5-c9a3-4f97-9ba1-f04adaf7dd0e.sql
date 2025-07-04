
-- Remover todas as políticas existentes de tickets para recriá-las
DROP POLICY IF EXISTS "Anyone can create tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can create tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admins can update tickets" ON public.tickets;

-- Recriar políticas de forma mais simples e segura
-- Política para inserção - permitir a qualquer um criar tickets
CREATE POLICY "Public can create tickets" 
ON public.tickets 
FOR INSERT 
WITH CHECK (true);

-- Política para visualização - usuários podem ver seus próprios tickets
CREATE POLICY "Users can view own tickets" 
ON public.tickets 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR user_email = auth.jwt() ->> 'email'
  OR EXISTS(
    SELECT 1 FROM public.admin_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Política para atualização - apenas admins podem atualizar
CREATE POLICY "Admins can update tickets" 
ON public.tickets 
FOR UPDATE 
USING (
  EXISTS(
    SELECT 1 FROM public.admin_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);
