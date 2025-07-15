-- Corrigir políticas RLS para ticket_responses para permitir clientes enviarem mensagens
DROP POLICY IF EXISTS "Users can create responses on their tickets" ON public.ticket_responses;

CREATE POLICY "Users can create responses on their tickets" 
ON public.ticket_responses 
FOR INSERT 
WITH CHECK (
  (EXISTS ( 
    SELECT 1 FROM tickets 
    WHERE tickets.id = ticket_responses.ticket_id 
    AND (tickets.user_id = auth.uid() OR tickets.user_email = (auth.jwt() ->> 'email'::text))
  )) 
  OR 
  (EXISTS ( 
    SELECT 1 FROM admin_profiles 
    WHERE admin_profiles.id = auth.uid()
  ))
);