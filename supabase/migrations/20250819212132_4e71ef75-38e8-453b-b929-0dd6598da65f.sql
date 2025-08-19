
-- Verificar e corrigir a estrutura da tabela solicitacoes
-- Adicionar coluna prioridade se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'solicitacoes' AND column_name = 'prioridade'
    ) THEN
        ALTER TABLE solicitacoes ADD COLUMN prioridade text DEFAULT 'Media' 
        CHECK (prioridade IN ('Baixa', 'Media', 'Alta'));
    END IF;
END $$;

-- Verificar e ajustar outras colunas que podem estar faltando
DO $$ 
BEGIN
    -- Adicionar valor_solicitado se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'solicitacoes' AND column_name = 'valor_solicitado'
    ) THEN
        ALTER TABLE solicitacoes ADD COLUMN valor_solicitado numeric;
    END IF;
    
    -- Adicionar justificativa se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'solicitacoes' AND column_name = 'justificativa'
    ) THEN
        ALTER TABLE solicitacoes ADD COLUMN justificativa text;
    END IF;
    
    -- Adicionar data_limite se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'solicitacoes' AND column_name = 'data_limite'
    ) THEN
        ALTER TABLE solicitacoes ADD COLUMN data_limite timestamp with time zone;
    END IF;
    
    -- Adicionar aprovadores_necessarios se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'solicitacoes' AND column_name = 'aprovadores_necessarios'
    ) THEN
        ALTER TABLE solicitacoes ADD COLUMN aprovadores_necessarios jsonb DEFAULT '[]'::jsonb;
    END IF;
    
    -- Adicionar aprovadores_completos se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'solicitacoes' AND column_name = 'aprovadores_completos'
    ) THEN
        ALTER TABLE solicitacoes ADD COLUMN aprovadores_completos jsonb DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Atualizar as políticas RLS para permitir que admins vejam todas as solicitações
DROP POLICY IF EXISTS "Admins podem ver todas as solicitações" ON solicitacoes;
CREATE POLICY "Admins podem ver todas as solicitações" 
ON solicitacoes FOR SELECT 
USING (is_admin_user_safe());

DROP POLICY IF EXISTS "Admins podem gerenciar solicitações" ON solicitacoes;
CREATE POLICY "Admins podem gerenciar solicitações" 
ON solicitacoes FOR ALL 
USING (is_admin_user_safe())
WITH CHECK (is_admin_user_safe());
