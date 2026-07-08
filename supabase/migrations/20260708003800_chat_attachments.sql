-- 1. Adicionar colunas extras na tabela de mensagens de chat para suportar anexos e tags de contexto
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS context_type TEXT;

-- 2. Configurar o Bucket do Supabase Storage para os anexos do chat (público)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Habilitar segurança RLS no bucket se não estiver habilitada
-- Nota: A tabela storage.objects por padrão já tem RLS habilitado.

-- 4. Criar políticas de RLS para o Bucket chat-attachments
DROP POLICY IF EXISTS "Qualquer usuario autenticado pode ver anexos do chat" ON storage.objects;
CREATE POLICY "Qualquer usuario autenticado pode ver anexos do chat"
    ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'chat-attachments');

DROP POLICY IF EXISTS "Qualquer usuario autenticado pode enviar anexos do chat" ON storage.objects;
CREATE POLICY "Qualquer usuario autenticado pode enviar anexos do chat"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'chat-attachments');

DROP POLICY IF EXISTS "Qualquer usuario autenticado pode deletar seus proprios anexos do chat" ON storage.objects;
CREATE POLICY "Qualquer usuario autenticado pode deletar seus proprios anexos do chat"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'chat-attachments' AND owner = auth.uid());
