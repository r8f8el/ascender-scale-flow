-- Adicionar coluna response_id na tabela ticket_attachments para vincular anexos às mensagens do chat
ALTER TABLE public.ticket_attachments 
ADD COLUMN IF NOT EXISTS response_id uuid REFERENCES public.ticket_responses(id) ON DELETE CASCADE;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_response_id 
ON public.ticket_attachments(response_id);

-- Atualizar políticas RLS para incluir o response_id
DROP POLICY IF EXISTS "Users can upload attachments to their tickets" ON public.ticket_attachments;
DROP POLICY IF EXISTS "Users can view attachments of their tickets" ON public.ticket_attachments;

CREATE POLICY "Users can upload attachments to their tickets" 
ON public.ticket_attachments 
FOR INSERT 
WITH CHECK (
  (EXISTS ( 
    SELECT 1 FROM tickets 
    WHERE tickets.id = ticket_attachments.ticket_id 
    AND (tickets.user_id = auth.uid() OR tickets.user_email = (auth.jwt() ->> 'email'::text))
  )) 
  OR 
  (EXISTS ( 
    SELECT 1 FROM admin_profiles 
    WHERE admin_profiles.id = auth.uid()
  ))
);

CREATE POLICY "Users can view attachments of their tickets" 
ON public.ticket_attachments 
FOR SELECT 
USING (
  (EXISTS ( 
    SELECT 1 FROM tickets 
    WHERE tickets.id = ticket_attachments.ticket_id 
    AND (tickets.user_id = auth.uid() OR tickets.user_email = (auth.jwt() ->> 'email'::text))
  )) 
  OR 
  (EXISTS ( 
    SELECT 1 FROM admin_profiles 
    WHERE admin_profiles.id = auth.uid()
  ))
);