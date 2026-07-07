-- 1. Trigger de auditoria para fpa_periods (trancamento/destrancamento)
CREATE OR REPLACE FUNCTION public.audit_fpa_periods_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_email TEXT;
    v_user_name TEXT;
    v_details TEXT;
BEGIN
    v_user_email := auth.jwt() ->> 'email';
    
    SELECT name INTO v_user_name FROM public.admin_profiles WHERE id = auth.uid();
    IF v_user_name IS NULL THEN
        SELECT name INTO v_user_name FROM public.client_profiles WHERE id = auth.uid();
    END IF;
    
    IF v_user_name IS NULL THEN
        v_user_name := COALESCE(v_user_email, 'Sistema');
    END IF;

    -- Registrar somente se houver mudança de trava (is_locked)
    IF (OLD.is_locked IS DISTINCT FROM NEW.is_locked) THEN
        v_details := format(
            'Período "%s" teve o status de trancamento alterado de %s para %s.', 
            NEW.period_name, 
            CASE WHEN OLD.is_locked THEN 'Trancado' ELSE 'Aberto' END,
            CASE WHEN NEW.is_locked THEN 'Trancado' ELSE 'Aberto' END
        );

        INSERT INTO public.system_logs (
            action, 
            details, 
            user_id, 
            user_email, 
            user_name, 
            type, 
            level
        ) VALUES (
            CASE WHEN NEW.is_locked THEN 'fpa_period_lock' ELSE 'fpa_period_unlock' END,
            v_details,
            auth.uid(),
            v_user_email,
            v_user_name,
            'fpa',
            'info'
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_fpa_periods_update ON public.fpa_periods;
CREATE TRIGGER audit_fpa_periods_update
    AFTER UPDATE ON public.fpa_periods
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_fpa_periods_changes();


-- 2. Trigger de auditoria para fpa_financial_data (importação e alterações de dados)
CREATE OR REPLACE FUNCTION public.audit_fpa_financial_data_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_email TEXT;
    v_user_name TEXT;
    v_details TEXT;
    v_period_name TEXT;
BEGIN
    v_user_email := auth.jwt() ->> 'email';
    
    SELECT name INTO v_user_name FROM public.admin_profiles WHERE id = auth.uid();
    IF v_user_name IS NULL THEN
        SELECT name INTO v_user_name FROM public.client_profiles WHERE id = auth.uid();
    END IF;
    
    IF v_user_name IS NULL THEN
        v_user_name := COALESCE(v_user_email, 'Sistema');
    END IF;

    -- Obter o nome do período
    IF TG_OP = 'DELETE' THEN
        SELECT period_name INTO v_period_name FROM public.fpa_periods WHERE id = OLD.period_id;
    ELSE
        SELECT period_name INTO v_period_name FROM public.fpa_periods WHERE id = NEW.period_id;
    END IF;

    IF TG_OP = 'INSERT' THEN
        v_details := format(
            'Importado/Inserido dado financeiro de "%s" no período "%s". Valor: %s.',
            NEW.account_name,
            COALESCE(v_period_name, 'N/A'),
            NEW.amount
        );
    ELSIF TG_OP = 'UPDATE' THEN
        v_details := format(
            'Atualizado dado financeiro de "%s" no período "%s". Valor alterado de %s para %s.',
            NEW.account_name,
            COALESCE(v_period_name, 'N/A'),
            OLD.amount,
            NEW.amount
        );
    ELSIF TG_OP = 'DELETE' THEN
        v_details := format(
            'Removido dado financeiro de "%s" no período "%s". Valor era: %s.',
            OLD.account_name,
            COALESCE(v_period_name, 'N/A'),
            OLD.amount
        );
    END IF;

    INSERT INTO public.system_logs (
        action, 
        details, 
        user_id, 
        user_email, 
        user_name, 
        type, 
        level
    ) VALUES (
        format('fpa_financial_%s', lower(TG_OP)),
        v_details,
        auth.uid(),
        v_user_email,
        v_user_name,
        'fpa',
        'info'
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

DROP TRIGGER IF EXISTS audit_fpa_financial_data_changes_trigger ON public.fpa_financial_data;
CREATE TRIGGER audit_fpa_financial_data_changes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.fpa_financial_data
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_fpa_financial_data_changes();


-- 3. Trigger de auditoria para fpa_data_uploads (envio de planilhas por clientes)
CREATE OR REPLACE FUNCTION public.audit_fpa_uploads_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_email TEXT;
    v_user_name TEXT;
    v_details TEXT;
BEGIN
    v_user_email := auth.jwt() ->> 'email';
    
    SELECT name INTO v_user_name FROM public.admin_profiles WHERE id = auth.uid();
    IF v_user_name IS NULL THEN
        SELECT name INTO v_user_name FROM public.client_profiles WHERE id = auth.uid();
    END IF;
    
    IF v_user_name IS NULL THEN
        v_user_name := COALESCE(v_user_email, 'Sistema');
    END IF;

    v_details := format(
        'Cliente enviou planilha de dados: "%s" (Status: %s).',
        NEW.file_name,
        NEW.status
    );

    INSERT INTO public.system_logs (
        action, 
        details, 
        user_id, 
        user_email, 
        user_name, 
        type, 
        level
    ) VALUES (
        'fpa_upload_submit',
        v_details,
        auth.uid(),
        v_user_email,
        v_user_name,
        'fpa',
        'info'
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_fpa_uploads_changes_trigger ON public.fpa_data_uploads;
CREATE TRIGGER audit_fpa_uploads_changes_trigger
    AFTER INSERT ON public.fpa_data_uploads
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_fpa_uploads_changes();
