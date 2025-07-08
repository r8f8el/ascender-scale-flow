-- Criar tabela de colaboradores
CREATE TABLE public.collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'collaborator',
  department TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de projetos
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  client_id UUID REFERENCES public.client_profiles(id),
  status TEXT NOT NULL DEFAULT 'planning',
  priority TEXT NOT NULL DEFAULT 'medium',
  start_date DATE,
  end_date DATE,
  budget DECIMAL(10,2),
  progress INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.admin_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de tarefas
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES public.collaborators(id),
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  due_date DATE,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  created_by UUID REFERENCES public.admin_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de notificações
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para colaboradores
CREATE POLICY "Admins can manage collaborators" 
ON public.collaborators 
FOR ALL 
USING (is_admin_user_safe());

CREATE POLICY "Collaborators can view their own data" 
ON public.collaborators 
FOR SELECT 
USING (email = (auth.jwt() ->> 'email'::text));

-- Políticas para projetos
CREATE POLICY "Admins can manage projects" 
ON public.projects 
FOR ALL 
USING (is_admin_user_safe());

CREATE POLICY "Clients can view their projects" 
ON public.projects 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.client_profiles 
    WHERE id = projects.client_id AND auth.uid() = client_profiles.id
  )
);

-- Políticas para tarefas
CREATE POLICY "Admins can manage tasks" 
ON public.tasks 
FOR ALL 
USING (is_admin_user_safe());

CREATE POLICY "Collaborators can view assigned tasks" 
ON public.tasks 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.collaborators 
    WHERE id = tasks.assigned_to AND email = (auth.jwt() ->> 'email'::text)
  )
);

-- Políticas para notificações
CREATE POLICY "Admins can manage notifications" 
ON public.notifications 
FOR ALL 
USING (is_admin_user_safe());

-- Triggers para updated_at
CREATE TRIGGER update_collaborators_updated_at
BEFORE UPDATE ON public.collaborators
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para enviar notificação quando tarefa é atribuída
CREATE OR REPLACE FUNCTION public.notify_task_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_to IS NOT NULL AND (OLD.assigned_to IS NULL OR OLD.assigned_to != NEW.assigned_to) THEN
    INSERT INTO public.notifications (recipient_email, subject, message, type)
    SELECT 
      c.email,
      'Nova tarefa atribuída: ' || NEW.title,
      'Você foi designado para a tarefa "' || NEW.title || '" no projeto. Prazo: ' || COALESCE(NEW.due_date::text, 'Não definido'),
      'task_assignment'
    FROM public.collaborators c
    WHERE c.id = NEW.assigned_to;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para notificações de tarefas
CREATE TRIGGER notify_task_assignment_trigger
AFTER INSERT OR UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.notify_task_assignment();