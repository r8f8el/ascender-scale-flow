-- Fix the member_id column to allow NULL values for pending invitations
ALTER TABLE public.company_teams 
ALTER COLUMN member_id DROP NOT NULL;

-- Update the existing function to ensure we don't try to insert a member_id
CREATE OR REPLACE FUNCTION public.invite_team_member(
  p_email TEXT,
  p_company_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_id UUID;
BEGIN
  -- Check if user is primary contact of the company
  IF NOT EXISTS (
    SELECT 1 FROM public.client_profiles 
    WHERE id = p_company_id 
    AND id = auth.uid() 
    AND is_primary_contact = true
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only primary contacts can invite team members';
  END IF;

  -- Check if email is already invited to this company
  IF EXISTS (
    SELECT 1 FROM public.company_teams 
    WHERE company_id = p_company_id 
    AND invited_email = p_email
    AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'User already invited to this company';
  END IF;

  -- Create invitation record with email only (member_id will be NULL initially)
  INSERT INTO public.company_teams (company_id, invited_email, invited_by, status, role)
  VALUES (
    p_company_id,
    p_email,
    auth.uid(),
    'pending',
    'member'
  )
  RETURNING id INTO invitation_id;

  RETURN invitation_id;
END;
$$;