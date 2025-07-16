-- Corrigir políticas de storage para ticket-attachments
-- Remover todas as políticas antigas e criar novas mais permissivas

-- Deletar políticas existentes para o bucket ticket-attachments
DROP POLICY IF EXISTS "Users can upload ticket attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can view ticket attachments" ON storage.objects; 
DROP POLICY IF EXISTS "Users can delete ticket attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to ticket-attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view ticket-attachments" ON storage.objects;

-- Criar políticas mais simples e funcionais
CREATE POLICY "Enable upload for authenticated users on ticket-attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
    bucket_id = 'ticket-attachments' 
    AND auth.uid() IS NOT NULL
);

CREATE POLICY "Enable read for authenticated users on ticket-attachments" 
ON storage.objects 
FOR SELECT 
USING (
    bucket_id = 'ticket-attachments' 
    AND auth.uid() IS NOT NULL
);

CREATE POLICY "Enable update for authenticated users on ticket-attachments" 
ON storage.objects 
FOR UPDATE 
USING (
    bucket_id = 'ticket-attachments' 
    AND auth.uid() IS NOT NULL
);

CREATE POLICY "Enable delete for admins on ticket-attachments" 
ON storage.objects 
FOR DELETE 
USING (
    bucket_id = 'ticket-attachments' 
    AND (
        EXISTS (
            SELECT 1 FROM public.admin_profiles 
            WHERE admin_profiles.id = auth.uid()
        )
    )
);

-- Verificar se o bucket existe, se não existir, criar
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'ticket-attachments', 
    'ticket-attachments', 
    false, 
    52428800, -- 50MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']::text[]
)
ON CONFLICT (id) DO NOTHING;