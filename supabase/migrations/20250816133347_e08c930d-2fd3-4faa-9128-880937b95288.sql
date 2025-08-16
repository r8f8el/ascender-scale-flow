
-- Atualizar a estrutura para suportar múltiplos BI embeds
ALTER TABLE public.client_bi_embeds 
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS category text DEFAULT 'dashboard',
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_client_bi_embeds_client_active 
ON public.client_bi_embeds(fpa_client_id, is_active) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_client_bi_embeds_order 
ON public.client_bi_embeds(fpa_client_id, display_order, is_active);

-- Atualizar a função de validação para ser mais flexível
CREATE OR REPLACE FUNCTION public.validate_client_bi_embed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Pelo menos uma das opções deve estar preenchida
  IF (NEW.embed_url IS NULL OR btrim(NEW.embed_url) = '')
     AND (NEW.iframe_html IS NULL OR btrim(NEW.iframe_html) = '') THEN
    RAISE EXCEPTION 'Either embed_url or iframe_html must be provided for BI embed.';
  END IF;
  
  -- Validar categoria
  IF NEW.category IS NOT NULL AND NEW.category NOT IN ('dashboard', 'report', 'analytics', 'kpi', 'custom') THEN
    RAISE EXCEPTION 'Invalid category. Must be one of: dashboard, report, analytics, kpi, custom';
  END IF;
  
  -- Sanitizar título se fornecido
  IF NEW.title IS NOT NULL THEN
    NEW.title := TRIM(NEW.title);
    IF LENGTH(NEW.title) = 0 THEN
      NEW.title := NULL;
    END IF;
  END IF;
  
  -- Sanitizar descrição se fornecida
  IF NEW.description IS NOT NULL THEN
    NEW.description := TRIM(NEW.description);
    IF LENGTH(NEW.description) = 0 THEN
      NEW.description := NULL;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Criar ou atualizar trigger
DROP TRIGGER IF EXISTS validate_client_bi_embed_trigger ON public.client_bi_embeds;
CREATE TRIGGER validate_client_bi_embed_trigger
  BEFORE INSERT OR UPDATE ON public.client_bi_embeds
  FOR EACH ROW EXECUTE FUNCTION validate_client_bi_embed();

-- Função para obter embeds disponíveis para um cliente
CREATE OR REPLACE FUNCTION public.get_client_bi_embeds(p_client_id uuid)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  provider text,
  category text,
  embed_url text,
  iframe_html text,
  is_featured boolean,
  display_order integer,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    cbe.id,
    cbe.title,
    cbe.description,
    cbe.provider,
    cbe.category,
    cbe.embed_url,
    cbe.iframe_html,
    cbe.is_featured,
    cbe.display_order,
    cbe.created_at
  FROM public.client_bi_embeds cbe
  WHERE cbe.fpa_client_id = p_client_id 
    AND cbe.is_active = true
  ORDER BY cbe.is_featured DESC, cbe.display_order ASC, cbe.created_at DESC;
END;
$function$;
