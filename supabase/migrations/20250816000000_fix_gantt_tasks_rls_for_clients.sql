-- Corrigir políticas RLS para gantt_tasks permitindo que clientes gerenciem suas tarefas
-- Drop das políticas existentes
DROP POLICY IF EXISTS "Admins can manage all gantt tasks" ON public.gantt_tasks;
DROP POLICY IF EXISTS "Clients can view tasks from their projects" ON public.gantt_tasks;

-- Criar novas políticas mais permissivas
-- Política para admins gerenciarem todas as tarefas
CREATE POLICY "Admins can manage all gantt tasks" ON public.gantt_tasks
  FOR ALL USING (public.is_admin_user_safe());

-- Política para clientes visualizarem tarefas de seus projetos
CREATE POLICY "Clients can view tasks from their projects" ON public.gantt_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.gantt_projects 
      WHERE gantt_projects.id = gantt_tasks.project_id 
      AND gantt_projects.client_id = auth.uid()
    )
  );

-- Política para clientes inserirem tarefas em seus projetos
CREATE POLICY "Clients can insert tasks in their projects" ON public.gantt_tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.gantt_projects 
      WHERE gantt_projects.id = gantt_tasks.project_id 
      AND gantt_projects.client_id = auth.uid()
    )
  );

-- Política para clientes atualizarem tarefas de seus projetos
CREATE POLICY "Clients can update tasks in their projects" ON public.gantt_tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.gantt_projects 
      WHERE gantt_projects.id = gantt_tasks.project_id 
      AND gantt_projects.client_id = auth.uid()
    )
  );

-- Política para clientes excluírem tarefas de seus projetos
CREATE POLICY "Clients can delete tasks in their projects" ON public.gantt_tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.gantt_projects 
      WHERE gantt_projects.id = gantt_tasks.project_id 
      AND gantt_projects.client_id = auth.uid()
    )
  );

-- Corrigir políticas RLS para gantt_projects também
DROP POLICY IF EXISTS "Admins can manage all gantt projects" ON public.gantt_projects;
DROP POLICY IF EXISTS "Clients can view their gantt projects" ON public.gantt_projects;

-- Política para admins gerenciarem todos os projetos
CREATE POLICY "Admins can manage all gantt projects" ON public.gantt_projects
  FOR ALL USING (public.is_admin_user_safe());

-- Política para clientes visualizarem seus projetos
CREATE POLICY "Clients can view their gantt projects" ON public.gantt_projects
  FOR SELECT USING (client_id = auth.uid());

-- Política para clientes inserirem seus próprios projetos
CREATE POLICY "Clients can insert their own projects" ON public.gantt_projects
  FOR INSERT WITH CHECK (client_id = auth.uid());

-- Política para clientes atualizarem seus próprios projetos
CREATE POLICY "Clients can update their own projects" ON public.gantt_projects
  FOR UPDATE USING (client_id = auth.uid());

-- Política para clientes excluírem seus próprios projetos
CREATE POLICY "Clients can delete their own projects" ON public.gantt_projects
  FOR DELETE USING (client_id = auth.uid());
