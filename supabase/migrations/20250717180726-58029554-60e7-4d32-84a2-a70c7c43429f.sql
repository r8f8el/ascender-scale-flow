
-- Criar tabela para salas de chat
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para mensagens do chat
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_type TEXT CHECK (sender_type IN ('client', 'admin')) NOT NULL,
  chat_room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para arquivos (melhorada)
CREATE TABLE IF NOT EXISTS public.files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  size BIGINT NOT NULL,
  type TEXT,
  category TEXT DEFAULT 'Sem categoria',
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Políticas para chat_rooms
CREATE POLICY "Clients can view own chat rooms" ON public.chat_rooms
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Clients can create own chat rooms" ON public.chat_rooms
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Admins can view all chat rooms" ON public.chat_rooms
  FOR ALL USING (is_admin_user_safe());

-- Políticas para chat_messages
CREATE POLICY "Users can view messages from their rooms" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE chat_rooms.id = chat_messages.chat_room_id 
      AND (chat_rooms.client_id = auth.uid() OR is_admin_user_safe())
    )
  );

CREATE POLICY "Users can create messages in their rooms" ON public.chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE chat_rooms.id = chat_messages.chat_room_id 
      AND (chat_rooms.client_id = auth.uid() OR is_admin_user_safe())
    )
  );

-- Políticas para files
CREATE POLICY "Clients can view own files" ON public.files
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Clients can create own files" ON public.files
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update own files" ON public.files
  FOR UPDATE USING (auth.uid() = client_id);

CREATE POLICY "Clients can delete own files" ON public.files
  FOR DELETE USING (auth.uid() = client_id);

CREATE POLICY "Admins can manage all files" ON public.files
  FOR ALL USING (is_admin_user_safe());

-- Criar bucket de storage para arquivos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('files', 'files', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas para o bucket de storage
CREATE POLICY "Users can upload their own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'files' AND 
    (auth.uid()::text = (storage.foldername(name))[1] OR is_admin_user_safe())
  );

CREATE POLICY "Users can view their own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'files' AND 
    (auth.uid()::text = (storage.foldername(name))[1] OR is_admin_user_safe())
  );

CREATE POLICY "Users can update their own files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'files' AND 
    (auth.uid()::text = (storage.foldername(name))[1] OR is_admin_user_safe())
  );

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'files' AND 
    (auth.uid()::text = (storage.foldername(name))[1] OR is_admin_user_safe())
  );

-- Habilitar realtime para as tabelas
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.files;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON public.chat_rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON public.files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar last_message_at em chat_rooms
CREATE OR REPLACE FUNCTION update_chat_room_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chat_rooms 
  SET last_message_at = NOW() 
  WHERE id = NEW.chat_room_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_room_last_message_trigger 
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION update_chat_room_last_message();
