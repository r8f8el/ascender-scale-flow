
-- Criar a tabela solicitacoes se não existir
CREATE TABLE IF NOT EXISTS public.solicitacoes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo text NOT NULL,
  descricao text,
  tipo_solicitacao text NOT NULL,
  periodo_referencia text NOT NULL,
  valor_solicitado numeric,
  justificativa text,
  data_limite timestamp with time zone,
  prioridade text NOT NULL DEFAULT 'Media' CHECK (prioridade IN ('Baixa', 'Media', 'Alta')),
  status text NOT NULL DEFAULT 'Em Elaboração' CHECK (status IN ('Em Elaboração', 'Pendente', 'Aprovado', 'Rejeitado', 'Requer Ajuste')),
  solicitante_id uuid NOT NULL REFERENCES public.client_profiles(id),
  aprovador_atual_id uuid REFERENCES public.client_profiles(id),
  etapa_atual integer NOT NULL DEFAULT 1,
  aprovadores_necessarios jsonb DEFAULT '[]'::jsonb,
  aprovadores_completos jsonb DEFAULT '[]'::jsonb,
  data_criacao timestamp with time zone NOT NULL DEFAULT now(),
  data_ultima_modificacao timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela solicitacoes
ALTER TABLE public.solicitacoes ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para solicitacoes
DROP POLICY IF EXISTS "Usuários podem criar suas solicitações" ON public.solicitacoes;
CREATE POLICY "Usuários podem criar suas solicitações" 
ON public.solicitacoes FOR INSERT 
WITH CHECK (auth.uid() = solicitante_id);

DROP POLICY IF EXISTS "Usuários podem ver suas solicitações" ON public.solicitacoes;
CREATE POLICY "Usuários podem ver suas solicitações" 
ON public.solicitacoes FOR SELECT 
USING (
  solicitante_id = auth.uid() OR 
  aprovador_atual_id = auth.uid() OR 
  is_admin_user_safe()
);

DROP POLICY IF EXISTS "Usuários podem atualizar suas solicitações" ON public.solicitacoes;
CREATE POLICY "Usuários podem atualizar suas solicitações" 
ON public.solicitacoes FOR UPDATE 
USING (
  solicitante_id = auth.uid() OR 
  aprovador_atual_id = auth.uid() OR 
  is_admin_user_safe()
);

DROP POLICY IF EXISTS "Admins podem gerenciar todas as solicitações" ON public.solicitacoes;
CREATE POLICY "Admins podem gerenciar todas as solicitações" 
ON public.solicitacoes FOR ALL 
USING (is_admin_user_safe())
WITH CHECK (is_admin_user_safe());

-- Criar trigger para atualizar data_ultima_modificacao
DROP TRIGGER IF EXISTS update_solicitacoes_updated_at ON public.solicitacoes;
CREATE TRIGGER update_solicitacoes_updated_at
  BEFORE UPDATE ON public.solicitacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_data_ultima_modificacao();

-- Criar trigger para validação de solicitação
DROP TRIGGER IF EXISTS validate_solicitacao_trigger ON public.solicitacoes;
CREATE TRIGGER validate_solicitacao_trigger
  BEFORE INSERT OR UPDATE ON public.solicitacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_solicitacao();
