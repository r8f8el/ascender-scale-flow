
-- Limpar dados fictícios e garantir estrutura correta
DELETE FROM fpa_reports WHERE content::text LIKE '%fictício%' OR content::text LIKE '%exemplo%';
DELETE FROM fpa_financial_data WHERE fpa_client_id NOT IN (SELECT id FROM fpa_clients);
DELETE FROM fpa_variance_analysis WHERE fpa_client_id NOT IN (SELECT id FROM fpa_clients);
DELETE FROM fpa_data_uploads WHERE fpa_client_id NOT IN (SELECT id FROM fpa_clients);

-- Garantir que as foreign keys estão corretas
ALTER TABLE fpa_clients 
ADD CONSTRAINT fk_fpa_clients_profile 
FOREIGN KEY (client_profile_id) REFERENCES client_profiles(id) ON DELETE CASCADE;

ALTER TABLE fpa_periods 
ADD CONSTRAINT fk_fpa_periods_client 
FOREIGN KEY (fpa_client_id) REFERENCES fpa_clients(id) ON DELETE CASCADE;

ALTER TABLE fpa_financial_data 
ADD CONSTRAINT fk_fpa_financial_data_client 
FOREIGN KEY (fpa_client_id) REFERENCES fpa_clients(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_fpa_financial_data_period 
FOREIGN KEY (period_id) REFERENCES fpa_periods(id) ON DELETE CASCADE;

ALTER TABLE fpa_data_uploads 
ADD CONSTRAINT fk_fpa_data_uploads_client 
FOREIGN KEY (fpa_client_id) REFERENCES fpa_clients(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_fpa_data_uploads_period 
FOREIGN KEY (period_id) REFERENCES fpa_periods(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_fpa_data_uploads_uploader 
FOREIGN KEY (uploaded_by) REFERENCES client_profiles(id) ON DELETE SET NULL;

ALTER TABLE fpa_reports 
ADD CONSTRAINT fk_fpa_reports_client 
FOREIGN KEY (fpa_client_id) REFERENCES fpa_clients(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_fpa_reports_creator 
FOREIGN KEY (created_by) REFERENCES admin_profiles(id) ON DELETE SET NULL;

ALTER TABLE fpa_variance_analysis 
ADD CONSTRAINT fk_fpa_variance_analysis_client 
FOREIGN KEY (fpa_client_id) REFERENCES fpa_clients(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_fpa_variance_analysis_period 
FOREIGN KEY (period_id) REFERENCES fpa_periods(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_fpa_variance_analysis_creator 
FOREIGN KEY (created_by) REFERENCES admin_profiles(id) ON DELETE SET NULL;

ALTER TABLE fpa_communications 
ADD CONSTRAINT fk_fpa_communications_client 
FOREIGN KEY (fpa_client_id) REFERENCES fpa_clients(id) ON DELETE CASCADE;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_fpa_clients_profile ON fpa_clients(client_profile_id);
CREATE INDEX IF NOT EXISTS idx_fpa_periods_client ON fpa_periods(fpa_client_id);
CREATE INDEX IF NOT EXISTS idx_fpa_financial_data_client_period ON fpa_financial_data(fpa_client_id, period_id);
CREATE INDEX IF NOT EXISTS idx_fpa_reports_client_status ON fpa_reports(fpa_client_id, status);
CREATE INDEX IF NOT EXISTS idx_fpa_data_uploads_client_status ON fpa_data_uploads(fpa_client_id, status);

-- Função para auto-gerar período baseado na data
CREATE OR REPLACE FUNCTION generate_period_name(start_date DATE, period_type TEXT)
RETURNS TEXT AS $$
BEGIN
  CASE period_type
    WHEN 'monthly' THEN
      RETURN TO_CHAR(start_date, 'Month YYYY');
    WHEN 'quarterly' THEN
      RETURN 'Q' || EXTRACT(QUARTER FROM start_date) || ' ' || EXTRACT(YEAR FROM start_date);
    WHEN 'yearly' THEN
      RETURN EXTRACT(YEAR FROM start_date)::TEXT;
    ELSE
      RETURN TO_CHAR(start_date, 'DD/MM/YYYY') || ' - ' || TO_CHAR(start_date + INTERVAL '1 month', 'DD/MM/YYYY');
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Trigger para auto-gerar nome do período
CREATE OR REPLACE FUNCTION set_period_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.period_name IS NULL OR NEW.period_name = '' THEN
    NEW.period_name := generate_period_name(NEW.start_date, NEW.period_type);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_period_name
  BEFORE INSERT OR UPDATE ON fpa_periods
  FOR EACH ROW
  EXECUTE FUNCTION set_period_name();

-- Função para calcular métricas automaticamente
CREATE OR REPLACE FUNCTION calculate_financial_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular gross_profit se não fornecido
  IF NEW.gross_profit = 0 AND NEW.revenue > 0 AND NEW.cost_of_goods_sold > 0 THEN
    NEW.gross_profit := NEW.revenue - NEW.cost_of_goods_sold;
  END IF;
  
  -- Calcular EBITDA se não fornecido
  IF NEW.ebitda = 0 AND NEW.gross_profit > 0 AND NEW.operating_expenses > 0 THEN
    NEW.ebitda := NEW.gross_profit - NEW.operating_expenses;
  END IF;
  
  -- Calcular EBIT se não fornecido
  IF NEW.ebit = 0 AND NEW.ebitda > 0 AND NEW.depreciation > 0 THEN
    NEW.ebit := NEW.ebitda - NEW.depreciation;
  END IF;
  
  -- Calcular net_income se não fornecido
  IF NEW.net_income = 0 AND NEW.ebit > 0 AND NEW.financial_expenses >= 0 THEN
    NEW.net_income := NEW.ebit - NEW.financial_expenses;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_financial_metrics
  BEFORE INSERT OR UPDATE ON fpa_financial_data
  FOR EACH ROW
  EXECUTE FUNCTION calculate_financial_metrics();
