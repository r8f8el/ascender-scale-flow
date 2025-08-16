
-- Create team_invitations table for managing team invites
CREATE TABLE public.team_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  invited_name TEXT,
  company_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inviter_name TEXT NOT NULL,
  message TEXT,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for team_invitations
CREATE POLICY "Company primary contacts can manage their invitations" 
  ON public.team_invitations 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.client_profiles 
      WHERE id = team_invitations.company_id 
      AND id = auth.uid() 
      AND is_primary_contact = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.client_profiles 
      WHERE id = team_invitations.company_id 
      AND id = auth.uid() 
      AND is_primary_contact = true
    )
  );

-- Admins can manage all invitations
CREATE POLICY "Admins can manage all team invitations" 
  ON public.team_invitations 
  FOR ALL 
  USING (is_admin_user_safe())
  WITH CHECK (is_admin_user_safe());

-- Public read access for invitation validation (needed for signup page)
CREATE POLICY "Public can read pending invitations by token" 
  ON public.team_invitations 
  FOR SELECT 
  USING (status = 'pending' AND expires_at > now());

-- Create trigger to update updated_at
CREATE TRIGGER update_team_invitations_updated_at
  BEFORE UPDATE ON public.team_invitations
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Create index for faster token lookups
CREATE INDEX idx_team_invitations_token ON public.team_invitations(token);
CREATE INDEX idx_team_invitations_email_status ON public.team_invitations(email, status);
