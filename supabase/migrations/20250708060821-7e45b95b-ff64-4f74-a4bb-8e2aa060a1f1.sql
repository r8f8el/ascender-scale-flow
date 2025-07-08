-- Enable realtime for ticket_responses table
ALTER TABLE public.ticket_responses REPLICA IDENTITY FULL;

-- Add ticket_responses to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_responses;