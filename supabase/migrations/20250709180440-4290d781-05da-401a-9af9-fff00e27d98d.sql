-- Allow admins to manage collaborators (not just super admins)
DROP POLICY IF EXISTS "Admins can view collaborators" ON public.collaborators;

-- Create comprehensive policy for admins to manage collaborators
CREATE POLICY "Admins can manage all collaborators" 
ON public.collaborators 
FOR ALL 
TO authenticated
USING (is_admin_user_safe())
WITH CHECK (is_admin_user_safe());

-- Keep the super admin policy as it is
-- Keep the collaborators view policy as it is