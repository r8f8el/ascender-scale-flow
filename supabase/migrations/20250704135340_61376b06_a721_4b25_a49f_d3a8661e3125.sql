
-- Criar tabela para categorias de chamados
CREATE TABLE public.ticket_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir categorias padrão
INSERT INTO public.ticket_categories (name, description) VALUES
('Dúvida', 'Dúvidas gerais sobre produtos ou serviços'),
('Problema Técnico', 'Problemas técnicos e bugs'),
('Sugestão de Melhoria', 'Sugestões para melhorar nossos serviços'),
('Financeiro', 'Questões relacionadas a pagamentos e faturamento');

-- Criar tabela para prioridades
CREATE TABLE public.ticket_priorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  level INTEGER NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir prioridades padrão
INSERT INTO public.ticket_priorities (name, level, color) VALUES
('Baixa', 1, '#10B981'),
('Média', 2, '#F59E0B'),
('Alta', 3, '#EF4444'),
('Urgente', 4, '#DC2626');

-- Criar tabela para status dos chamados
CREATE TABLE public.ticket_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT NOT NULL,
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir status padrão
INSERT INTO public.ticket_statuses (name, description, color, is_closed) VALUES
('Aberto', 'Chamado recém aberto, aguardando atendimento', '#3B82F6', false),
('Em Andamento', 'Chamado sendo atendido pela equipe', '#F59E0B', false),
('Aguardando Cliente', 'Aguardando resposta do cliente', '#8B5CF6', false),
('Resolvido', 'Chamado resolvido com sucesso', '#10B981', true),
('Fechado', 'Chamado fechado', '#6B7280', true);

-- Criar tabela principal de tickets
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.ticket_categories(id) NOT NULL,
  priority_id UUID REFERENCES public.ticket_priorities(id) NOT NULL,
  status_id UUID REFERENCES public.ticket_statuses(id) NOT NULL,
  assigned_to UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Criar função para gerar número de ticket único
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
    ticket_num TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        ticket_num := 'TCK-' || LPAD((FLOOR(RANDOM() * 999999) + 1)::TEXT, 6, '0');
        SELECT EXISTS(SELECT 1 FROM public.tickets WHERE ticket_number = ticket_num) INTO exists_check;
        IF NOT exists_check THEN
            EXIT;
        END IF;
    END LOOP;
    RETURN ticket_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar número do ticket automaticamente
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
        NEW.ticket_number := generate_ticket_number();
    END IF;
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_ticket_number
    BEFORE INSERT OR UPDATE ON public.tickets
    FOR EACH ROW EXECUTE FUNCTION set_ticket_number();

-- Criar tabela para respostas/comentários dos tickets
CREATE TABLE public.ticket_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_id UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  is_internal_note BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para anexos
CREATE TABLE public.ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  content_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.ticket_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para categorias, prioridades e status (público para leitura)
CREATE POLICY "Anyone can view ticket categories" ON public.ticket_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view ticket priorities" ON public.ticket_priorities FOR SELECT USING (true);
CREATE POLICY "Anyone can view ticket statuses" ON public.ticket_statuses FOR SELECT USING (true);

-- Políticas RLS para tickets
CREATE POLICY "Users can create tickets" ON public.tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own tickets" ON public.tickets FOR SELECT USING (auth.uid() = user_id OR user_email = auth.jwt() ->> 'email');
CREATE POLICY "Admins can view all tickets" ON public.tickets FOR SELECT USING (
  EXISTS(SELECT 1 FROM public.admin_profiles WHERE id = auth.uid())
);
CREATE POLICY "Admins can update tickets" ON public.tickets FOR UPDATE USING (
  EXISTS(SELECT 1 FROM public.admin_profiles WHERE id = auth.uid())
);

-- Políticas RLS para respostas
CREATE POLICY "Users can view responses of their tickets" ON public.ticket_responses FOR SELECT USING (
  EXISTS(SELECT 1 FROM public.tickets WHERE id = ticket_id AND (user_id = auth.uid() OR user_email = auth.jwt() ->> 'email'))
  OR EXISTS(SELECT 1 FROM public.admin_profiles WHERE id = auth.uid())
);
CREATE POLICY "Users can create responses on their tickets" ON public.ticket_responses FOR INSERT WITH CHECK (
  EXISTS(SELECT 1 FROM public.tickets WHERE id = ticket_id AND (user_id = auth.uid() OR user_email = auth.jwt() ->> 'email'))
  OR EXISTS(SELECT 1 FROM public.admin_profiles WHERE id = auth.uid())
);
CREATE POLICY "Admins can create responses" ON public.ticket_responses FOR INSERT WITH CHECK (
  EXISTS(SELECT 1 FROM public.admin_profiles WHERE id = auth.uid())
);

-- Políticas RLS para anexos
CREATE POLICY "Users can view attachments of their tickets" ON public.ticket_attachments FOR SELECT USING (
  EXISTS(SELECT 1 FROM public.tickets WHERE id = ticket_id AND (user_id = auth.uid() OR user_email = auth.jwt() ->> 'email'))
  OR EXISTS(SELECT 1 FROM public.admin_profiles WHERE id = auth.uid())
);
CREATE POLICY "Users can upload attachments to their tickets" ON public.ticket_attachments FOR INSERT WITH CHECK (
  EXISTS(SELECT 1 FROM public.tickets WHERE id = ticket_id AND (user_id = auth.uid() OR user_email = auth.jwt() ->> 'email'))
  OR EXISTS(SELECT 1 FROM public.admin_profiles WHERE id = auth.uid())
);
