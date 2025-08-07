
-- Criar tabela para categorias de documentos se não existir
CREATE TABLE IF NOT EXISTS public.document_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'FileText',
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir categorias padrão se não existirem
INSERT INTO public.document_categories (name, description, icon, color) 
VALUES 
  ('Documentos Fiscais', 'Notas fiscais, recibos e documentos tributários', 'Receipt', '#10B981'),
  ('Contratos', 'Contratos e acordos comerciais', 'FileContract', '#F59E0B'),
  ('Relatórios Financeiros', 'Relatórios de desempenho financeiro', 'TrendingUp', '#3B82F6'),
  ('Balancetes', 'Balancetes mensais e trimestrais', 'Calculator', '#8B5CF6'),
  ('DRE', 'Demonstrativo de Resultado do Exercício', 'BarChart3', '#EF4444'),
  ('Fluxo de Caixa', 'Controle de fluxo de caixa', 'ArrowRightLeft', '#06B6D4'),
  ('Orçamentos', 'Planejamentos orçamentários', 'Target', '#F97316'),
  ('Outros', 'Documentos diversos', 'FileText', '#6B7280')
ON CONFLICT (name) DO NOTHING;

-- Verificar se a coluna category_id existe na tabela client_documents
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'client_documents' AND column_name = 'category_id') THEN
        ALTER TABLE public.client_documents ADD COLUMN category_id UUID REFERENCES public.document_categories(id);
    END IF;
END $$;

-- Atualizar documentos existentes para ter uma categoria padrão
UPDATE public.client_documents 
SET category_id = (SELECT id FROM public.document_categories WHERE name = 'Outros' LIMIT 1)
WHERE category_id IS NULL;

-- Criar política RLS para categorias de documentos
ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view document categories" ON public.document_categories;
CREATE POLICY "Anyone can view document categories" 
ON public.document_categories FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Admins can manage document categories" ON public.document_categories;
CREATE POLICY "Admins can manage document categories" 
ON public.document_categories FOR ALL 
USING (is_admin_user_safe());
