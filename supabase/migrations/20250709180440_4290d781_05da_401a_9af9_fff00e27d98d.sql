-- Allow admins to manage collaborators (not just super admins)
DROP POLICY IF EXISTS "Admins can view collaborators" ON public.collaborators;

-- Create comprehensive policy for admins to manage collaborators
CREATE POLICY "Admins can manage all collaborators" 
ON public.collaborators 
FOR ALL 
TO authenticated
USING ((EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())))
WITH CHECK ((EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())));

-- Keep the super admin policy as it is
-- Keep the collaborators view policy as it is
