
-- Corrigir as políticas RLS para gantt_tasks para permitir criação de tarefas
DROP POLICY IF EXISTS "Admins can manage all gantt tasks" ON gantt_tasks;
DROP POLICY IF EXISTS "Clients can view tasks from their projects" ON gantt_tasks;

-- Política para admins gerenciarem todas as tarefas
CREATE POLICY "Admins can manage all gantt tasks" 
ON gantt_tasks FOR ALL 
USING (is_admin_user_safe())
WITH CHECK (is_admin_user_safe());

-- Política para clientes visualizarem tarefas de seus projetos
CREATE POLICY "Clients can view tasks from their projects" 
ON gantt_tasks FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM gantt_projects 
    WHERE gantt_projects.id = gantt_tasks.project_id 
    AND gantt_projects.client_id = auth.uid()
  )
);

-- Política para permitir criação de tarefas por usuários autorizados
CREATE POLICY "Authorized users can create gantt tasks" 
ON gantt_tasks FOR INSERT 
WITH CHECK (
  is_admin_user_safe() OR 
  EXISTS (
    SELECT 1 FROM gantt_projects 
    WHERE gantt_projects.id = gantt_tasks.project_id 
    AND (gantt_projects.client_id = auth.uid() OR gantt_projects.created_by = auth.uid())
  )
);

-- Política para permitir atualização de tarefas
CREATE POLICY "Authorized users can update gantt tasks" 
ON gantt_tasks FOR UPDATE 
USING (
  is_admin_user_safe() OR 
  EXISTS (
    SELECT 1 FROM gantt_projects 
    WHERE gantt_projects.id = gantt_tasks.project_id 
    AND (gantt_projects.client_id = auth.uid() OR gantt_projects.created_by = auth.uid())
  )
)
WITH CHECK (
  is_admin_user_safe() OR 
  EXISTS (
    SELECT 1 FROM gantt_projects 
    WHERE gantt_projects.id = gantt_tasks.project_id 
    AND (gantt_projects.client_id = auth.uid() OR gantt_projects.created_by = auth.uid())
  )
);

-- Política para permitir exclusão de tarefas
CREATE POLICY "Authorized users can delete gantt tasks" 
ON gantt_tasks FOR DELETE 
USING (
  is_admin_user_safe() OR 
  EXISTS (
    SELECT 1 FROM gantt_projects 
    WHERE gantt_projects.id = gantt_tasks.project_id 
    AND (gantt_projects.client_id = auth.uid() OR gantt_projects.created_by = auth.uid())
  )
);
