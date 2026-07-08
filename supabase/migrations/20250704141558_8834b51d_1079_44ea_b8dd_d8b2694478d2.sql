
-- Corrigir política de inserção de tickets para permitir criação por usuários não autenticados
DROP POLICY IF EXISTS "Users can create tickets" ON public.tickets;

-- Recriar política permitindo inserção para todos (autenticados ou não)
CREATE POLICY "Anyone can create tickets" 
ON public.tickets 
FOR INSERT 
WITH CHECK (true);

-- Manter as políticas de visualização intactas
-- Usuários podem ver seus próprios tickets e admins podem ver todos
