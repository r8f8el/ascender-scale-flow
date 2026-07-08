
-- Corrigir os dados da empresa e do usuário convidado
-- Definir um nome de empresa consistente para ambos os perfis

-- 1. Atualizar a empresa que fez o convite (rafaelg.ontijo60@gmail.com)
UPDATE public.client_profiles 
SET company = 'ASD Consultoria'
WHERE email = 'rafaelg.ontijo60@gmail.com' AND company IS NULL;

-- 2. Atualizar o perfil do usuário convidado (iagabierafa@gmail.com) 
UPDATE public.client_profiles 
SET company = 'ASD Consultoria'
WHERE email = 'iagabierafa@gmail.com';

-- 3. Verificar se há outros membros da equipe que precisam ser corrigidos
UPDATE public.client_profiles 
SET company = 'ASD Consultoria'
WHERE id IN (
  SELECT tm.user_id 
  FROM public.team_members tm
  JOIN public.client_profiles cp ON cp.id = tm.company_id
  WHERE cp.email = 'rafaelg.ontijo60@gmail.com'
  AND tm.status = 'active'
  AND tm.user_id IS NOT NULL
);

-- 4. Atualizar registros relacionados para manter consistência
UPDATE public.team_invitations 
SET company_name = 'ASD Consultoria'
WHERE company_name IS NULL OR company_name = 'asd'
AND email = 'iagabierafa@gmail.com';
