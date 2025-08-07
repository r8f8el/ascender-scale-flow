
-- Criar políticas RLS para permitir que admins vejam e gerenciem todos os documentos
CREATE POLICY "Admins can upload documents for any client" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'documents' 
  AND is_admin_user_safe()
);

-- Política para admins visualizarem todos os documentos
CREATE POLICY "Admins can view all documents in storage"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'documents'
  AND is_admin_user_safe()
);

-- Política para admins deletarem qualquer documento
CREATE POLICY "Admins can delete any document in storage"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'documents'
  AND is_admin_user_safe()
);

-- Adicionar coluna para identificar quem fez o upload (admin ou cliente)
ALTER TABLE client_documents 
ADD COLUMN uploaded_by_admin_id uuid REFERENCES admin_profiles(id);

-- Adicionar trigger para atualizar timestamp automaticamente
CREATE TRIGGER update_client_documents_updated_at
  BEFORE UPDATE ON client_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_client_documents_updated_at();
