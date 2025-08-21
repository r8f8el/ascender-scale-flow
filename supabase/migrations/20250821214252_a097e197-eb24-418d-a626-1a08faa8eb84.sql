
-- Criar função para verificar se um usuário é membro de equipe de uma empresa
CREATE OR REPLACE FUNCTION public.is_team_member_of_company(p_user_id uuid, p_company_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM client_profiles cp1
    JOIN team_members tm ON tm.company_id = cp1.id
    JOIN client_profiles cp2 ON cp2.id = p_user_id
    WHERE cp1.company = p_company_name
      AND tm.user_id = p_user_id
      AND tm.status = 'active'
      AND cp2.company = p_company_name
  );
$$;

-- Criar função para verificar se um usuário tem acesso aos dados de uma empresa
CREATE OR REPLACE FUNCTION public.has_company_access(p_user_id uuid, p_target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM client_profiles cp1
    JOIN client_profiles cp2 ON cp1.company = cp2.company
    WHERE cp1.id = p_user_id
      AND cp2.id = p_target_user_id
      AND cp1.company IS NOT NULL
      AND cp2.company IS NOT NULL
  ) OR p_user_id = p_target_user_id;
$$;

-- Atualizar política RLS para client_documents
DROP POLICY IF EXISTS "Users can view their own documents" ON public.client_documents;
CREATE POLICY "Users can view company documents" 
ON public.client_documents 
FOR SELECT 
USING (has_company_access(auth.uid(), user_id) OR is_admin_user_secure());

DROP POLICY IF EXISTS "Users can insert their own documents" ON public.client_documents;
CREATE POLICY "Users can insert company documents" 
ON public.client_documents 
FOR INSERT 
WITH CHECK (has_company_access(auth.uid(), user_id) OR is_admin_user_secure());

DROP POLICY IF EXISTS "Users can update their own documents" ON public.client_documents;
CREATE POLICY "Users can update company documents" 
ON public.client_documents 
FOR UPDATE 
USING (has_company_access(auth.uid(), user_id) OR is_admin_user_secure());

DROP POLICY IF EXISTS "Users can delete their own documents" ON public.client_documents;
CREATE POLICY "Users can delete company documents" 
ON public.client_documents 
FOR DELETE 
USING (has_company_access(auth.uid(), user_id) OR is_admin_user_secure());

-- Atualizar política RLS para files
DROP POLICY IF EXISTS "Clients can view own files" ON public.files;
CREATE POLICY "Clients can view company files" 
ON public.files 
FOR SELECT 
USING (has_company_access(auth.uid(), client_id) OR is_admin_user_secure());

DROP POLICY IF EXISTS "Clients can create own files" ON public.files;
CREATE POLICY "Clients can create company files" 
ON public.files 
FOR INSERT 
WITH CHECK (has_company_access(auth.uid(), client_id) OR is_admin_user_secure());

DROP POLICY IF EXISTS "Clients can update own files" ON public.files;
CREATE POLICY "Clients can update company files" 
ON public.files 
FOR UPDATE 
USING (has_company_access(auth.uid(), client_id) OR is_admin_user_secure());

DROP POLICY IF EXISTS "Clients can delete own files" ON public.files;
CREATE POLICY "Clients can delete company files" 
ON public.files 
FOR DELETE 
USING (has_company_access(auth.uid(), client_id) OR is_admin_user_secure());

-- Atualizar política RLS para documents
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
CREATE POLICY "Users can view company documents" 
ON public.documents 
FOR SELECT 
USING (has_company_access(auth.uid(), user_id) OR is_admin_user_secure());

DROP POLICY IF EXISTS "Users can insert their own documents" ON public.documents;
CREATE POLICY "Users can insert company documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (has_company_access(auth.uid(), user_id) OR is_admin_user_secure());

DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
CREATE POLICY "Users can update company documents" 
ON public.documents 
FOR UPDATE 
USING (has_company_access(auth.uid(), user_id) OR is_admin_user_secure());

DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;
CREATE POLICY "Users can delete company documents" 
ON public.documents 
FOR DELETE 
USING (has_company_access(auth.uid(), user_id) OR is_admin_user_secure());

-- Atualizar política RLS para gantt_projects
DROP POLICY IF EXISTS "Clients can view their gantt projects" ON public.gantt_projects;
CREATE POLICY "Clients can view company gantt projects" 
ON public.gantt_projects 
FOR SELECT 
USING (has_company_access(auth.uid(), client_id) OR is_admin_user_secure());

-- Adicionar políticas para solicitacoes (assumindo que existe uma tabela com esse nome)
-- Verificar se existe a política atual e atualizar
DROP POLICY IF EXISTS "Usuários podem ver suas solicitações" ON public.solicitacoes;
CREATE POLICY "Usuários podem ver solicitações da empresa" 
ON public.solicitacoes 
FOR SELECT 
USING (has_company_access(auth.uid(), solicitante_id) OR 
       has_company_access(auth.uid(), aprovador_atual_id) OR 
       is_admin_user_secure());

DROP POLICY IF EXISTS "Usuários podem criar solicitações" ON public.solicitacoes;
CREATE POLICY "Usuários podem criar solicitações da empresa" 
ON public.solicitacoes 
FOR INSERT 
WITH CHECK (has_company_access(auth.uid(), solicitante_id) OR is_admin_user_secure());

DROP POLICY IF EXISTS "Usuários podem atualizar suas solicitações" ON public.solicitacoes;
CREATE POLICY "Usuários podem atualizar solicitações da empresa" 
ON public.solicitacoes 
FOR UPDATE 
USING (has_company_access(auth.uid(), solicitante_id) OR 
       has_company_access(auth.uid(), aprovador_atual_id) OR 
       is_admin_user_secure());
