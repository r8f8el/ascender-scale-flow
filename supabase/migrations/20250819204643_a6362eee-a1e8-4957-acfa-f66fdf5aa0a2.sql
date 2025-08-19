
-- Remover colaboradores que não possuem email @ascalate.com.br
DELETE FROM public.collaborators 
WHERE email NOT LIKE '%@ascalate.com.br';

-- Atualizar a política RLS para permitir que apenas emails @ascalate.com.br sejam inseridos
DROP POLICY IF EXISTS "Only Ascalate emails can be added as collaborators" ON public.collaborators;

CREATE POLICY "Only Ascalate emails can be added as collaborators" 
ON public.collaborators 
FOR INSERT 
WITH CHECK (
  is_admin_user_safe() AND 
  email LIKE '%@ascalate.com.br'
);

-- Criar uma função para validar emails de colaboradores
CREATE OR REPLACE FUNCTION public.validate_collaborator_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Validar que o email é @ascalate.com.br
  IF NEW.email NOT LIKE '%@ascalate.com.br' THEN
    RAISE EXCEPTION 'Apenas emails @ascalate.com.br são permitidos para colaboradores';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Criar trigger para validar emails na inserção e atualização
DROP TRIGGER IF EXISTS validate_collaborator_email_trigger ON public.collaborators;
CREATE TRIGGER validate_collaborator_email_trigger
  BEFORE INSERT OR UPDATE ON public.collaborators
  FOR EACH ROW
  EXECUTE FUNCTION validate_collaborator_email();

-- Inserir colaboradores padrão com emails @ascalate.com.br se não existirem
INSERT INTO public.collaborators (name, email, role, department, is_active)
VALUES 
  ('Daniel Ascalate', 'daniel@ascalate.com.br', 'manager', 'Administração', true),
  ('Rafael Gontijo', 'rafael.gontijo@ascalate.com.br', 'manager', 'Administração', true)
ON CONFLICT (email) DO NOTHING;
