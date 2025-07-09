-- Criar migração para integrar todas as áreas do admin com Supabase

-- Criar tabela para mensagens automáticas
CREATE TABLE public.automatic_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para logs do sistema
CREATE TABLE public.system_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT NOT NULL,
  type TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  level TEXT NOT NULL DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para cronogramas
CREATE TABLE public.project_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID,
  title TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (client_id) REFERENCES public.client_profiles(id) ON DELETE CASCADE
);

-- Criar tabela para etapas dos cronogramas
CREATE TABLE public.schedule_phases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID NOT NULL,
  description TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  phase_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (schedule_id) REFERENCES public.project_schedules(id) ON DELETE CASCADE
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.automatic_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_phases ENABLE ROW LEVEL SECURITY;

-- Políticas para mensagens automáticas - apenas admins podem gerenciar
CREATE POLICY "Admins can manage automatic messages" 
ON public.automatic_messages 
FOR ALL 
USING (is_admin_user_safe()) 
WITH CHECK (is_admin_user_safe());

-- Políticas para logs - apenas admins podem visualizar
CREATE POLICY "Admins can view system logs" 
ON public.system_logs 
FOR SELECT 
USING (is_admin_user_safe());

CREATE POLICY "System can insert logs" 
ON public.system_logs 
FOR INSERT 
WITH CHECK (true);

-- Políticas para cronogramas
CREATE POLICY "Admins can manage all schedules" 
ON public.project_schedules 
FOR ALL 
USING (is_admin_user_safe()) 
WITH CHECK (is_admin_user_safe());

CREATE POLICY "Clients can view their published schedules" 
ON public.project_schedules 
FOR SELECT 
USING (
  published = true AND 
  client_id = auth.uid()
);

-- Políticas para etapas dos cronogramas
CREATE POLICY "Admins can manage all schedule phases" 
ON public.schedule_phases 
FOR ALL 
USING (is_admin_user_safe()) 
WITH CHECK (is_admin_user_safe());

CREATE POLICY "Clients can view phases of their published schedules" 
ON public.schedule_phases 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.project_schedules 
    WHERE id = schedule_phases.schedule_id 
    AND published = true 
    AND client_id = auth.uid()
  )
);

-- Trigger para updated_at
CREATE TRIGGER update_automatic_messages_updated_at
BEFORE UPDATE ON public.automatic_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_schedules_updated_at
BEFORE UPDATE ON public.project_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schedule_phases_updated_at
BEFORE UPDATE ON public.schedule_phases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para registrar logs do sistema
CREATE OR REPLACE FUNCTION public.log_system_action(
  p_user_name TEXT,
  p_type TEXT,
  p_ip_address TEXT,
  p_action TEXT,
  p_details TEXT DEFAULT NULL,
  p_level TEXT DEFAULT 'info'
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.system_logs (user_name, type, ip_address, action, details, level)
  VALUES (p_user_name, p_type, p_ip_address, p_action, p_details, p_level)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;