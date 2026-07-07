-- Create client_document_requests table
CREATE TABLE public.client_document_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected')),
    period_reference TEXT NOT NULL, -- e.g. '2026-06'
    category TEXT, -- e.g. 'Contrato', 'Relatório', 'Fatura', 'Outros'
    file_path TEXT, -- path in storage bucket
    filename TEXT,
    file_size BIGINT,
    content_type TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.client_document_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- 1. Admins have full access
CREATE POLICY "Admins have full access on document requests" ON public.client_document_requests
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid()));

-- 2. Clients can view their own requests
CREATE POLICY "Clients can view their own document requests" ON public.client_document_requests
    FOR SELECT TO authenticated
    USING (client_id = auth.uid());

-- 3. Clients can update their own requests (specifically to submit files)
CREATE POLICY "Clients can update their own document requests for submission" ON public.client_document_requests
    FOR UPDATE TO authenticated
    USING (client_id = auth.uid())
    WITH CHECK (client_id = auth.uid());

-- Create trigger function to automatically register submitted checklist documents in client_documents
CREATE OR REPLACE FUNCTION public.handle_document_request_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- If status changed to 'submitted' and we have a valid file_path, and it's a new file upload
  IF NEW.status = 'submitted' AND NEW.file_path IS NOT NULL AND (OLD.file_path IS NULL OR OLD.file_path <> NEW.file_path) THEN
    INSERT INTO public.client_documents (
      filename,
      file_path,
      file_size,
      content_type,
      category,
      description,
      user_id,
      uploaded_at,
      updated_at
    ) VALUES (
      NEW.filename,
      NEW.file_path,
      NEW.file_size,
      COALESCE(NEW.content_type, 'application/octet-stream'),
      COALESCE(NEW.category, 'Outros'),
      COALESCE(NEW.description, 'Enviado via Checklist de Documentos'),
      NEW.client_id,
      now(),
      now()
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_document_request_submitted ON public.client_document_requests;
CREATE TRIGGER on_document_request_submitted
  AFTER UPDATE ON public.client_document_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_document_request_submission();
