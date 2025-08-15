
-- Limpar tabelas de aprovação existentes
DROP TABLE IF EXISTS approval_attachments CASCADE;
DROP TABLE IF EXISTS approval_history CASCADE;
DROP TABLE IF EXISTS approval_requests CASCADE;
DROP TABLE IF EXISTS approval_steps CASCADE;
DROP TABLE IF EXISTS approval_flow_types CASCADE;

-- Criar tabela de solicitações
CREATE TABLE public.solicitacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  periodo_referencia TEXT NOT NULL,
  descricao TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Em Elaboração' CHECK (status IN ('Em Elaboração', 'Pendente', 'Aprovado', 'Rejeitado', 'Requer Ajuste')),
  solicitante_id UUID NOT NULL REFERENCES auth.users(id),
  aprovador_atual_id UUID REFERENCES auth.users(id),
  etapa_atual INTEGER DEFAULT 1,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_ultima_modificacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de anexos
CREATE TABLE public.anexos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitacao_id UUID NOT NULL REFERENCES public.solicitacoes(id) ON DELETE CASCADE,
  nome_arquivo TEXT NOT NULL,
  url_arquivo TEXT NOT NULL,
  tamanho_arquivo INTEGER,
  tipo_arquivo TEXT,
  data_upload TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de histórico de aprovação
CREATE TABLE public.historico_aprovacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitacao_id UUID NOT NULL REFERENCES public.solicitacoes(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES auth.users(id),
  nome_usuario TEXT NOT NULL,
  acao TEXT NOT NULL CHECK (acao IN ('Criação', 'Aprovação', 'Rejeição', 'Solicitação de Ajuste')),
  comentario TEXT,
  data_acao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para definir a sequência de aprovadores por cliente
CREATE TABLE public.fluxo_aprovadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES auth.users(id),
  aprovador_id UUID NOT NULL REFERENCES auth.users(id),
  ordem INTEGER NOT NULL,
  nome_aprovador TEXT NOT NULL,
  email_aprovador TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX idx_solicitacoes_solicitante ON public.solicitacoes(solicitante_id);
CREATE INDEX idx_solicitacoes_aprovador_atual ON public.solicitacoes(aprovador_atual_id);
CREATE INDEX idx_solicitacoes_status ON public.solicitacoes(status);
CREATE INDEX idx_anexos_solicitacao ON public.anexos(solicitacao_id);
CREATE INDEX idx_historico_solicitacao ON public.historico_aprovacao(solicitacao_id);
CREATE INDEX idx_fluxo_cliente ON public.fluxo_aprovadores(cliente_id);

-- Habilitar RLS
ALTER TABLE public.solicitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_aprovacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fluxo_aprovadores ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para solicitacoes
CREATE POLICY "Usuários podem ver suas próprias solicitações" ON public.solicitacoes
  FOR SELECT USING (solicitante_id = auth.uid() OR aprovador_atual_id = auth.uid() OR is_admin_user_safe());

CREATE POLICY "Usuários podem criar solicitações" ON public.solicitacoes
  FOR INSERT WITH CHECK (solicitante_id = auth.uid());

CREATE POLICY "Solicitantes podem atualizar suas solicitações" ON public.solicitacoes
  FOR UPDATE USING (solicitante_id = auth.uid() OR aprovador_atual_id = auth.uid() OR is_admin_user_safe());

-- Políticas RLS para anexos
CREATE POLICY "Usuários podem ver anexos de solicitações acessíveis" ON public.anexos
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.solicitacoes s 
    WHERE s.id = anexos.solicitacao_id 
    AND (s.solicitante_id = auth.uid() OR s.aprovador_atual_id = auth.uid() OR is_admin_user_safe())
  ));

CREATE POLICY "Usuários podem inserir anexos em suas solicitações" ON public.anexos
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.solicitacoes s 
    WHERE s.id = anexos.solicitacao_id 
    AND s.solicitante_id = auth.uid()
  ));

-- Políticas RLS para histórico
CREATE POLICY "Usuários podem ver histórico de solicitações acessíveis" ON public.historico_aprovacao
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.solicitacoes s 
    WHERE s.id = historico_aprovacao.solicitacao_id 
    AND (s.solicitante_id = auth.uid() OR s.aprovador_atual_id = auth.uid() OR is_admin_user_safe())
  ));

CREATE POLICY "Usuários podem criar registros de histórico" ON public.historico_aprovacao
  FOR INSERT WITH CHECK (usuario_id = auth.uid() OR is_admin_user_safe());

-- Políticas RLS para fluxo de aprovadores
CREATE POLICY "Admins podem gerenciar fluxo de aprovadores" ON public.fluxo_aprovadores
  FOR ALL USING (is_admin_user_safe()) WITH CHECK (is_admin_user_safe());

CREATE POLICY "Usuários podem ver seu fluxo de aprovadores" ON public.fluxo_aprovadores
  FOR SELECT USING (cliente_id = auth.uid() OR aprovador_id = auth.uid());

-- Trigger para atualizar data_ultima_modificacao
CREATE OR REPLACE FUNCTION update_data_ultima_modificacao()
RETURNS TRIGGER AS $$
BEGIN
  NEW.data_ultima_modificacao = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_solicitacoes_timestamp
  BEFORE UPDATE ON public.solicitacoes
  FOR EACH ROW
  EXECUTE FUNCTION update_data_ultima_modificacao();
