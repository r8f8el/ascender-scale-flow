
-- Criar tipos enumerados para o sistema de aprovação
CREATE TYPE approval_status AS ENUM (
  'pending', 'in_progress', 'approved', 'rejected', 'cancelled', 'expired'
);

CREATE TYPE priority_level AS ENUM (
  'low', 'normal', 'high', 'urgent'
);

CREATE TYPE approval_action AS ENUM (
  'created', 'submitted', 'approved', 'rejected', 'cancelled', 'commented', 'modified'
);

-- Tabela de tipos de fluxo de aprovação
CREATE TABLE public.approval_flow_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  required_fields JSONB,
  routing_rules JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de etapas de aprovação
CREATE TABLE public.approval_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_type_id UUID REFERENCES approval_flow_types(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  step_name VARCHAR(255) NOT NULL,
  approver_user_id UUID REFERENCES auth.users(id),
  approver_role VARCHAR(255),
  is_required BOOLEAN DEFAULT true,
  conditions JSONB,
  timeout_hours INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(flow_type_id, step_number)
);

-- Tabela de solicitações de aprovação
CREATE TABLE public.approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_type_id UUID REFERENCES approval_flow_types(id),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  requested_by_user_id UUID REFERENCES auth.users(id),
  status approval_status DEFAULT 'pending',
  priority priority_level DEFAULT 'normal',
  amount DECIMAL(15,2),
  department VARCHAR(255),
  cost_center VARCHAR(255),
  business_justification TEXT,
  expected_outcome TEXT,
  risk_assessment TEXT,
  due_date DATE,
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER,
  form_data JSONB,
  attachments JSONB,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de histórico de aprovações
CREATE TABLE public.approval_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES approval_requests(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES auth.users(id),
  actor_name VARCHAR(255),
  actor_role VARCHAR(255),
  action approval_action NOT NULL,
  comments TEXT,
  step_number INTEGER,
  previous_status approval_status,
  new_status approval_status,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.approval_flow_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para approval_flow_types
CREATE POLICY "Anyone can view active flow types" ON public.approval_flow_types
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage flow types" ON public.approval_flow_types
  FOR ALL USING (is_admin_user_safe());

-- Políticas RLS para approval_steps
CREATE POLICY "Anyone can view active steps" ON public.approval_steps
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage approval steps" ON public.approval_steps
  FOR ALL USING (is_admin_user_safe());

-- Políticas RLS para approval_requests
CREATE POLICY "Users can view their own requests" ON public.approval_requests
  FOR SELECT USING (requested_by_user_id = auth.uid());

CREATE POLICY "Users can create their own requests" ON public.approval_requests
  FOR INSERT WITH CHECK (requested_by_user_id = auth.uid());

CREATE POLICY "Users can update their own pending requests" ON public.approval_requests
  FOR UPDATE USING (
    requested_by_user_id = auth.uid() 
    AND status IN ('pending', 'in_progress')
  );

CREATE POLICY "Approvers can view assigned requests" ON public.approval_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM approval_steps 
      WHERE flow_type_id = approval_requests.flow_type_id 
      AND step_number = approval_requests.current_step
      AND (approver_user_id = auth.uid() OR approver_role IN (
        SELECT role FROM admin_profiles WHERE id = auth.uid()
      ))
    )
  );

CREATE POLICY "Approvers can update assigned requests" ON public.approval_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM approval_steps 
      WHERE flow_type_id = approval_requests.flow_type_id 
      AND step_number = approval_requests.current_step
      AND (approver_user_id = auth.uid() OR approver_role IN (
        SELECT role FROM admin_profiles WHERE id = auth.uid()
      ))
    )
  );

CREATE POLICY "Admins can view all requests" ON public.approval_requests
  FOR SELECT USING (is_admin_user_safe());

CREATE POLICY "Admins can update all requests" ON public.approval_requests
  FOR UPDATE USING (is_admin_user_safe());

-- Políticas RLS para approval_history
CREATE POLICY "Users can view history of their requests" ON public.approval_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM approval_requests 
      WHERE id = approval_history.request_id 
      AND requested_by_user_id = auth.uid()
    )
  );

CREATE POLICY "Approvers can view history of assigned requests" ON public.approval_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM approval_requests ar
      JOIN approval_steps s ON ar.flow_type_id = s.flow_type_id
      WHERE ar.id = approval_history.request_id
      AND (s.approver_user_id = auth.uid() OR s.approver_role IN (
        SELECT role FROM admin_profiles WHERE id = auth.uid()
      ))
    )
  );

CREATE POLICY "System can insert history records" ON public.approval_history
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all history" ON public.approval_history
  FOR SELECT USING (is_admin_user_safe());

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_approval_flow_types_updated_at 
  BEFORE UPDATE ON approval_flow_types 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_approval_requests_updated_at 
  BEFORE UPDATE ON approval_requests 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Função para criar histórico automático
CREATE OR REPLACE FUNCTION create_approval_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Para INSERT (criação)
  IF TG_OP = 'INSERT' THEN
    INSERT INTO approval_history (
      request_id, actor_user_id, actor_name, action, 
      new_status, step_number
    ) VALUES (
      NEW.id, NEW.requested_by_user_id, 
      COALESCE((SELECT name FROM client_profiles WHERE id = NEW.requested_by_user_id), 'Sistema'),
      'created', NEW.status, NEW.current_step
    );
    RETURN NEW;
  END IF;

  -- Para UPDATE (mudanças de status)
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO approval_history (
      request_id, actor_user_id, actor_name, action,
      previous_status, new_status, step_number
    ) VALUES (
      NEW.id, auth.uid(),
      COALESCE(
        (SELECT name FROM client_profiles WHERE id = auth.uid()),
        (SELECT name FROM admin_profiles WHERE id = auth.uid()),
        'Sistema'
      ),
      CASE 
        WHEN NEW.status = 'approved' THEN 'approved'
        WHEN NEW.status = 'rejected' THEN 'rejected'
        WHEN NEW.status = 'cancelled' THEN 'cancelled'
        ELSE 'modified'
      END,
      OLD.status, NEW.status, NEW.current_step
    );
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER approval_request_history_trigger
  AFTER INSERT OR UPDATE ON approval_requests
  FOR EACH ROW EXECUTE PROCEDURE create_approval_history();

-- Inserir dados iniciais
INSERT INTO public.approval_flow_types (name, description, required_fields) VALUES
('Aprovação de Orçamento', 'Fluxo para aprovação de propostas orçamentárias', 
 '{"amount": true, "department": true, "business_justification": true, "cost_center": true}'),
('Solicitação de Investimento', 'Fluxo para aprovação de investimentos de capital',
 '{"amount": true, "expected_outcome": true, "risk_assessment": true, "business_justification": true}'),
('Aprovação de Despesas', 'Fluxo para aprovação de despesas operacionais',
 '{"amount": true, "cost_center": true, "business_justification": true}'),
('Contratação de Pessoal', 'Fluxo para aprovação de novas contratações',
 '{"department": true, "business_justification": true, "expected_outcome": true}'),
('Aprovação de Contratos', 'Fluxo para aprovação de contratos com fornecedores',
 '{"amount": true, "business_justification": true, "risk_assessment": true});

-- Inserir etapas padrão para cada tipo de fluxo
INSERT INTO public.approval_steps (flow_type_id, step_number, step_name, approver_role, timeout_hours) 
SELECT 
  id,
  1,
  'Aprovação do Gerente',
  'admin',
  72
FROM approval_flow_types;

INSERT INTO public.approval_steps (flow_type_id, step_number, step_name, approver_role, timeout_hours) 
SELECT 
  id,
  2,
  'Aprovação do Diretor',
  'super_admin',
  48
FROM approval_flow_types;

-- Habilitar realtime para as tabelas
ALTER PUBLICATION supabase_realtime ADD TABLE approval_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE approval_history;
