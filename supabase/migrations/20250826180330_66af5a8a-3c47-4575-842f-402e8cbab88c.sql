-- Fix security issue: Restrict team_invitations table access to prevent data harvesting
-- Currently the table is too permissive and allows attackers to harvest sensitive business data

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Admins can manage all invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Admins can manage all team invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Admins can view all team invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Company owners can manage their team invitations" ON public.team_invitations;

-- Create secure, restrictive policies

-- 1. Admins can manage all invitations (for administration)
CREATE POLICY "Secure admin access to team invitations"
ON public.team_invitations
FOR ALL
TO authenticated
USING (is_admin_user_secure())
WITH CHECK (is_admin_user_secure());

-- 2. Users can only view invitations sent to their email (for accepting invitations)
CREATE POLICY "Users can view invitations sent to their email"
ON public.team_invitations
FOR SELECT
TO authenticated
USING (email = (auth.jwt() ->> 'email'));

-- 3. Company primary contacts can view invitations they created from their company
CREATE POLICY "Primary contacts can view their company invitations"
ON public.team_invitations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.client_profiles cp
    WHERE cp.id = auth.uid()
    AND cp.id = team_invitations.company_id
    AND cp.is_primary_contact = true
  )
);

-- 4. Company primary contacts can insert invitations for their company
CREATE POLICY "Primary contacts can create team invitations"
ON public.team_invitations
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.client_profiles cp
    WHERE cp.id = auth.uid()
    AND cp.id = team_invitations.company_id
    AND cp.is_primary_contact = true
  )
);

-- 5. Company primary contacts can update their company invitations (for resending, etc.)
CREATE POLICY "Primary contacts can update their company invitations"
ON public.team_invitations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.client_profiles cp
    WHERE cp.id = auth.uid()
    AND cp.id = team_invitations.company_id
    AND cp.is_primary_contact = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.client_profiles cp
    WHERE cp.id = auth.uid()
    AND cp.id = team_invitations.company_id
    AND cp.is_primary_contact = true
  )
);

-- 6. Create secure function for token-based invitation lookup (replaces validate_invitation_token_secure)
CREATE OR REPLACE FUNCTION public.get_invitation_by_token(p_token text)
RETURNS TABLE(
  invitation_id uuid,
  email text,
  company_id uuid,
  company_name text,
  inviter_name text,
  message text,
  hierarchy_level_id uuid,
  is_valid boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log security event for token validation attempts
  PERFORM log_security_event('validate_invitation_token', 'team_invitation', p_token, 
    jsonb_build_object('ip', inet_client_addr(), 'timestamp', now()));

  -- Return only the specific invitation data needed for the token
  RETURN QUERY
  SELECT 
    ti.id,
    ti.email,
    ti.company_id,
    ti.company_name,
    ti.inviter_name,
    ti.message,
    ti.hierarchy_level_id,
    (ti.status = 'pending' AND ti.expires_at > now()) as is_valid
  FROM public.team_invitations ti
  WHERE ti.token = p_token;
END;
$$;

-- Add comment explaining the security fix
COMMENT ON TABLE public.team_invitations IS 'Team invitations table with restricted RLS policies to prevent data harvesting. Access is limited to: admins (full access), users (only their own invitations), and company primary contacts (only their company invitations).';

-- Ensure RLS is enabled
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;