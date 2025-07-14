-- Add CNPJ field to client_profiles table
ALTER TABLE public.client_profiles 
ADD COLUMN cnpj TEXT,
ADD COLUMN is_primary_contact BOOLEAN DEFAULT true;

-- Create company_teams table for team management
CREATE TABLE public.company_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES public.client_profiles(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, member_id)
);

-- Enable RLS on company_teams
ALTER TABLE public.company_teams ENABLE ROW LEVEL SECURITY;

-- Create policies for company_teams
CREATE POLICY "Company primary contacts can manage their team"
ON public.company_teams
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.client_profiles 
    WHERE id = company_teams.company_id 
    AND client_profiles.id = auth.uid()
    AND client_profiles.is_primary_contact = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.client_profiles 
    WHERE id = company_teams.company_id 
    AND client_profiles.id = auth.uid()
    AND client_profiles.is_primary_contact = true
  )
);

CREATE POLICY "Team members can view their own team membership"
ON public.company_teams
FOR SELECT
USING (member_id = auth.uid());

-- Create function to handle team member profile creation
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
  WHERE member_id = NEW.id 
  AND status = 'pending';
  
  IF FOUND THEN
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
    
    -- Update team member status to active
    UPDATE public.company_teams 
    SET status = 'active', updated_at = now()
    WHERE id = invitation_record.id;
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

-- Update the existing trigger to use the new function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_team_member_signup();

-- Create function to invite team members
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

  -- Create invitation record (user will be created when they accept)
  INSERT INTO public.company_teams (company_id, member_id, invited_by, status)
  VALUES (
    p_company_id,
    gen_random_uuid(), -- Temporary UUID, will be updated when user signs up
    auth.uid(),
    'pending'
  )
  RETURNING id INTO invitation_id;

  RETURN invitation_id;
END;
$$;

-- Add trigger for updated_at timestamp
CREATE TRIGGER update_company_teams_updated_at
  BEFORE UPDATE ON public.company_teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();