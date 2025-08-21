
-- Verificar e corrigir as políticas RLS da tabela team_members
-- Primeiro, vamos remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view team members of their company" ON public.team_members;
DROP POLICY IF EXISTS "Company admins can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Team members can view their own data" ON public.team_members;

-- Criar políticas RLS mais permissivas para team_members
CREATE POLICY "Users can view company team members" 
  ON public.team_members 
  FOR SELECT 
  USING (
    -- Admins podem ver tudo
    is_admin_user_safe() OR 
    -- Usuários podem ver membros da mesma empresa
    (
      company_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM client_profiles cp1, client_profiles cp2
        WHERE cp1.id = auth.uid() 
        AND cp2.id = team_members.company_id
        AND cp1.company = cp2.company
        AND cp1.company IS NOT NULL
      ) OR
      -- Membros da equipe podem ver outros membros
      user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage company team members" 
  ON public.team_members 
  FOR ALL 
  USING (
    -- Admins podem gerenciar tudo
    is_admin_user_safe() OR 
    -- Contatos primários podem gerenciar sua equipe
    (
      EXISTS (
        SELECT 1 FROM client_profiles 
        WHERE id = auth.uid() 
        AND id = team_members.company_id 
        AND is_primary_contact = true
      )
    )
  )
  WITH CHECK (
    -- Mesmas regras para inserção/atualização
    is_admin_user_safe() OR 
    (
      EXISTS (
        SELECT 1 FROM client_profiles 
        WHERE id = auth.uid() 
        AND id = team_members.company_id 
        AND is_primary_contact = true
      )
    )
  );

-- Verificar se a tabela tem RLS habilitada
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
