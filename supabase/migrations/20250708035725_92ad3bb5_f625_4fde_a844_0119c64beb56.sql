-- Fix overly permissive RLS policies on tickets table
-- Drop the dangerous "Enable * for all users" policies
DROP POLICY IF EXISTS "Enable insert for all users" ON public.tickets;
DROP POLICY IF EXISTS "Enable select for all users" ON public.tickets;  
DROP POLICY IF EXISTS "Enable update for all users" ON public.tickets;

-- Keep only the secure, user-specific policies and add admin access
-- The existing user-specific policies are fine, just need to add admin access

-- Add admin access policies
CREATE POLICY "Admins can view all tickets" 
ON public.tickets 
FOR SELECT 
USING ((EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())));

CREATE POLICY "Admins can update all tickets" 
ON public.tickets 
FOR UPDATE 
USING ((EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())));

CREATE POLICY "Admins can insert tickets" 
ON public.tickets 
FOR INSERT 
WITH CHECK ((EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())));
