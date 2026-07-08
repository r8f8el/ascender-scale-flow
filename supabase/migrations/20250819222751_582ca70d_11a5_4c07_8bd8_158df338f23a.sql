
-- Add the missing tipo_solicitacao column to the solicitacoes table
ALTER TABLE public.solicitacoes 
ADD COLUMN IF NOT EXISTS tipo_solicitacao text DEFAULT 'Geral';

-- Update any existing records to have the default value
UPDATE public.solicitacoes 
SET tipo_solicitacao = 'Geral' 
WHERE tipo_solicitacao IS NULL;
