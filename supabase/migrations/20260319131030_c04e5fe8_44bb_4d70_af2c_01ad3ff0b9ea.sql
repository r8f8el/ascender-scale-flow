
-- =============================================
-- CORE TABLES
-- =============================================

-- Admin profiles
CREATE TABLE public.admin_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Hierarchy levels
CREATE TABLE public.hierarchy_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  level integer NOT NULL DEFAULT 1,
  can_approve boolean NOT NULL DEFAULT false,
  can_invite_members boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Client profiles
CREATE TABLE public.client_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  cnpj text,
  is_primary_contact boolean NOT NULL DEFAULT false,
  hierarchy_level_id uuid REFERENCES public.hierarchy_levels(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Collaborators
CREATE TABLE public.collaborators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'collaborator',
  department text,
  phone text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Team invitations
CREATE TABLE public.team_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  inviter_name text NOT NULL,
  company_id uuid REFERENCES public.client_profiles(id),
  company_name text,
  message text,
  token text NOT NULL DEFAULT gen_random_uuid()::text,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  status text NOT NULL DEFAULT 'pending',
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Team members
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.client_profiles(id),
  status text NOT NULL DEFAULT 'active',
  invited_by text,
  invited_email text,
  name text,
  joined_at timestamptz DEFAULT now(),
  hierarchy_level_id uuid REFERENCES public.hierarchy_levels(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Company teams
CREATE TABLE public.company_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.client_profiles(id),
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- DOCUMENT TABLES
-- =============================================

CREATE TABLE public.document_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.client_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  filename text NOT NULL,
  file_path text,
  file_size bigint,
  file_type text,
  category_id uuid REFERENCES public.document_categories(id),
  description text,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  file_path text,
  file_type text,
  file_size bigint,
  client_id uuid REFERENCES public.client_profiles(id),
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  file_path text NOT NULL,
  file_type text,
  file_size bigint,
  folder text DEFAULT '/',
  client_id uuid REFERENCES public.client_profiles(id),
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- TICKET SYSTEM
-- =============================================

CREATE TABLE public.ticket_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL DEFAULT '#808080',
  is_closed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ticket_priorities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL DEFAULT '#808080',
  level integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ticket_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text NOT NULL,
  title text NOT NULL,
  description text,
  status_id uuid REFERENCES public.ticket_statuses(id),
  priority_id uuid REFERENCES public.ticket_priorities(id),
  category_id uuid REFERENCES public.ticket_categories(id),
  assigned_to uuid REFERENCES public.admin_profiles(id),
  user_name text,
  user_email text,
  user_phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  closed_at timestamptz
);

CREATE TABLE public.ticket_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES public.tickets(id) ON DELETE CASCADE,
  content text NOT NULL,
  sender_name text,
  sender_email text,
  sender_type text DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ticket_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES public.tickets(id) ON DELETE CASCADE,
  filename text NOT NULL,
  file_path text NOT NULL,
  file_type text,
  file_size bigint,
  uploaded_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- CHAT SYSTEM
-- =============================================

CREATE TABLE public.chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES auth.users(id),
  client_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_room_id uuid REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  content text NOT NULL,
  sender_id uuid REFERENCES auth.users(id),
  sender_name text NOT NULL,
  sender_type text NOT NULL DEFAULT 'client',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.automatic_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_type text NOT NULL,
  message_content text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- NOTIFICATIONS
-- =============================================

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'general',
  sent_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- GANTT / PROJECT MANAGEMENT
-- =============================================

CREATE TABLE public.gantt_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  client_id uuid REFERENCES public.client_profiles(id),
  created_by uuid REFERENCES auth.users(id),
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date NOT NULL DEFAULT (CURRENT_DATE + interval '30 days'),
  progress integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'planning',
  priority text NOT NULL DEFAULT 'medium',
  budget numeric,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.gantt_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.gantt_projects(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date NOT NULL DEFAULT (CURRENT_DATE + interval '7 days'),
  progress integer NOT NULL DEFAULT 0,
  priority text NOT NULL DEFAULT 'medium',
  assigned_to uuid REFERENCES public.collaborators(id),
  dependencies jsonb DEFAULT '[]'::jsonb,
  is_milestone boolean NOT NULL DEFAULT false,
  estimated_hours numeric,
  actual_hours numeric DEFAULT 0,
  category text,
  tags jsonb DEFAULT '[]'::jsonb,
  collaborators jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.gantt_task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES public.gantt_tasks(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES auth.users(id),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.gantt_time_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES public.gantt_tasks(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  hours numeric NOT NULL,
  description text,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Projects (general)
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  client_id uuid REFERENCES public.client_profiles(id),
  status text NOT NULL DEFAULT 'active',
  start_date date,
  end_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.project_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  scheduled_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.schedule_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_date date,
  end_date date,
  status text DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Tasks (general)
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES public.collaborators(id),
  status text NOT NULL DEFAULT 'pending',
  priority text NOT NULL DEFAULT 'medium',
  due_date date,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- KANBAN
-- =============================================

CREATE TABLE public.kanban_boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  client_id uuid REFERENCES public.client_profiles(id),
  created_by uuid REFERENCES auth.users(id),
  is_active boolean NOT NULL DEFAULT true,
  board_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.kanban_columns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid REFERENCES public.kanban_boards(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#808080',
  column_order integer NOT NULL DEFAULT 0,
  wip_limit integer,
  is_done_column boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.kanban_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  column_id uuid REFERENCES public.kanban_columns(id) ON DELETE CASCADE NOT NULL,
  board_id uuid REFERENCES public.kanban_boards(id) ON DELETE CASCADE NOT NULL,
  assigned_to uuid REFERENCES public.collaborators(id),
  created_by uuid REFERENCES auth.users(id),
  priority text NOT NULL DEFAULT 'medium',
  due_date date,
  start_date date,
  estimated_hours numeric,
  actual_hours numeric NOT NULL DEFAULT 0,
  task_order integer NOT NULL DEFAULT 0,
  labels jsonb DEFAULT '[]'::jsonb,
  attachments jsonb DEFAULT '[]'::jsonb,
  checklist jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.kanban_task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES public.kanban_tasks(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES auth.users(id),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.kanban_time_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES public.kanban_tasks(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  hours numeric NOT NULL,
  description text,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- APPROVAL SYSTEM (Solicitações)
-- =============================================

CREATE TABLE public.solicitacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text DEFAULT '',
  tipo_solicitacao text DEFAULT 'Geral',
  periodo_referencia text NOT NULL,
  valor_solicitado numeric,
  justificativa text,
  data_limite timestamptz,
  prioridade text NOT NULL DEFAULT 'Media',
  status text NOT NULL DEFAULT 'Em Elaboração',
  solicitante_id uuid REFERENCES auth.users(id) NOT NULL,
  aprovador_atual_id uuid REFERENCES auth.users(id),
  etapa_atual integer NOT NULL DEFAULT 1,
  aprovadores_necessarios jsonb DEFAULT '[]'::jsonb,
  aprovadores_completos jsonb DEFAULT '[]'::jsonb,
  data_criacao timestamptz NOT NULL DEFAULT now(),
  data_ultima_modificacao timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.anexos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitacao_id uuid REFERENCES public.solicitacoes(id) ON DELETE CASCADE NOT NULL,
  nome_arquivo text NOT NULL,
  url_arquivo text NOT NULL,
  tamanho_arquivo bigint,
  tipo_arquivo text,
  data_upload timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.historico_aprovacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitacao_id uuid REFERENCES public.solicitacoes(id) ON DELETE CASCADE NOT NULL,
  usuario_id uuid REFERENCES auth.users(id) NOT NULL,
  nome_usuario text NOT NULL,
  acao text NOT NULL,
  comentario text,
  data_acao timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.fluxo_aprovadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES public.client_profiles(id) NOT NULL,
  aprovador_id uuid REFERENCES auth.users(id) NOT NULL,
  nome_aprovador text NOT NULL,
  email_aprovador text NOT NULL,
  ordem integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- FP&A SYSTEM
-- =============================================

CREATE TABLE public.fpa_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_profile_id uuid REFERENCES public.client_profiles(id) NOT NULL,
  company_name text NOT NULL,
  industry text,
  business_model text,
  strategic_objectives text,
  onboarding_completed boolean NOT NULL DEFAULT false,
  current_phase integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.fpa_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fpa_client_id uuid REFERENCES public.fpa_clients(id) ON DELETE CASCADE NOT NULL,
  period_name text NOT NULL,
  period_type text NOT NULL DEFAULT 'monthly',
  is_actual boolean NOT NULL DEFAULT false,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.fpa_financial_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fpa_client_id uuid REFERENCES public.fpa_clients(id) ON DELETE CASCADE NOT NULL,
  period_id uuid REFERENCES public.fpa_periods(id) ON DELETE CASCADE,
  account_name text NOT NULL,
  account_type text NOT NULL DEFAULT 'revenue',
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BRL',
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.fpa_data_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fpa_client_id uuid REFERENCES public.fpa_clients(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_path text,
  file_type text,
  status text NOT NULL DEFAULT 'pending',
  records_count integer DEFAULT 0,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.fpa_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fpa_client_id uuid REFERENCES public.fpa_clients(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  report_type text NOT NULL DEFAULT 'standard',
  config jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.fpa_variance_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fpa_client_id uuid REFERENCES public.fpa_clients(id) ON DELETE CASCADE NOT NULL,
  period_id uuid REFERENCES public.fpa_periods(id),
  account_name text NOT NULL,
  budget_amount numeric NOT NULL DEFAULT 0,
  actual_amount numeric NOT NULL DEFAULT 0,
  variance_amount numeric GENERATED ALWAYS AS (actual_amount - budget_amount) STORED,
  variance_percentage numeric,
  analysis_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- BI Embeds
CREATE TABLE public.client_bi_embeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fpa_client_id uuid REFERENCES public.fpa_clients(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'other',
  title text,
  description text,
  embed_url text,
  iframe_html text,
  filters jsonb,
  is_active boolean NOT NULL DEFAULT true,
  external_dashboard_id text,
  access_mode text NOT NULL DEFAULT 'secure',
  created_by uuid REFERENCES auth.users(id),
  display_order integer NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'dashboard',
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- SYSTEM LOGS
-- =============================================

CREATE TABLE public.system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  details text,
  user_id uuid REFERENCES auth.users(id),
  user_email text,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hierarchy_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automatic_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gantt_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gantt_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gantt_task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gantt_time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_aprovacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fluxo_aprovadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fpa_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fpa_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fpa_financial_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fpa_data_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fpa_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fpa_variance_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_bi_embeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES - Allow authenticated users full access for now
-- =============================================

-- Generic policy for all tables - authenticated users can do everything
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'admin_profiles','hierarchy_levels','client_profiles','collaborators',
    'team_invitations','team_members','company_teams',
    'document_categories','client_documents','documents','files',
    'ticket_statuses','ticket_priorities','ticket_categories','tickets',
    'ticket_responses','ticket_attachments',
    'chat_rooms','chat_messages','automatic_messages','notifications',
    'gantt_projects','gantt_tasks','gantt_task_comments','gantt_time_logs',
    'projects','project_schedules','schedule_phases','tasks',
    'kanban_boards','kanban_columns','kanban_tasks','kanban_task_comments','kanban_time_logs',
    'solicitacoes','anexos','historico_aprovacao','fluxo_aprovadores',
    'fpa_clients','fpa_periods','fpa_financial_data','fpa_data_uploads','fpa_reports','fpa_variance_analysis',
    'client_bi_embeds','system_logs'
  ])
  LOOP
    EXECUTE format('CREATE POLICY "Allow authenticated select on %I" ON public.%I FOR SELECT TO authenticated USING (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY "Allow authenticated insert on %I" ON public.%I FOR INSERT TO authenticated WITH CHECK (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY "Allow authenticated update on %I" ON public.%I FOR UPDATE TO authenticated USING (true) WITH CHECK (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY "Allow authenticated delete on %I" ON public.%I FOR DELETE TO authenticated USING (true)', tbl, tbl);
  END LOOP;
END $$;

-- Allow anon access to ticket lookup tables and ticket creation
CREATE POLICY "Allow anon select ticket_statuses" ON public.ticket_statuses FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon select ticket_priorities" ON public.ticket_priorities FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon select ticket_categories" ON public.ticket_categories FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert tickets" ON public.tickets FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon select tickets" ON public.tickets FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert ticket_attachments" ON public.ticket_attachments FOR INSERT TO anon WITH CHECK (true);

-- =============================================
-- SEED DATA
-- =============================================

-- Default hierarchy levels
INSERT INTO public.hierarchy_levels (name, level, can_approve, can_invite_members) VALUES
  ('Diretor', 1, true, true),
  ('Gerente', 2, true, true),
  ('Coordenador', 3, true, false),
  ('Analista', 4, false, false),
  ('Assistente', 5, false, false);

-- Default ticket statuses
INSERT INTO public.ticket_statuses (name, color, is_closed) VALUES
  ('Aberto', '#3B82F6', false),
  ('Em Andamento', '#F59E0B', false),
  ('Aguardando', '#8B5CF6', false),
  ('Resolvido', '#10B981', true),
  ('Fechado', '#6B7280', true);

-- Default ticket priorities
INSERT INTO public.ticket_priorities (name, color, level) VALUES
  ('Baixa', '#10B981', 1),
  ('Média', '#F59E0B', 2),
  ('Alta', '#EF4444', 3),
  ('Urgente', '#DC2626', 4);

-- Default ticket categories
INSERT INTO public.ticket_categories (name, description) VALUES
  ('Suporte Técnico', 'Problemas técnicos e dúvidas'),
  ('Financeiro', 'Questões financeiras e pagamentos'),
  ('Comercial', 'Propostas e negociações'),
  ('Outro', 'Outros assuntos');

-- Default document categories
INSERT INTO public.document_categories (name, description) VALUES
  ('Contrato', 'Contratos e aditivos'),
  ('Relatório', 'Relatórios gerais'),
  ('Nota Fiscal', 'Notas fiscais'),
  ('Proposta', 'Propostas comerciais'),
  ('Outro', 'Outros documentos');
