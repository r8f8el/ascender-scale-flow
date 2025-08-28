-- Ensure REPLICA IDENTITY FULL is set for chat tables
-- This ensures complete row data is captured during updates for real-time functionality
ALTER TABLE public.chat_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;