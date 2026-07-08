

-- Remover todas as políticas existentes de tickets para recriá-las
DROP POLICY IF EXISTS "Anyone can create tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can create tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admins can update tickets" ON public.tickets;
DROP POLICY IF EXISTS "Public can create tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can view own tickets" ON public.tickets;

-- Política mais simples para inserção - permitir a qualquer um criar tickets
CREATE POLICY "Allow public ticket creation" 
ON public.tickets 
FOR INSERT 
WITH CHECK (true);

-- Política simplificada para visualização - apenas baseada no user_id e email
CREATE POLICY "Users view own tickets only" 
ON public.tickets 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR user_email = auth.jwt() ->> 'email'
);

-- Política separada para admins visualizarem todos os tickets
CREATE POLICY "Admins view all tickets" 
ON public.tickets 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT id FROM public.admin_profiles 
    WHERE role IN ('admin', 'super_admin')
  )
);

-- Política para admins atualizarem tickets
CREATE POLICY "Admins update tickets" 
ON public.tickets 
FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT id FROM public.admin_profiles 
    WHERE role IN ('admin', 'super_admin')
  )
);

