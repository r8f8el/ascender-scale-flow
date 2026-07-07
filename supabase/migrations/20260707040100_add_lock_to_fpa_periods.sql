-- 1. Adicionar coluna is_locked na tabela fpa_periods
ALTER TABLE public.fpa_periods ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT false;

-- 2. Função de trigger para validar se o período está trancado
CREATE OR REPLACE FUNCTION public.check_fpa_period_locked()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_period_id UUID;
    v_is_locked BOOLEAN;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_period_id := OLD.period_id;
    ELSE
        v_period_id := NEW.period_id;
    END IF;

    IF v_period_id IS NOT NULL THEN
        SELECT is_locked INTO v_is_locked FROM public.fpa_periods WHERE id = v_period_id;
        IF v_is_locked = true THEN
            RAISE EXCEPTION 'Operação negada: O período selecionado está trancado para edições.';
        END IF;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- 3. Triggers protetores
DROP TRIGGER IF EXISTS ensure_fpa_financial_data_not_locked ON public.fpa_financial_data;
CREATE TRIGGER ensure_fpa_financial_data_not_locked
    BEFORE INSERT OR UPDATE OR DELETE ON public.fpa_financial_data
    FOR EACH ROW
    EXECUTE FUNCTION public.check_fpa_period_locked();

DROP TRIGGER IF EXISTS ensure_fpa_data_uploads_not_locked ON public.fpa_data_uploads;
CREATE TRIGGER ensure_fpa_data_uploads_not_locked
    BEFORE INSERT OR UPDATE OR DELETE ON public.fpa_data_uploads
    FOR EACH ROW
    EXECUTE FUNCTION public.check_fpa_period_locked();
