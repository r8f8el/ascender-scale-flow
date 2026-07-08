
-- Corrigir a função para ter search_path seguro
CREATE OR REPLACE FUNCTION public.update_client_documents_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
