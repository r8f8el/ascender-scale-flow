-- Verificar e corrigir políticas do storage para o bucket ticket-attachments
-- Primeiro vamos garantir que o bucket existe e é configurado corretamente

-- Criar política para permitir upload de anexos no bucket ticket-attachments
DO $$
BEGIN
    -- Deletar políticas existentes se houver
    DROP POLICY IF EXISTS "Users can upload ticket attachments" ON storage.objects;
    DROP POLICY IF EXISTS "Users can view ticket attachments" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete ticket attachments" ON storage.objects;
    
    -- Criar novas políticas
    CREATE POLICY "Users can upload ticket attachments" 
    ON storage.objects 
    FOR INSERT 
    WITH CHECK (
      bucket_id = 'ticket-attachments' 
      AND (
        -- Permitir upload se o usuário está autenticado
        auth.uid() IS NOT NULL
      )
    );

    CREATE POLICY "Users can view ticket attachments" 
    ON storage.objects 
    FOR SELECT 
    USING (
      bucket_id = 'ticket-attachments' 
      AND (
        -- Permitir visualização se o usuário está autenticado
        auth.uid() IS NOT NULL
        OR
        -- Ou se é um admin
        EXISTS (
          SELECT 1 FROM admin_profiles 
          WHERE admin_profiles.id = auth.uid()
        )
      )
    );

    CREATE POLICY "Users can delete ticket attachments" 
    ON storage.objects 
    FOR DELETE 
    USING (
      bucket_id = 'ticket-attachments' 
      AND (
        -- Permitir deleção se o usuário é admin
        EXISTS (
          SELECT 1 FROM admin_profiles 
          WHERE admin_profiles.id = auth.uid()
        )
      )
    );
    
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Erro ao criar políticas de storage: %', SQLERRM;
END $$;