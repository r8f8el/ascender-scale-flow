-- Verificar e ajustar políticas de documentos para acesso baseado na empresa

-- Primeiro, vamos ver as políticas atuais e ajustar se necessário

-- Para client_documents: garantir que membros da mesma empresa podem acessar
DROP POLICY IF EXISTS "Users can view company documents" ON public.client_documents;
DROP POLICY IF EXISTS "Users can insert company documents" ON public.client_documents;
DROP POLICY IF EXISTS "Users can update company documents" ON public.client_documents;
DROP POLICY IF EXISTS "Users can delete company documents" ON public.client_documents;

-- Políticas para client_documents com acesso baseado na empresa
CREATE POLICY "Company members can view client documents" ON public.client_documents
FOR SELECT USING (
  is_admin_user_secure() OR 
  has_company_access(auth.uid(), user_id) OR
  EXISTS (
    SELECT 1 FROM client_profiles cp1, client_profiles cp2
    WHERE cp1.id = auth.uid() 
    AND cp2.id = user_id 
    AND cp1.company = cp2.company 
    AND cp1.company IS NOT NULL
  ) OR
  EXISTS (
    SELECT 1 FROM team_members tm
    JOIN client_profiles cp ON tm.company_id = cp.id
    WHERE tm.user_id = auth.uid() 
    AND tm.status = 'active'
    AND cp.id = user_id
  )
);

CREATE POLICY "Company members can insert client documents" ON public.client_documents
FOR INSERT WITH CHECK (
  is_admin_user_secure() OR 
  has_company_access(auth.uid(), user_id) OR
  EXISTS (
    SELECT 1 FROM client_profiles cp1, client_profiles cp2
    WHERE cp1.id = auth.uid() 
    AND cp2.id = user_id 
    AND cp1.company = cp2.company 
    AND cp1.company IS NOT NULL
  )
);

CREATE POLICY "Company members can update client documents" ON public.client_documents
FOR UPDATE USING (
  is_admin_user_secure() OR 
  has_company_access(auth.uid(), user_id) OR
  EXISTS (
    SELECT 1 FROM client_profiles cp1, client_profiles cp2
    WHERE cp1.id = auth.uid() 
    AND cp2.id = user_id 
    AND cp1.company = cp2.company 
    AND cp1.company IS NOT NULL
  )
);

CREATE POLICY "Company members can delete client documents" ON public.client_documents
FOR DELETE USING (
  is_admin_user_secure() OR 
  has_company_access(auth.uid(), user_id) OR
  EXISTS (
    SELECT 1 FROM client_profiles cp1, client_profiles cp2
    WHERE cp1.id = auth.uid() 
    AND cp2.id = user_id 
    AND cp1.company = cp2.company 
    AND cp1.company IS NOT NULL
  )
);

-- Para a tabela files: ajustar políticas para acesso baseado na empresa
DROP POLICY IF EXISTS "Clients can view company files" ON public.files;
DROP POLICY IF EXISTS "Clients can create company files" ON public.files;
DROP POLICY IF EXISTS "Clients can update company files" ON public.files;
DROP POLICY IF EXISTS "Clients can delete company files" ON public.files;

CREATE POLICY "Company members can view files" ON public.files
FOR SELECT USING (
  is_admin_user_secure() OR 
  has_company_access(auth.uid(), client_id) OR
  EXISTS (
    SELECT 1 FROM client_profiles cp1, client_profiles cp2
    WHERE cp1.id = auth.uid() 
    AND cp2.id = client_id 
    AND cp1.company = cp2.company 
    AND cp1.company IS NOT NULL
  ) OR
  EXISTS (
    SELECT 1 FROM team_members tm
    JOIN client_profiles cp ON tm.company_id = cp.id
    WHERE tm.user_id = auth.uid() 
    AND tm.status = 'active'
    AND cp.id = client_id
  )
);

CREATE POLICY "Company members can create files" ON public.files
FOR INSERT WITH CHECK (
  is_admin_user_secure() OR 
  has_company_access(auth.uid(), client_id) OR
  EXISTS (
    SELECT 1 FROM client_profiles cp1, client_profiles cp2
    WHERE cp1.id = auth.uid() 
    AND cp2.id = client_id 
    AND cp1.company = cp2.company 
    AND cp1.company IS NOT NULL
  )
);

CREATE POLICY "Company members can update files" ON public.files
FOR UPDATE USING (
  is_admin_user_secure() OR 
  has_company_access(auth.uid(), client_id) OR
  EXISTS (
    SELECT 1 FROM client_profiles cp1, client_profiles cp2
    WHERE cp1.id = auth.uid() 
    AND cp2.id = client_id 
    AND cp1.company = cp2.company 
    AND cp1.company IS NOT NULL
  )
);

CREATE POLICY "Company members can delete files" ON public.files
FOR DELETE USING (
  is_admin_user_secure() OR 
  has_company_access(auth.uid(), client_id) OR
  EXISTS (
    SELECT 1 FROM client_profiles cp1, client_profiles cp2
    WHERE cp1.id = auth.uid() 
    AND cp2.id = client_id 
    AND cp1.company = cp2.company 
    AND cp1.company IS NOT NULL
  )
);

-- Para a tabela documents: ajustar políticas similares
DROP POLICY IF EXISTS "Users can view company documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert company documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update company documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete company documents" ON public.documents;

CREATE POLICY "Company members can view documents" ON public.documents
FOR SELECT USING (
  is_admin_user_secure() OR 
  has_company_access(auth.uid(), user_id) OR
  EXISTS (
    SELECT 1 FROM client_profiles cp1, client_profiles cp2
    WHERE cp1.id = auth.uid() 
    AND cp2.id = user_id 
    AND cp1.company = cp2.company 
    AND cp1.company IS NOT NULL
  ) OR
  EXISTS (
    SELECT 1 FROM team_members tm
    JOIN client_profiles cp ON tm.company_id = cp.id
    WHERE tm.user_id = auth.uid() 
    AND tm.status = 'active'
    AND cp.id = user_id
  )
);

CREATE POLICY "Company members can insert documents" ON public.documents
FOR INSERT WITH CHECK (
  is_admin_user_secure() OR 
  has_company_access(auth.uid(), user_id) OR
  EXISTS (
    SELECT 1 FROM client_profiles cp1, client_profiles cp2
    WHERE cp1.id = auth.uid() 
    AND cp2.id = user_id 
    AND cp1.company = cp2.company 
    AND cp1.company IS NOT NULL
  )
);

CREATE POLICY "Company members can update documents" ON public.documents
FOR UPDATE USING (
  is_admin_user_secure() OR 
  has_company_access(auth.uid(), user_id) OR
  EXISTS (
    SELECT 1 FROM client_profiles cp1, client_profiles cp2
    WHERE cp1.id = auth.uid() 
    AND cp2.id = user_id 
    AND cp1.company = cp2.company 
    AND cp1.company IS NOT NULL
  )
);

CREATE POLICY "Company members can delete documents" ON public.documents
FOR DELETE USING (
  is_admin_user_secure() OR 
  has_company_access(auth.uid(), user_id) OR
  EXISTS (
    SELECT 1 FROM client_profiles cp1, client_profiles cp2
    WHERE cp1.id = auth.uid() 
    AND cp2.id = user_id 
    AND cp1.company = cp2.company 
    AND cp1.company IS NOT NULL
  )
);