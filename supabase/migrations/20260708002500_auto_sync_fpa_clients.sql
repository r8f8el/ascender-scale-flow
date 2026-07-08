-- 1. Garante que exista uma restrição única em client_profile_id na tabela fpa_clients
ALTER TABLE public.fpa_clients DROP CONSTRAINT IF EXISTS fpa_clients_client_profile_id_key;
ALTER TABLE public.fpa_clients ADD CONSTRAINT fpa_clients_client_profile_id_key UNIQUE (client_profile_id);

-- 2. Atualiza a função do trigger para criar o cliente FP&A de forma genérica para QUALQUER novo client_profiles
CREATE OR REPLACE FUNCTION public.auto_create_fpa_client()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.fpa_clients (
    client_profile_id,
    company_name,
    onboarding_completed,
    current_phase
  ) VALUES (
    NEW.id,
    COALESCE(NEW.company, NEW.name, 'Empresa Indefinida'),
    false,
    1
  ) ON CONFLICT (client_profile_id) DO UPDATE SET
    company_name = COALESCE(EXCLUDED.company_name, fpa_clients.company_name);
    
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Evitar bloquear o cadastro de usuários caso ocorra qualquer erro inesperado
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Garante que o trigger está associado
DROP TRIGGER IF EXISTS trigger_auto_create_fpa_client ON public.client_profiles;
CREATE TRIGGER trigger_auto_create_fpa_client
  AFTER INSERT ON public.client_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_fpa_client();

-- 4. Sincroniza retroativamente todos os clientes de client_profiles para fpa_clients
INSERT INTO public.fpa_clients (
  client_profile_id,
  company_name,
  onboarding_completed,
  current_phase
)
SELECT 
  id,
  COALESCE(company, name, 'Empresa Indefinida'),
  false,
  1
FROM public.client_profiles cp
WHERE NOT EXISTS (
  SELECT 1 FROM public.fpa_clients fc WHERE fc.client_profile_id = cp.id
)
ON CONFLICT (client_profile_id) DO NOTHING;
