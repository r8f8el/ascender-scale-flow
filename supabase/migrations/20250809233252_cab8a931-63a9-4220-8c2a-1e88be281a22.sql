-- Create kanban boards table
CREATE TABLE public.kanban_boards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.admin_profiles(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  board_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create kanban columns table
CREATE TABLE public.kanban_columns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES public.kanban_boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  column_order INTEGER NOT NULL DEFAULT 0,
  wip_limit INTEGER,
  is_done_column BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create kanban tasks table  
CREATE TABLE public.kanban_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  column_id UUID NOT NULL REFERENCES public.kanban_columns(id) ON DELETE CASCADE,
  board_id UUID NOT NULL REFERENCES public.kanban_boards(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.collaborators(id),
  created_by UUID,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  start_date DATE,
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2) DEFAULT 0,
  task_order INTEGER NOT NULL DEFAULT 0,
  labels JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  checklist JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gantt projects table (enhanced projects)
CREATE TABLE public.gantt_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.admin_profiles(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  budget DECIMAL(12,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gantt tasks table
CREATE TABLE public.gantt_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.gantt_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  assigned_to UUID REFERENCES public.collaborators(id),
  created_by UUID,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2) DEFAULT 0,
  is_milestone BOOLEAN DEFAULT false,
  dependencies JSONB DEFAULT '[]'::jsonb, -- Array of task IDs this task depends on
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task comments table (shared between kanban and gantt)
CREATE TABLE public.task_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL, -- Can reference either kanban_tasks or gantt_tasks
  task_type TEXT NOT NULL CHECK (task_type IN ('kanban', 'gantt')),
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('admin', 'client')),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.kanban_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gantt_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gantt_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kanban_boards
CREATE POLICY "Admins can manage all kanban boards" ON public.kanban_boards
  FOR ALL USING (is_admin_user_safe());

CREATE POLICY "Clients can view their kanban boards" ON public.kanban_boards
  FOR SELECT USING (client_id = auth.uid());

-- RLS Policies for kanban_columns
CREATE POLICY "Admins can manage all kanban columns" ON public.kanban_columns
  FOR ALL USING (is_admin_user_safe());

CREATE POLICY "Clients can view columns of their boards" ON public.kanban_columns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.kanban_boards 
      WHERE kanban_boards.id = kanban_columns.board_id 
      AND kanban_boards.client_id = auth.uid()
    )
  );

-- RLS Policies for kanban_tasks
CREATE POLICY "Admins can manage all kanban tasks" ON public.kanban_tasks
  FOR ALL USING (is_admin_user_safe());

CREATE POLICY "Clients can view tasks from their boards" ON public.kanban_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.kanban_boards 
      WHERE kanban_boards.id = kanban_tasks.board_id 
      AND kanban_boards.client_id = auth.uid()
    )
  );

-- RLS Policies for gantt_projects
CREATE POLICY "Admins can manage all gantt projects" ON public.gantt_projects
  FOR ALL USING (is_admin_user_safe());

CREATE POLICY "Clients can view their gantt projects" ON public.gantt_projects
  FOR SELECT USING (client_id = auth.uid());

-- RLS Policies for gantt_tasks
CREATE POLICY "Admins can manage all gantt tasks" ON public.gantt_tasks
  FOR ALL USING (is_admin_user_safe());

CREATE POLICY "Clients can view tasks from their projects" ON public.gantt_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.gantt_projects 
      WHERE gantt_projects.id = gantt_tasks.project_id 
      AND gantt_projects.client_id = auth.uid()
    )
  );

-- RLS Policies for task_comments
CREATE POLICY "Admins can manage all task comments" ON public.task_comments
  FOR ALL USING (is_admin_user_safe());

CREATE POLICY "Users can create comments" ON public.task_comments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view comments on accessible tasks" ON public.task_comments
  FOR SELECT USING (
    (task_type = 'kanban' AND EXISTS (
      SELECT 1 FROM public.kanban_tasks kt
      JOIN public.kanban_boards kb ON kt.board_id = kb.id
      WHERE kt.id = task_comments.task_id::uuid 
      AND (kb.client_id = auth.uid() OR is_admin_user_safe())
    ))
    OR
    (task_type = 'gantt' AND EXISTS (
      SELECT 1 FROM public.gantt_tasks gt
      JOIN public.gantt_projects gp ON gt.project_id = gp.id
      WHERE gt.id = task_comments.task_id::uuid 
      AND (gp.client_id = auth.uid() OR is_admin_user_safe())
    ))
  );

-- Create indexes for better performance
CREATE INDEX idx_kanban_columns_board_id ON public.kanban_columns(board_id);
CREATE INDEX idx_kanban_tasks_column_id ON public.kanban_tasks(column_id);
CREATE INDEX idx_kanban_tasks_board_id ON public.kanban_tasks(board_id);
CREATE INDEX idx_gantt_tasks_project_id ON public.gantt_tasks(project_id);
CREATE INDEX idx_task_comments_task_id ON public.task_comments(task_id);

-- Create triggers for updated_at
CREATE TRIGGER update_kanban_boards_updated_at BEFORE UPDATE ON public.kanban_boards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_kanban_columns_updated_at BEFORE UPDATE ON public.kanban_columns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_kanban_tasks_updated_at BEFORE UPDATE ON public.kanban_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gantt_projects_updated_at BEFORE UPDATE ON public.gantt_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gantt_tasks_updated_at BEFORE UPDATE ON public.gantt_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default kanban columns for new boards
CREATE OR REPLACE FUNCTION create_default_kanban_columns()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.kanban_columns (board_id, name, color, column_order) VALUES
    (NEW.id, 'Backlog', '#6B7280', 0),
    (NEW.id, 'Em Progresso', '#3B82F6', 1),
    (NEW.id, 'Em Revisão', '#F59E0B', 2),
    (NEW.id, 'Concluído', '#10B981', 3);
  
  UPDATE public.kanban_columns 
  SET is_done_column = true 
  WHERE board_id = NEW.id AND name = 'Concluído';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_kanban_default_columns 
  AFTER INSERT ON public.kanban_boards 
  FOR EACH ROW EXECUTE FUNCTION create_default_kanban_columns();