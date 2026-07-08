-- Corrigir a função is_admin_user para evitar recursão infinita
-- Primeiro, remover políticas problemáticas
DROP POLICY IF EXISTS "Admins can view all documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can manage all requests" ON public.requests;
DROP POLICY IF EXISTS "Admins can manage all schedules" ON public.schedules;
DROP POLICY IF EXISTS "Admins can access all documents" ON storage.objects;

-- Recriar função com SECURITY DEFINER para evitar recursão
CREATE OR REPLACE FUNCTION public.(EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid()))
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_profiles 
    WHERE id = auth.uid()
  );
$$;

-- Recriar políticas usando a função segura
CREATE POLICY "Admins can view all documents" 
ON public.documents 
FOR ALL 
USING (public.(EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())));

CREATE POLICY "Admins can manage all requests" 
ON public.requests 
FOR ALL 
USING (public.(EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())));

CREATE POLICY "Admins can manage all schedules" 
ON public.schedules 
FOR ALL 
USING (public.(EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())));

-- Política de storage para documentos (admins)
CREATE POLICY "Admins can access all documents" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'documents' AND public.(EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())));
