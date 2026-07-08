-- Allow team members to view their company's FPA client record
CREATE POLICY "Team members can view company's FPA client"
ON public.fpa_clients
FOR SELECT
USING (
  -- Primary contact can always view
  (client_profile_id = auth.uid())
  OR 
  -- Team members of the same company can view
  EXISTS (
    SELECT 1 FROM public.company_teams t
    WHERE t.company_id = public.fpa_clients.client_profile_id
      AND t.member_id = auth.uid()
      AND t.status = 'active'
  )
);

-- Allow team members to view their company's BI embeds
CREATE POLICY "Team members can view company's BI embeds"
ON public.client_bi_embeds
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.fpa_clients c
    WHERE c.id = public.client_bi_embeds.fpa_client_id
      AND (
        c.client_profile_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.company_teams t
          WHERE t.company_id = c.client_profile_id
            AND t.member_id = auth.uid()
            AND t.status = 'active'
        )
      )
  )
);
