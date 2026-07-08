-- Create gantt_shares table for real Gantt chart sharing functionality
CREATE TABLE IF NOT EXISTS public.gantt_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  shared_with_email TEXT NOT NULL,
  shared_with_name TEXT NOT NULL,
  permission TEXT NOT NULL DEFAULT 'view' CHECK (permission IN ('view', 'edit')),
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gantt_shares ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert shares
CREATE POLICY "Allow authenticated insert on gantt_shares"
  ON public.gantt_shares FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to select shares (admin can see all, will filter in app)
CREATE POLICY "Allow authenticated select on gantt_shares"
  ON public.gantt_shares FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update (change status)
CREATE POLICY "Allow authenticated update on gantt_shares"
  ON public.gantt_shares FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

-- Allow authenticated delete
CREATE POLICY "Allow authenticated delete on gantt_shares"
  ON public.gantt_shares FOR DELETE
  TO authenticated
  USING (true);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_gantt_shares_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER gantt_shares_updated_at
  BEFORE UPDATE ON public.gantt_shares
  FOR EACH ROW EXECUTE FUNCTION public.update_gantt_shares_updated_at();
