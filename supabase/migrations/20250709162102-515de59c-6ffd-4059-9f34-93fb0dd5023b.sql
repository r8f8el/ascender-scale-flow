-- Fix RLS policies for admin functionality

-- Drop existing problematic policies for collaborators
DROP POLICY IF EXISTS "Admins can manage collaborators" ON public.collaborators;
DROP POLICY IF EXISTS "Collaborators can view their own data" ON public.collaborators;

-- Create proper RLS policies for collaborators
CREATE POLICY "Super admins can manage all collaborators" 
ON public.collaborators 
FOR ALL 
TO authenticated
USING (is_current_user_super_admin())
WITH CHECK (is_current_user_super_admin());

CREATE POLICY "Admins can view collaborators" 
ON public.collaborators 
FOR SELECT 
TO authenticated
USING (is_admin_user_safe());

CREATE POLICY "Collaborators can view their own data" 
ON public.collaborators 
FOR SELECT 
TO authenticated
USING (email = (auth.jwt() ->> 'email'::text));

-- Fix RLS policies for projects
DROP POLICY IF EXISTS "Admins can manage projects" ON public.projects;

CREATE POLICY "Admins can manage all projects" 
ON public.projects 
FOR ALL 
TO authenticated
USING (is_admin_user_safe())
WITH CHECK (is_admin_user_safe());

-- Fix RLS policies for tasks  
DROP POLICY IF EXISTS "Admins can manage tasks" ON public.tasks;
DROP POLICY IF EXISTS "Collaborators can view assigned tasks" ON public.tasks;

CREATE POLICY "Admins can manage all tasks" 
ON public.tasks 
FOR ALL 
TO authenticated
USING (is_admin_user_safe())
WITH CHECK (is_admin_user_safe());

CREATE POLICY "Collaborators can view and update assigned tasks" 
ON public.tasks 
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.collaborators 
    WHERE collaborators.id = tasks.assigned_to 
    AND collaborators.email = (auth.jwt() ->> 'email'::text)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.collaborators 
    WHERE collaborators.id = tasks.assigned_to 
    AND collaborators.email = (auth.jwt() ->> 'email'::text)
  )
);

-- Fix RLS policies for notifications
DROP POLICY IF EXISTS "Admins can manage notifications" ON public.notifications;

CREATE POLICY "Admins can manage all notifications" 
ON public.notifications 
FOR ALL 
TO authenticated
USING (is_admin_user_safe())
WITH CHECK (is_admin_user_safe());

-- Ensure admin_profiles table has proper policies for viewing collaborators
CREATE POLICY "Admins can view other admin profiles" 
ON public.admin_profiles 
FOR SELECT 
TO authenticated
USING (is_admin_user_safe());