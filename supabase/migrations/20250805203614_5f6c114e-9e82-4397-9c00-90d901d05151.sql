-- Corrigir foreign keys duplicadas e implementar sistema multi-tenant adequado

-- 1. Remover foreign keys duplicadas da tabela fpa_clients
ALTER TABLE public.fpa_clients 
DROP CONSTRAINT IF EXISTS fk_fpa_clients_profile;

-- 2. Remover foreign keys duplicadas da tabela fpa_reports  
ALTER TABLE public.fpa_reports 
DROP CONSTRAINT IF EXISTS fk_fpa_reports_client;

-- 3. Função para automaticamente criar FPA client quando client_profile é criado
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

-- 4. Trigger para auto-criar FPA client
DROP TRIGGER IF EXISTS trigger_auto_create_fpa_client ON public.client_profiles;
CREATE TRIGGER trigger_auto_create_fpa_client
  AFTER INSERT ON public.client_profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_fpa_client();

-- 5. Adicionar unique constraint para evitar duplicatas
ALTER TABLE public.fpa_clients 
ADD CONSTRAINT IF NOT EXISTS unique_fpa_client_profile 
UNIQUE (client_profile_id);