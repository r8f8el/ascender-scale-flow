-- Criar tabela de documentos
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  content_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para documents
CREATE POLICY "Users can view their own documents" 
ON public.documents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" 
ON public.documents 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" 
ON public.documents 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admins podem ver todos os documentos
CREATE POLICY "Admins can view all documents" 
ON public.documents 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.admin_profiles 
  WHERE id = auth.uid()
));

-- Criar tabela de solicitações
CREATE TABLE public.requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela requests
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para requests
CREATE POLICY "Users can view their own requests" 
ON public.requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own requests" 
ON public.requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests" 
ON public.requests 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Admins podem ver e gerenciar todas as solicitações
CREATE POLICY "Admins can manage all requests" 
ON public.requests 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.admin_profiles 
  WHERE id = auth.uid()
));

-- Criar bucket de storage para documentos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false);

-- Políticas de storage para documentos
CREATE POLICY "Users can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Admins podem acessar todos os documentos
CREATE POLICY "Admins can access all documents" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'documents' AND EXISTS (
  SELECT 1 FROM public.admin_profiles 
  WHERE id = auth.uid()
));

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();