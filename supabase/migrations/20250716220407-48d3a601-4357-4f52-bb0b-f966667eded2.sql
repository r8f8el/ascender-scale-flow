-- Corrigir política RLS para ticket_responses para permitir envio baseado no email
DROP POLICY IF EXISTS "Users can create responses on their tickets" ON public.ticket_responses;

CREATE POLICY "Users can create responses on their tickets" 
ON public.ticket_responses 
FOR INSERT 
WITH CHECK (
  -- Verificar se o ticket pertence ao usuário (por email ou user_id)
  EXISTS ( 
    SELECT 1 FROM tickets 
    WHERE tickets.id = ticket_responses.ticket_id 
    AND (
      tickets.user_email = (auth.jwt() ->> 'email'::text)
      OR 
      tickets.user_id = auth.uid()
    )
  ) 
  OR 
  -- Ou se é um admin
  EXISTS ( 
    SELECT 1 FROM admin_profiles 
    WHERE admin_profiles.id = auth.uid()
  )
);

-- Também corrigir a política de SELECT para ser consistente
DROP POLICY IF EXISTS "Users can view responses of their tickets" ON public.ticket_responses;

CREATE POLICY "Users can view responses of their tickets" 
ON public.ticket_responses 
FOR SELECT 
USING (
  -- Verificar se o ticket pertence ao usuário (por email ou user_id)
  EXISTS ( 
    SELECT 1 FROM tickets 
    WHERE tickets.id = ticket_responses.ticket_id 
    AND (
      tickets.user_email = (auth.jwt() ->> 'email'::text)
      OR 
      tickets.user_id = auth.uid()
    )
  ) 
  OR 
  -- Ou se é um admin
  EXISTS ( 
    SELECT 1 FROM admin_profiles 
    WHERE admin_profiles.id = auth.uid()
  )
);