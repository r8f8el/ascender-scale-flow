-- Create fpa_scenarios table for real financial scenario management
CREATE TABLE IF NOT EXISTS public.fpa_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fpa_client_id UUID NOT NULL REFERENCES public.fpa_clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'base' CHECK (type IN ('base', 'otimista', 'pessimista', 'custom')),
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('ativo', 'rascunho', 'arquivado')),
  assumptions JSONB DEFAULT '{}',
  results JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fpa_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated select on fpa_scenarios"
  ON public.fpa_scenarios FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert on fpa_scenarios"
  ON public.fpa_scenarios FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update on fpa_scenarios"
  ON public.fpa_scenarios FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete on fpa_scenarios"
  ON public.fpa_scenarios FOR DELETE TO authenticated USING (true);

-- Create fpa_model_drivers table
CREATE TABLE IF NOT EXISTS public.fpa_model_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fpa_client_id UUID NOT NULL REFERENCES public.fpa_clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('integer', 'currency', 'percentage', 'text')),
  current_value NUMERIC,
  formula TEXT,
  impact TEXT,
  weight NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fpa_model_drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated select on fpa_model_drivers"
  ON public.fpa_model_drivers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert on fpa_model_drivers"
  ON public.fpa_model_drivers FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update on fpa_model_drivers"
  ON public.fpa_model_drivers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete on fpa_model_drivers"
  ON public.fpa_model_drivers FOR DELETE TO authenticated USING (true);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_fpa_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER fpa_scenarios_updated_at
  BEFORE UPDATE ON public.fpa_scenarios
  FOR EACH ROW EXECUTE FUNCTION public.update_fpa_updated_at();

CREATE TRIGGER fpa_model_drivers_updated_at
  BEFORE UPDATE ON public.fpa_model_drivers
  FOR EACH ROW EXECUTE FUNCTION public.update_fpa_updated_at();
