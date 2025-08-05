-- Corrigir foreign keys duplicadas e implementar sistema multi-tenant adequado

-- 1. Remover foreign keys duplicadas
DROP CONSTRAINT IF EXISTS fk_fpa_clients_profile;
DROP CONSTRAINT IF EXISTS fk_fpa_reports_client;

-- 2. Função para automaticamente criar FPA client quando client_profile é criado
CREATE OR REPLACE FUNCTION auto_create_fpa_client()
RETURNS TRIGGER AS $$
BEGIN
  -- Se não é um email de admin (@ascalate.com.br), criar automaticamente cliente FPA
  IF NEW.email NOT LIKE '%@ascalate.com.br' THEN
    INSERT INTO public.fpa_clients (
      client_profile_id,
      company_name,
      onboarding_completed,
      current_phase
    ) VALUES (
      NEW.id,
      COALESCE(NEW.company, NEW.name),
      false,
      1
    ) ON CONFLICT (client_profile_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger para auto-criar FPA client
DROP TRIGGER IF EXISTS trigger_auto_create_fpa_client ON public.client_profiles;
CREATE TRIGGER trigger_auto_create_fpa_client
  AFTER INSERT ON public.client_profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_fpa_client();

-- 4. Atualizar RLS para garantir sistema multi-tenant
-- Clientes só veem seus próprios dados, admins veem tudo

-- FPA clients - clientes não podem editar, só visualizar seus dados
DROP POLICY IF EXISTS "Clients can manage their own FPA data" ON public.fpa_clients;
CREATE POLICY "Clients can view their own FPA data" 
ON public.fpa_clients FOR SELECT 
USING (client_profile_id = auth.uid());

-- FPA reports - clientes só veem relatórios, admins controlam criação
DROP POLICY IF EXISTS "Users can create reports" ON public.fpa_reports;
CREATE POLICY "Users can view their reports" 
ON public.fpa_reports FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM fpa_clients 
  WHERE fpa_clients.id = fpa_reports.fpa_client_id 
  AND (fpa_clients.client_profile_id = auth.uid() OR EXISTS (
    SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()
  ))
));

-- FPA financial data - clientes só visualizam
DROP POLICY IF EXISTS "Users can manage their financial data" ON public.fpa_financial_data;
CREATE POLICY "Users can view their financial data" 
ON public.fpa_financial_data FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM fpa_clients 
  WHERE fpa_clients.id = fpa_financial_data.fpa_client_id 
  AND (fpa_clients.client_profile_id = auth.uid() OR EXISTS (
    SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()
  ))
));

-- Adicionar unique constraint para evitar duplicatas
ALTER TABLE public.fpa_clients 
ADD CONSTRAINT unique_fpa_client_profile 
UNIQUE (client_profile_id);