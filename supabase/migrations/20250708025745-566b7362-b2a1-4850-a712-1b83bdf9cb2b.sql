-- Corrigir políticas RLS para evitar recursão infinita

-- Primeiro, remover as políticas problemáticas
DROP POLICY IF EXISTS "Admins can view all documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can manage all requests" ON public.requests;
DROP POLICY IF EXISTS "Admins can access all documents" ON storage.objects;

-- Recriar políticas usando funções security definer existentes
-- Políticas para documentos
CREATE POLICY "Admins can view all documents" 
ON public.documents 
FOR ALL 
USING (public.is_admin_user());

-- Políticas para solicitações
CREATE POLICY "Admins can manage all requests" 
ON public.requests 
FOR ALL 
USING (public.is_admin_user());

-- Políticas de storage para documentos (admins)
CREATE POLICY "Admins can access all documents" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'documents' AND public.is_admin_user());