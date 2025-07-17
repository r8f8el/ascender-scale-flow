
-- Create approval flow types table
CREATE TABLE public.approval_flow_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create approval requests table
CREATE TABLE public.approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_type_id UUID REFERENCES approval_flow_types(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(15,2),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 1,
  requested_by_user_id UUID NOT NULL,
  requested_by_name TEXT NOT NULL,
  requested_by_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create approval steps table (defines the approval workflow)
CREATE TABLE public.approval_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_type_id UUID REFERENCES approval_flow_types(id) NOT NULL,
  step_order INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  approver_role TEXT,
  approver_user_id UUID,
  approver_name TEXT,
  approver_email TEXT,
  is_required BOOLEAN DEFAULT true,
  amount_threshold DECIMAL(15,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(flow_type_id, step_order)
);

-- Create approval history table (audit trail)
CREATE TABLE public.approval_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES approval_requests(id) NOT NULL,
  step_order INTEGER NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 'commented', 'delegated')),
  approver_user_id UUID,
  approver_name TEXT NOT NULL,
  approver_email TEXT NOT NULL,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create approval attachments table
CREATE TABLE public.approval_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES approval_requests(id) NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  content_type TEXT,
  uploaded_by_user_id UUID,
  uploaded_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE approval_flow_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for approval_flow_types
CREATE POLICY "Anyone can view approval flow types" ON approval_flow_types
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage approval flow types" ON approval_flow_types
  FOR ALL USING (is_admin_user_safe());

-- RLS Policies for approval_requests
CREATE POLICY "Users can view their own requests" ON approval_requests
  FOR SELECT USING (
    requested_by_user_id = auth.uid() OR 
    is_admin_user_safe() OR
    EXISTS (
      SELECT 1 FROM approval_steps 
      WHERE flow_type_id = approval_requests.flow_type_id 
      AND (approver_user_id = auth.uid() OR approver_email = (auth.jwt() ->> 'email'))
    )
  );

CREATE POLICY "Users can create requests" ON approval_requests
  FOR INSERT WITH CHECK (requested_by_user_id = auth.uid() OR is_admin_user_safe());

CREATE POLICY "Admins and approvers can update requests" ON approval_requests
  FOR UPDATE USING (
    is_admin_user_safe() OR
    EXISTS (
      SELECT 1 FROM approval_steps 
      WHERE flow_type_id = approval_requests.flow_type_id 
      AND (approver_user_id = auth.uid() OR approver_email = (auth.jwt() ->> 'email'))
    )
  );

-- RLS Policies for approval_steps
CREATE POLICY "Anyone can view approval steps" ON approval_steps
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage approval steps" ON approval_steps
  FOR ALL USING (is_admin_user_safe());

-- RLS Policies for approval_history
CREATE POLICY "Users can view history of their requests" ON approval_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM approval_requests 
      WHERE id = approval_history.request_id 
      AND (requested_by_user_id = auth.uid() OR is_admin_user_safe())
    ) OR
    approver_user_id = auth.uid()
  );

CREATE POLICY "Approvers can create history entries" ON approval_history
  FOR INSERT WITH CHECK (
    approver_user_id = auth.uid() OR is_admin_user_safe()
  );

-- RLS Policies for approval_attachments
CREATE POLICY "Users can view attachments of accessible requests" ON approval_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM approval_requests 
      WHERE id = approval_attachments.request_id 
      AND (
        requested_by_user_id = auth.uid() OR 
        is_admin_user_safe() OR
        EXISTS (
          SELECT 1 FROM approval_steps 
          WHERE flow_type_id = approval_requests.flow_type_id 
          AND (approver_user_id = auth.uid() OR approver_email = (auth.jwt() ->> 'email'))
        )
      )
    )
  );

CREATE POLICY "Users can upload attachments to their requests" ON approval_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM approval_requests 
      WHERE id = approval_attachments.request_id 
      AND (requested_by_user_id = auth.uid() OR is_admin_user_safe())
    )
  );

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_approval_flow_types_updated_at BEFORE UPDATE ON approval_flow_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approval_requests_updated_at BEFORE UPDATE ON approval_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample approval flow types
INSERT INTO approval_flow_types (name, description) VALUES
  ('Orçamento', 'Solicitações de aprovação de orçamento'),
  ('Despesas', 'Solicitações de aprovação de despesas'),
  ('Investimentos', 'Solicitações de aprovação de investimentos'),
  ('Contratos', 'Solicitações de aprovação de contratos');

-- Insert sample approval steps for each flow type
INSERT INTO approval_steps (flow_type_id, step_order, step_name, approver_role, amount_threshold) 
SELECT 
  ft.id,
  1,
  'Aprovação Gerencial',
  'manager',
  CASE 
    WHEN ft.name = 'Orçamento' THEN 5000.00
    WHEN ft.name = 'Despesas' THEN 1000.00
    WHEN ft.name = 'Investimentos' THEN 10000.00
    WHEN ft.name = 'Contratos' THEN 50000.00
  END
FROM approval_flow_types ft;

INSERT INTO approval_steps (flow_type_id, step_order, step_name, approver_role, amount_threshold) 
SELECT 
  ft.id,
  2,
  'Aprovação Financeira',
  'financial_director',
  CASE 
    WHEN ft.name = 'Orçamento' THEN 5000.00
    WHEN ft.name = 'Despesas' THEN 1000.00
    WHEN ft.name = 'Investimentos' THEN 10000.00
    WHEN ft.name = 'Contratos' THEN 50000.00
  END
FROM approval_flow_types ft;
