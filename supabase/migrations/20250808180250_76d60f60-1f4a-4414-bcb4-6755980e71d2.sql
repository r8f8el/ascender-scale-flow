-- Harden the validation function with explicit search_path and security definer
CREATE OR REPLACE FUNCTION public.validate_client_bi_embed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF (NEW.embed_url IS NULL OR btrim(NEW.embed_url) = '')
     AND (NEW.iframe_html IS NULL OR btrim(NEW.iframe_html) = '') THEN
    RAISE EXCEPTION 'Either embed_url or iframe_html must be provided for BI embed.';
  END IF;
  RETURN NEW;
END;
$$;