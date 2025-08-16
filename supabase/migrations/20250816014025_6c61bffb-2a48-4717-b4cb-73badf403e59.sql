
-- Criar tabela de níveis hierárquicos
CREATE TABLE public.hierarchy_levels (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  level integer NOT NULL UNIQUE,
  description text,
  can_approve boolean DEFAULT false,
  can_invite_members boolean DEFAULT false,
  can_manage_permissions boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Inserir níveis hierárquicos padrão
INSERT INTO public.hierarchy_levels (name, level, description, can_approve, can_invite_members, can_manage_permissions) VALUES
('CEO/Diretor', 1, 'Nível mais alto - pode aprovar tudo', true, true, true),
('Gerente', 2, 'Pode aprovar e convidar membros', true, true, false),
('Coordenador', 3, 'Pode aprovar com limitações', true, false, false),
('Analista Senior', 4, 'Acesso completo aos dados', false, false, false),
('Analista', 5, 'Acesso limitado aos dados', false, false, false);

-- Criar tabela de membros da equipe da empresa
CREATE TABLE public.team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email text NOT NULL,
  name text NOT NULL,
  hierarchy_level_id uuid NOT NULL REFERENCES public.hierarchy_levels(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  invited_by uuid NOT NULL REFERENCES auth.users(id),
  invited_at timestamp with time zone DEFAULT now(),
  joined_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(company_id, invited_email)
);

-- Atualizar client_profiles para incluir hierarchy_level_id
ALTER TABLE public.client_profiles 
ADD COLUMN hierarchy_level_id uuid REFERENCES public.hierarchy_levels(id);

-- Definir nível padrão para usuários existentes (CEO/Diretor para contatos primários)
UPDATE public.client_profiles 
SET hierarchy_level_id = (SELECT id FROM public.hierarchy_levels WHERE level = 1)
WHERE is_primary_contact = true;

-- RLS para hierarchy_levels (público para leitura)
ALTER TABLE public.hierarchy_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view hierarchy levels" ON public.hierarchy_levels FOR SELECT USING (true);
CREATE POLICY "Admins can manage hierarchy levels" ON public.hierarchy_levels FOR ALL USING (is_admin_user_safe());

-- RLS para team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company owners can manage their team" 
  ON public.team_members 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.client_profiles cp
      WHERE cp.id = team_members.company_id 
      AND cp.id = auth.uid() 
      AND cp.is_primary_contact = true
    )
  );

CREATE POLICY "Team members can view their own membership" 
  ON public.team_members 
  FOR SELECT 
  USING (user_id = auth.uid() OR invited_email = (auth.jwt() ->> 'email'));

CREATE POLICY "Admins can manage all team members" 
  ON public.team_members 
  FOR ALL 
  USING (is_admin_user_safe());

-- Função para processar convites de equipe
CREATE OR REPLACE FUNCTION public.process_team_invitation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  team_record public.team_members%ROWTYPE;
BEGIN
  -- Verificar se existe convite pendente para este email
  SELECT * INTO team_record 
  FROM public.team_members 
  WHERE invited_email = NEW.email 
  AND status = 'pending'
  AND user_id IS NULL;
  
  IF FOUND THEN
    -- Ativar o convite
    UPDATE public.team_members 
    SET user_id = NEW.id, 
        status = 'active', 
        joined_at = now(),
        updated_at = now()
    WHERE id = team_record.id;
    
    -- Criar ou atualizar client profile para o membro da equipe
    INSERT INTO public.client_profiles (
      id, name, email, company, is_primary_contact, hierarchy_level_id
    )
    SELECT 
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', team_record.name),
      NEW.email,
      cp.company,
      false,
      team_record.hierarchy_level_id
    FROM public.client_profiles cp
    WHERE cp.id = team_record.company_id
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      company = EXCLUDED.company,
      hierarchy_level_id = EXCLUDED.hierarchy_level_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para processar convites quando usuário se registra
CREATE TRIGGER process_team_invitation_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.process_team_invitation();

-- Função para convidar membro da equipe
CREATE OR REPLACE FUNCTION public.invite_team_member(
  p_email text,
  p_name text,
  p_hierarchy_level_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invitation_id uuid;
  company_record public.client_profiles%ROWTYPE;
BEGIN
  -- Verificar se o usuário atual é contato primário
  SELECT * INTO company_record
  FROM public.client_profiles 
  WHERE id = auth.uid() 
  AND is_primary_contact = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Apenas contatos primários podem convidar membros da equipe';
  END IF;

  -- Verificar se já existe convite para este email
  IF EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE company_id = company_record.id 
    AND invited_email = p_email
  ) THEN
    RAISE EXCEPTION 'Já existe um convite para este email';
  END IF;

  -- Criar convite
  INSERT INTO public.team_members (
    company_id, 
    invited_email, 
    name,
    hierarchy_level_id,
    invited_by
  ) VALUES (
    company_record.id,
    p_email,
    p_name,
    p_hierarchy_level_id,
    auth.uid()
  )
  RETURNING id INTO invitation_id;

  RETURN invitation_id;
END;
$$;

-- Otimizar queries com índices
CREATE INDEX IF NOT EXISTS idx_team_members_company_id ON public.team_members(company_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON public.team_members(invited_email);
CREATE INDEX IF NOT EXISTS idx_client_profiles_company ON public.client_profiles(company);
CREATE INDEX IF NOT EXISTS idx_client_profiles_hierarchy ON public.client_profiles(hierarchy_level_id);
