-- Create table for client-specific BI embeds
CREATE TABLE IF NOT EXISTS public.client_bi_embeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fpa_client_id UUID REFERENCES public.fpa_clients(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- e.g., powerbi, tableau, looker_studio, metabase, other
  title TEXT,
  description TEXT,
  embed_url TEXT,           -- Preferred: use src for iframe
  iframe_html TEXT,         -- Optional: full iframe HTML when provider requires
  filters JSONB,            -- Optional: provider-specific filters
  is_active BOOLEAN NOT NULL DEFAULT true,
  external_dashboard_id TEXT,
  access_mode TEXT NOT NULL DEFAULT 'secure', -- secure | public | internal
  created_by UUID,          -- admin user id
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.client_bi_embeds ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_client_bi_embeds_fpa_client_id ON public.client_bi_embeds(fpa_client_id);
CREATE INDEX IF NOT EXISTS idx_client_bi_embeds_is_active ON public.client_bi_embeds(is_active);

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trg_client_bi_embeds_updated_at ON public.client_bi_embeds;
CREATE TRIGGER trg_client_bi_embeds_updated_at
BEFORE UPDATE ON public.client_bi_embeds
FOR EACH ROW
EXECUTE FUNCTION public.update_fpa_updated_at_column();

-- Validation: ensure at least one of embed_url or iframe_html is provided
CREATE OR REPLACE FUNCTION public.validate_client_bi_embed()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.embed_url IS NULL OR btrim(NEW.embed_url) = '')
     AND (NEW.iframe_html IS NULL OR btrim(NEW.iframe_html) = '') THEN
    RAISE EXCEPTION 'Either embed_url or iframe_html must be provided for BI embed.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_client_bi_embeds_validate ON public.client_bi_embeds;
CREATE TRIGGER trg_client_bi_embeds_validate
BEFORE INSERT OR UPDATE ON public.client_bi_embeds
FOR EACH ROW
EXECUTE FUNCTION public.validate_client_bi_embed();

-- RLS Policies
-- Admins can manage all embeds
DROP POLICY IF EXISTS "Admins can manage all BI embeds" ON public.client_bi_embeds;
CREATE POLICY "Admins can manage all BI embeds"
ON public.client_bi_embeds
FOR ALL
USING (is_admin_user_safe())
WITH CHECK (is_admin_user_safe());

-- Clients can view their own embeds
DROP POLICY IF EXISTS "Clients can view their BI embeds" ON public.client_bi_embeds;
CREATE POLICY "Clients can view their BI embeds"
ON public.client_bi_embeds
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.fpa_clients c
    WHERE c.id = client_bi_embeds.fpa_client_id
      AND (c.client_profile_id = auth.uid() OR is_admin_user_safe())
  )
);
