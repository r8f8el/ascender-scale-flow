
-- Verificar e corrigir as políticas RLS para o bucket documents
-- Primeiro, vamos garantir que o bucket permite uploads dos usuários autenticados

-- Criar política para permitir INSERT no storage.objects para o bucket documents
CREATE POLICY "Users can upload to their own folder in documents bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = ('client-' || auth.uid()::text)
);

-- Criar política para permitir SELECT no storage.objects para o bucket documents  
CREATE POLICY "Users can view their own files in documents bucket"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'documents'
  AND auth.role() = 'authenticated' 
  AND (storage.foldername(name))[1] = ('client-' || auth.uid()::text)
);

-- Criar política para permitir DELETE no storage.objects para o bucket documents
CREATE POLICY "Users can delete their own files in documents bucket"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'documents'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = ('client-' || auth.uid()::text)
);

-- Verificar se o bucket existe e é privado (como deveria ser)
UPDATE storage.buckets 
SET public = false 
WHERE id = 'documents';
