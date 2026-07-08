
-- Desabilitar temporariamente RLS na tabela tickets para permitir inserção
ALTER TABLE public.tickets DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes da tabela tickets
DROP POLICY IF EXISTS "Allow public ticket creation" ON public.tickets;
DROP POLICY IF EXISTS "Users view own tickets only" ON public.tickets;
DROP POLICY IF EXISTS "Authenticated users can view tickets" ON public.tickets;
DROP POLICY IF EXISTS "Authenticated users can update tickets" ON public.tickets;

-- Reabilitar RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Criar uma política única e simples para inserção que sempre permite
CREATE POLICY "Enable insert for all users" 
ON public.tickets 
FOR INSERT 
WITH CHECK (true);

-- Criar uma política única e simples para visualização que sempre permite
CREATE POLICY "Enable select for all users" 
ON public.tickets 
FOR SELECT 
USING (true);

-- Criar uma política única e simples para atualização que sempre permite
CREATE POLICY "Enable update for all users" 
ON public.tickets 
FOR UPDATE 
USING (true);
