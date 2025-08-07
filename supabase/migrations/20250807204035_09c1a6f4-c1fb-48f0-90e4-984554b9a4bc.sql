-- Add missing foreign keys for FP&A domain to enable PostgREST relationship expansions used by the app
DO $$ BEGIN
  -- fpa_financial_data.fpa_client_id -> fpa_clients(id)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fpa_financial_data_fpa_client_id_fkey'
  ) THEN
    ALTER TABLE public.fpa_financial_data
    ADD CONSTRAINT fpa_financial_data_fpa_client_id_fkey
    FOREIGN KEY (fpa_client_id)
    REFERENCES public.fpa_clients(id)
    ON DELETE CASCADE;
  END IF;

  -- fpa_financial_data.period_id -> fpa_periods(id)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fpa_financial_data_period_id_fkey'
  ) THEN
    ALTER TABLE public.fpa_financial_data
    ADD CONSTRAINT fpa_financial_data_period_id_fkey
    FOREIGN KEY (period_id)
    REFERENCES public.fpa_periods(id)
    ON DELETE CASCADE;
  END IF;

  -- fpa_variance_analysis.fpa_client_id -> fpa_clients(id)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fpa_variance_analysis_fpa_client_id_fkey'
  ) THEN
    ALTER TABLE public.fpa_variance_analysis
    ADD CONSTRAINT fpa_variance_analysis_fpa_client_id_fkey
    FOREIGN KEY (fpa_client_id)
    REFERENCES public.fpa_clients(id)
    ON DELETE CASCADE;
  END IF;

  -- fpa_variance_analysis.period_id -> fpa_periods(id)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fpa_variance_analysis_period_id_fkey'
  ) THEN
    ALTER TABLE public.fpa_variance_analysis
    ADD CONSTRAINT fpa_variance_analysis_period_id_fkey
    FOREIGN KEY (period_id)
    REFERENCES public.fpa_periods(id)
    ON DELETE CASCADE;
  END IF;

  -- fpa_variance_analysis.created_by -> admin_profiles(id)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fpa_variance_analysis_created_by_fkey'
  ) THEN
    ALTER TABLE public.fpa_variance_analysis
    ADD CONSTRAINT fpa_variance_analysis_created_by_fkey
    FOREIGN KEY (created_by)
    REFERENCES public.admin_profiles(id)
    ON DELETE SET NULL;
  END IF;

  -- fpa_reports.fpa_client_id -> fpa_clients(id)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fpa_reports_fpa_client_id_fkey'
  ) THEN
    ALTER TABLE public.fpa_reports
    ADD CONSTRAINT fpa_reports_fpa_client_id_fkey
    FOREIGN KEY (fpa_client_id)
    REFERENCES public.fpa_clients(id)
    ON DELETE CASCADE;
  END IF;

  -- fpa_reports.created_by -> admin_profiles(id)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fpa_reports_created_by_fkey'
  ) THEN
    ALTER TABLE public.fpa_reports
    ADD CONSTRAINT fpa_reports_created_by_fkey
    FOREIGN KEY (created_by)
    REFERENCES public.admin_profiles(id)
    ON DELETE SET NULL;
  END IF;

  -- fpa_data_uploads.fpa_client_id -> fpa_clients(id)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fpa_data_uploads_fpa_client_id_fkey'
  ) THEN
    ALTER TABLE public.fpa_data_uploads
    ADD CONSTRAINT fpa_data_uploads_fpa_client_id_fkey
    FOREIGN KEY (fpa_client_id)
    REFERENCES public.fpa_clients(id)
    ON DELETE CASCADE;
  END IF;

  -- fpa_data_uploads.period_id -> fpa_periods(id)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fpa_data_uploads_period_id_fkey'
  ) THEN
    ALTER TABLE public.fpa_data_uploads
    ADD CONSTRAINT fpa_data_uploads_period_id_fkey
    FOREIGN KEY (period_id)
    REFERENCES public.fpa_periods(id)
    ON DELETE SET NULL;
  END IF;

  -- fpa_data_uploads.uploaded_by -> admin_profiles(id)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fpa_data_uploads_uploaded_by_fkey'
  ) THEN
    ALTER TABLE public.fpa_data_uploads
    ADD CONSTRAINT fpa_data_uploads_uploaded_by_fkey
    FOREIGN KEY (uploaded_by)
    REFERENCES public.admin_profiles(id)
    ON DELETE SET NULL;
  END IF;

  -- fpa_periods.fpa_client_id -> fpa_clients(id)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fpa_periods_fpa_client_id_fkey'
  ) THEN
    ALTER TABLE public.fpa_periods
    ADD CONSTRAINT fpa_periods_fpa_client_id_fkey
    FOREIGN KEY (fpa_client_id)
    REFERENCES public.fpa_clients(id)
    ON DELETE CASCADE;
  END IF;

  -- fpa_drivers.fpa_client_id -> fpa_clients(id)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fpa_drivers_fpa_client_id_fkey'
  ) THEN
    ALTER TABLE public.fpa_drivers
    ADD CONSTRAINT fpa_drivers_fpa_client_id_fkey
    FOREIGN KEY (fpa_client_id)
    REFERENCES public.fpa_clients(id)
    ON DELETE CASCADE;
  END IF;
END $$;