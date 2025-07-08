-- Criar tabela de categorias de documentos
CREATE TABLE public.document_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  icon text,
  color text DEFAULT '#3B82F6',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Adicionar coluna de categoria na tabela documents
ALTER TABLE public.documents 
ADD COLUMN category_id uuid REFERENCES public.document_categories(id);

-- Inserir categorias padrão
INSERT INTO public.document_categories (name, description, icon, color) VALUES
('Contratos', 'Contratos e acordos', 'FileText', '#10B981'),
('Relatórios', 'Relatórios de progresso e resultados', 'BarChart3', '#3B82F6'),
('Cronograma', 'Cronogramas e planejamentos', 'Calendar', '#8B5CF6'),
('Propostas', 'Propostas comerciais e técnicas', 'FileCheck', '#F59E0B'),
('Faturas', 'Faturas e documentos financeiros', 'Receipt', '#EF4444'),
('Documentos Gerais', 'Outros documentos importantes', 'Folder', '#6B7280'),
('Manuais', 'Manuais e documentação técnica', 'Book', '#06B6D4'),
('Certificados', 'Certificados e documentos oficiais', 'Award', '#F97316');

-- Habilitar RLS na tabela document_categories
ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;

-- Política para visualizar categorias (todos podem ver)
CREATE POLICY "Anyone can view document categories" 
ON public.document_categories 
FOR SELECT 
USING (true);

-- Política para admins gerenciarem categorias
CREATE POLICY "Admins can manage document categories" 
ON public.document_categories 
FOR ALL 
USING (is_admin_user_safe());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_document_categories_updated_at
BEFORE UPDATE ON public.document_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();