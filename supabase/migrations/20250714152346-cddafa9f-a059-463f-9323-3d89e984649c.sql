-- Fix the team invitation logic by removing the foreign key constraint
-- and updating the invitation function

-- First, drop the existing foreign key constraint
ALTER TABLE public.company_teams 
DROP CONSTRAINT IF EXISTS company_teams_member_id_fkey;

-- Recreate the function to store email instead of temporary UUID
DROP FUNCTION IF EXISTS public.invite_team_member(text, uuid);

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

  -- Create invitation record with email
  INSERT INTO public.company_teams (company_id, invited_email, invited_by, status)
  VALUES (
    p_company_id,
    p_email,
    auth.uid(),
    'pending'
  )
  RETURNING id INTO invitation_id;

  RETURN invitation_id;
END;
$$;

-- Add invited_email column to store the email of invited user
ALTER TABLE public.company_teams 
ADD COLUMN IF NOT EXISTS invited_email TEXT;

-- Update the signup handler to handle team member invitations properly
CREATE OR REPLACE FUNCTION public.handle_team_member_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  invitation_record public.company_teams%ROWTYPE;
BEGIN
  -- Check if this user was invited as a team member
  SELECT * INTO invitation_record 
  FROM public.company_teams 
  WHERE invited_email = NEW.email 
  AND status = 'pending';
  
  IF FOUND THEN
    -- Update the invitation record with the actual user ID
    UPDATE public.company_teams 
    SET member_id = NEW.id, status = 'active', updated_at = now()
    WHERE id = invitation_record.id;
    
    -- Create client profile linked to the company
    INSERT INTO public.client_profiles (id, name, email, company, cnpj, is_primary_contact)
    SELECT 
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
      NEW.email,
      cp.company,
      cp.cnpj,
      false
    FROM public.client_profiles cp
    WHERE cp.id = invitation_record.company_id;
  ELSE
    -- Regular company signup - check if not an admin domain
    IF NEW.email NOT LIKE '%@ascalate.com.br' THEN
      INSERT INTO public.client_profiles (id, name, email, company, is_primary_contact)
      VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
        NEW.email,
        NEW.raw_user_meta_data->>'company',
        true
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;