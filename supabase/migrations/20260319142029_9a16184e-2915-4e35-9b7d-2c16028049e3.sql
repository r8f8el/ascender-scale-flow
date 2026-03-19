
-- Add icon column to document_categories if not exists
ALTER TABLE public.document_categories ADD COLUMN IF NOT EXISTS icon text DEFAULT 'FileText';

-- Seed default document categories if empty
INSERT INTO public.document_categories (name, description, color, icon)
SELECT * FROM (VALUES
  ('Contratos', 'Contratos e acordos', '#3B82F6', 'FileText'),
  ('Relatórios', 'Relatórios financeiros e operacionais', '#10B981', 'BarChart3'),
  ('Notas Fiscais', 'Notas fiscais e recibos', '#F59E0B', 'Receipt'),
  ('Apresentações', 'Apresentações e propostas', '#8B5CF6', 'Presentation'),
  ('Outros', 'Documentos diversos', '#6B7280', 'File')
) AS v(name, description, color, icon)
WHERE NOT EXISTS (SELECT 1 FROM public.document_categories LIMIT 1);
