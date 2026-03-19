
-- Create storage bucket for documents if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('documents', 'documents', false, 52428800, ARRAY['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','image/jpeg','image/png','image/gif','text/csv'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for documents bucket
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Authenticated users can read documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'documents');

CREATE POLICY "Authenticated users can delete documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'documents');

CREATE POLICY "Authenticated users can update documents"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

-- Create trigger to auto-create fpa_clients when a client_profile is created
CREATE OR REPLACE FUNCTION public.auto_create_fpa_client()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.fpa_clients (client_profile_id, company_name, onboarding_completed, current_phase)
  VALUES (NEW.id, COALESCE(NEW.company, NEW.name), false, 1)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_auto_create_fpa_client ON public.client_profiles;
CREATE TRIGGER trigger_auto_create_fpa_client
  AFTER INSERT ON public.client_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_fpa_client();

-- Auto-create fpa_clients for all existing client_profiles that don't have one
INSERT INTO public.fpa_clients (client_profile_id, company_name, onboarding_completed, current_phase)
SELECT cp.id, COALESCE(cp.company, cp.name), false, 1
FROM public.client_profiles cp
LEFT JOIN public.fpa_clients fc ON fc.client_profile_id = cp.id
WHERE fc.id IS NULL;
