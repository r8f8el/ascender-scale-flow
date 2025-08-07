
-- Primeiro, vamos garantir que a tabela client_documents tenha a coluna category_id para referenciar document_categories
ALTER TABLE public.client_documents 
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.document_categories(id);

-- Migrar dados existentes da coluna category (texto) para category_id
UPDATE public.client_documents 
SET category_id = dc.id 
FROM public.document_categories dc 
WHERE public.client_documents.category = dc.name 
AND public.client_documents.category_id IS NULL;

-- Para documentos sem categoria correspondente, criar categoria "Outros" se não existir
INSERT INTO public.document_categories (name, description, icon, color)
VALUES ('Outros', 'Documentos diversos', 'FileText', '#6B7280')
ON CONFLICT (name) DO NOTHING;

-- Atualizar documentos sem categoria_id para usar "Outros"
UPDATE public.client_documents 
SET category_id = (SELECT id FROM public.document_categories WHERE name = 'Outros')
WHERE category_id IS NULL;

-- Tornar category_id obrigatório após migração
ALTER TABLE public.client_documents 
ALTER COLUMN category_id SET NOT NULL;

-- Remover a coluna category antiga após migração (opcional)
-- ALTER TABLE public.client_documents DROP COLUMN IF EXISTS category;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_client_documents_category_id ON public.client_documents(category_id);
CREATE INDEX IF NOT EXISTS idx_client_documents_user_id ON public.client_documents(user_id);

-- Atualizar as políticas RLS para garantir que admins vejam tudo e clientes apenas seus documentos
DROP POLICY IF EXISTS "Admins can manage all client documents" ON public.client_documents;
DROP POLICY IF EXISTS "Users can view their own documents" ON public.client_documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.client_documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.client_documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.client_documents;

-- Política para admins - acesso total
CREATE POLICY "Admins can manage all client documents"
ON public.client_documents
FOR ALL
TO authenticated
USING (is_admin_user_safe())
WITH CHECK (is_admin_user_safe());

-- Política para clientes - apenas seus próprios documentos
CREATE POLICY "Users can view their own documents"
ON public.client_documents
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR is_admin_user_safe());

CREATE POLICY "Users can insert their own documents"
ON public.client_documents
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR is_admin_user_safe());

CREATE POLICY "Users can update their own documents"
ON public.client_documents
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR is_admin_user_safe())
WITH CHECK (auth.uid() = user_id OR is_admin_user_safe());

CREATE POLICY "Users can delete their own documents"
ON public.client_documents
FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR is_admin_user_safe());
