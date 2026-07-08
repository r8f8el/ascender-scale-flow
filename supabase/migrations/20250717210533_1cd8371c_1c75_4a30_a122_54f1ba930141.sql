
-- Tabelas para o sistema FP&A

-- Tabela para clientes FP&A
CREATE TABLE fpa_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_profile_id uuid REFERENCES client_profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  industry text,
  business_model text,
  strategic_objectives text,
  onboarding_completed boolean DEFAULT false,
  current_phase integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela para períodos de dados
CREATE TABLE fpa_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fpa_client_id uuid REFERENCES fpa_clients(id) ON DELETE CASCADE,
  period_name text NOT NULL, -- "Janeiro 2024", "Q1 2024", etc
  period_type text NOT NULL, -- "monthly", "quarterly", "yearly"
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_actual boolean DEFAULT false, -- true para dados reais, false para previsões
  created_at timestamp with time zone DEFAULT now()
);

-- Tabela para direcionadores de negócio
CREATE TABLE fpa_drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fpa_client_id uuid REFERENCES fpa_clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  unit text, -- "unidades", "R$", "%", etc
  driver_type text NOT NULL, -- "revenue", "cost", "operational"
  formula text, -- fórmula matemática para cálculo
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Tabela para valores dos direcionadores por período
CREATE TABLE fpa_driver_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES fpa_drivers(id) ON DELETE CASCADE,
  period_id uuid REFERENCES fpa_periods(id) ON DELETE CASCADE,
  value numeric NOT NULL,
  scenario_name text DEFAULT 'base', -- "base", "optimistic", "pessimistic"
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(driver_id, period_id, scenario_name)
);

-- Tabela para dados financeiros
CREATE TABLE fpa_financial_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fpa_client_id uuid REFERENCES fpa_clients(id) ON DELETE CASCADE,
  period_id uuid REFERENCES fpa_periods(id) ON DELETE CASCADE,
  scenario_name text DEFAULT 'base',
  
  -- DRE (Demonstração de Resultado)
  revenue numeric DEFAULT 0,
  cost_of_goods_sold numeric DEFAULT 0,
  gross_profit numeric DEFAULT 0,
  operating_expenses numeric DEFAULT 0,
  ebitda numeric DEFAULT 0,
  depreciation numeric DEFAULT 0,
  ebit numeric DEFAULT 0,
  financial_expenses numeric DEFAULT 0,
  net_income numeric DEFAULT 0,
  
  -- Fluxo de Caixa
  operating_cash_flow numeric DEFAULT 0,
  investing_cash_flow numeric DEFAULT 0,
  financing_cash_flow numeric DEFAULT 0,
  net_cash_flow numeric DEFAULT 0,
  cash_balance numeric DEFAULT 0,
  
  -- Balanço Patrimonial (principais itens)
  current_assets numeric DEFAULT 0,
  non_current_assets numeric DEFAULT 0,
  total_assets numeric DEFAULT 0,
  current_liabilities numeric DEFAULT 0,
  non_current_liabilities numeric DEFAULT 0,
  equity numeric DEFAULT 0,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(fpa_client_id, period_id, scenario_name)
);

-- Tabela para upload de dados
CREATE TABLE fpa_data_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fpa_client_id uuid REFERENCES fpa_clients(id) ON DELETE CASCADE,
  period_id uuid REFERENCES fpa_periods(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL, -- "balance_sheet", "income_statement", "cash_flow", "operational"
  status text DEFAULT 'uploaded', -- "uploaded", "processing", "validated", "error"
  validation_errors jsonb,
  uploaded_by uuid REFERENCES client_profiles(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Tabela para relatórios FP&A
CREATE TABLE fpa_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fpa_client_id uuid REFERENCES fpa_clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  report_type text NOT NULL, -- "monthly", "quarterly", "variance", "scenario", "forecast"
  period_covered text NOT NULL,
  content jsonb NOT NULL, -- conteúdo estruturado do relatório
  insights text, -- insights do consultor
  status text DEFAULT 'draft', -- "draft", "published", "archived"
  created_by uuid REFERENCES admin_profiles(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela para comunicações FP&A
CREATE TABLE fpa_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fpa_client_id uuid REFERENCES fpa_clients(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  sender_type text NOT NULL, -- "client", "admin"
  message text NOT NULL,
  context_type text, -- "report", "scenario", "general"
  context_id uuid, -- ID do relatório, cenário, etc
  is_internal boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Tabela para análise de variação
CREATE TABLE fpa_variance_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fpa_client_id uuid REFERENCES fpa_clients(id) ON DELETE CASCADE,
  period_id uuid REFERENCES fpa_periods(id) ON DELETE CASCADE,
  metric_name text NOT NULL,
  planned_value numeric NOT NULL,
  actual_value numeric NOT NULL,
  variance_amount numeric NOT NULL,
  variance_percentage numeric NOT NULL,
  analysis_comment text,
  created_by uuid REFERENCES admin_profiles(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_fpa_clients_profile ON fpa_clients(client_profile_id);
CREATE INDEX idx_fpa_periods_client ON fpa_periods(fpa_client_id);
CREATE INDEX idx_fpa_drivers_client ON fpa_drivers(fpa_client_id);
CREATE INDEX idx_fpa_driver_values_driver_period ON fpa_driver_values(driver_id, period_id);
CREATE INDEX idx_fpa_financial_data_client_period ON fpa_financial_data(fpa_client_id, period_id);
CREATE INDEX idx_fpa_reports_client ON fpa_reports(fpa_client_id);
CREATE INDEX idx_fpa_communications_client ON fpa_communications(fpa_client_id);

-- RLS Policies
ALTER TABLE fpa_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE fpa_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE fpa_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fpa_driver_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE fpa_financial_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE fpa_data_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE fpa_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE fpa_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE fpa_variance_analysis ENABLE ROW LEVEL SECURITY;

-- Políticas para clientes
CREATE POLICY "Clients can view their own FPA data" ON fpa_clients FOR SELECT USING (
  client_profile_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())
);

CREATE POLICY "Admins can manage all FPA clients" ON fpa_clients FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())
);

-- Políticas para períodos
CREATE POLICY "Users can view periods of their FPA client" ON fpa_periods FOR SELECT USING (
  EXISTS (SELECT 1 FROM fpa_clients WHERE id = fpa_periods.fpa_client_id AND 
    (client_profile_id = auth.uid() OR EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())))
);

CREATE POLICY "Admins can manage all periods" ON fpa_periods FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())
);

-- Políticas similares para outras tabelas
CREATE POLICY "Users can view their drivers" ON fpa_drivers FOR SELECT USING (
  EXISTS (SELECT 1 FROM fpa_clients WHERE id = fpa_drivers.fpa_client_id AND 
    (client_profile_id = auth.uid() OR EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())))
);

CREATE POLICY "Admins can manage all drivers" ON fpa_drivers FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can view their driver values" ON fpa_driver_values FOR SELECT USING (
  EXISTS (SELECT 1 FROM fpa_drivers d JOIN fpa_clients c ON d.fpa_client_id = c.id 
    WHERE d.id = fpa_driver_values.driver_id AND 
    (c.client_profile_id = auth.uid() OR EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())))
);

CREATE POLICY "Admins can manage all driver values" ON fpa_driver_values FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can view their financial data" ON fpa_financial_data FOR SELECT USING (
  EXISTS (SELECT 1 FROM fpa_clients WHERE id = fpa_financial_data.fpa_client_id AND 
    (client_profile_id = auth.uid() OR EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())))
);

CREATE POLICY "Admins can manage all financial data" ON fpa_financial_data FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can upload their data" ON fpa_data_uploads FOR INSERT WITH CHECK (
  uploaded_by = auth.uid() AND
  EXISTS (SELECT 1 FROM fpa_clients WHERE id = fpa_data_uploads.fpa_client_id AND client_profile_id = auth.uid())
);

CREATE POLICY "Users can view their uploads" ON fpa_data_uploads FOR SELECT USING (
  EXISTS (SELECT 1 FROM fpa_clients WHERE id = fpa_data_uploads.fpa_client_id AND 
    (client_profile_id = auth.uid() OR EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())))
);

CREATE POLICY "Admins can manage all uploads" ON fpa_data_uploads FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can view their reports" ON fpa_reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM fpa_clients WHERE id = fpa_reports.fpa_client_id AND 
    (client_profile_id = auth.uid() OR EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())))
);

CREATE POLICY "Admins can manage all reports" ON fpa_reports FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can view their communications" ON fpa_communications FOR SELECT USING (
  EXISTS (SELECT 1 FROM fpa_clients WHERE id = fpa_communications.fpa_client_id AND 
    (client_profile_id = auth.uid() OR EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())))
);

CREATE POLICY "Users can create communications" ON fpa_communications FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (SELECT 1 FROM fpa_clients WHERE id = fpa_communications.fpa_client_id AND 
    (client_profile_id = auth.uid() OR EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())))
);

CREATE POLICY "Admins can manage all communications" ON fpa_communications FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can view their variance analysis" ON fpa_variance_analysis FOR SELECT USING (
  EXISTS (SELECT 1 FROM fpa_clients WHERE id = fpa_variance_analysis.fpa_client_id AND 
    (client_profile_id = auth.uid() OR EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())))
);

CREATE POLICY "Admins can manage all variance analysis" ON fpa_variance_analysis FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_fpa_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_fpa_clients_updated_at BEFORE UPDATE ON fpa_clients FOR EACH ROW EXECUTE PROCEDURE update_fpa_updated_at_column();
CREATE TRIGGER update_fpa_financial_data_updated_at BEFORE UPDATE ON fpa_financial_data FOR EACH ROW EXECUTE PROCEDURE update_fpa_updated_at_column();
CREATE TRIGGER update_fpa_reports_updated_at BEFORE UPDATE ON fpa_reports FOR EACH ROW EXECUTE PROCEDURE update_fpa_updated_at_column();

-- Dados de exemplo para desenvolvimento
INSERT INTO fpa_clients (client_profile_id, company_name, industry, business_model, strategic_objectives, onboarding_completed)
SELECT 
  id,
  COALESCE(company, 'Empresa Exemplo'),
  'Tecnologia',
  'B2B SaaS',
  'Crescimento sustentável e aumento da margem EBITDA',
  true
FROM client_profiles 
WHERE is_primary_contact = true
LIMIT 3;
