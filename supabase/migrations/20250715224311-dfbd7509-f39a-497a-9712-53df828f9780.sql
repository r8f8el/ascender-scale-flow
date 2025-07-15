-- Add response_id column to ticket_attachments table to link attachments to specific responses
ALTER TABLE public.ticket_attachments 
ADD COLUMN response_id uuid REFERENCES public.ticket_responses(id);

-- Add foreign key constraint for response_id
ALTER TABLE public.ticket_attachments 
ADD CONSTRAINT ticket_attachments_response_id_fkey 
FOREIGN KEY (response_id) REFERENCES public.ticket_responses(id);

-- Update RLS policies for ticket_attachments to handle chat attachments
DROP POLICY IF EXISTS "Users can upload attachments to their tickets" ON public.ticket_attachments;
DROP POLICY IF EXISTS "Users can view attachments of their tickets" ON public.ticket_attachments;

-- New policies that handle both ticket attachments and chat response attachments
CREATE POLICY "Users can upload attachments to their tickets or responses" 
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

CREATE POLICY "Users can view attachments of their tickets or responses" 
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