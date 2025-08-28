-- Remover políticas antigas e criar novas para kanban_boards
DROP POLICY IF EXISTS "Clients can view their kanban boards" ON public.kanban_boards;

-- Nova política que permite acesso por empresa
CREATE POLICY "Company members can view kanban boards"
ON public.kanban_boards
FOR SELECT
USING (
  is_admin_user_safe() OR
  EXISTS (
    SELECT 1 FROM public.client_profiles cp1, public.client_profiles cp2
    WHERE cp1.id = auth.uid()
    AND cp2.id = kanban_boards.client_id
    AND cp1.company = cp2.company
    AND cp1.company IS NOT NULL
  ) OR
  EXISTS (
    SELECT 1 FROM public.team_members tm
    JOIN public.client_profiles cp ON tm.company_id = cp.id
    WHERE tm.user_id = auth.uid()
    AND tm.status = 'active'
    AND cp.id = kanban_boards.client_id
  )
);

-- Política para INSERT
CREATE POLICY "Company members can create kanban boards"
ON public.kanban_boards
FOR INSERT
WITH CHECK (
  is_admin_user_safe() OR
  (client_id = auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.client_profiles cp1, public.client_profiles cp2
    WHERE cp1.id = auth.uid()
    AND cp2.id = kanban_boards.client_id
    AND cp1.company = cp2.company
    AND cp1.company IS NOT NULL
  )
);

-- Política para UPDATE
CREATE POLICY "Company members can update kanban boards"
ON public.kanban_boards
FOR UPDATE
USING (
  is_admin_user_safe() OR
  EXISTS (
    SELECT 1 FROM public.client_profiles cp1, public.client_profiles cp2
    WHERE cp1.id = auth.uid()
    AND cp2.id = kanban_boards.client_id
    AND cp1.company = cp2.company
    AND cp1.company IS NOT NULL
  )
);

-- Atualizar política de gantt_projects para empresa
DROP POLICY IF EXISTS "Clients can view company gantt projects" ON public.gantt_projects;

CREATE POLICY "Company members can view gantt projects"
ON public.gantt_projects
FOR SELECT
USING (
  is_admin_user_safe() OR
  EXISTS (
    SELECT 1 FROM public.client_profiles cp1, public.client_profiles cp2
    WHERE cp1.id = auth.uid()
    AND cp2.id = gantt_projects.client_id
    AND cp1.company = cp2.company
    AND cp1.company IS NOT NULL
  ) OR
  EXISTS (
    SELECT 1 FROM public.team_members tm
    JOIN public.client_profiles cp ON tm.company_id = cp.id
    WHERE tm.user_id = auth.uid()
    AND tm.status = 'active'
    AND cp.id = gantt_projects.client_id
  )
);

-- Política para criação de projetos Gantt
CREATE POLICY "Company members can create gantt projects"
ON public.gantt_projects
FOR INSERT
WITH CHECK (
  is_admin_user_safe() OR
  (client_id = auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.client_profiles cp1, public.client_profiles cp2
    WHERE cp1.id = auth.uid()
    AND cp2.id = gantt_projects.client_id
    AND cp1.company = cp2.company
    AND cp1.company IS NOT NULL
  )
);

-- Política para atualização de projetos Gantt
CREATE POLICY "Company members can update gantt projects"
ON public.gantt_projects
FOR UPDATE
USING (
  is_admin_user_safe() OR
  EXISTS (
    SELECT 1 FROM public.client_profiles cp1, public.client_profiles cp2
    WHERE cp1.id = auth.uid()
    AND cp2.id = gantt_projects.client_id
    AND cp1.company = cp2.company
    AND cp1.company IS NOT NULL
  )
);