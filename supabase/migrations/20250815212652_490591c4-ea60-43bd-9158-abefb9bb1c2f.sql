
-- Criar tabela para hierarquia de cargos
CREATE TABLE public.cargos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT UNIQUE NOT NULL,
  nivel INTEGER NOT NULL, -- Quanto maior o número, maior a hierarquia
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir alguns cargos padrão
INSERT INTO public.cargos (nome, nivel, descricao) VALUES 
('Analista', 1, 'Nível inicial'),
('Analista Sênior', 2, 'Analista experiente'),
('Coordenador', 3, 'Coordena equipe de analistas'),
('Gerente', 4, 'Gerente de área'),
('Diretor', 5, 'Diretor da empresa');

-- Adicionar cargo_id à tabela client_profiles
ALTER TABLE public.client_profiles 
ADD COLUMN cargo_id UUID REFERENCES public.cargos(id),
ADD COLUMN pode_aprovar BOOLEAN DEFAULT false;

-- Criar tabela para estrutura de empresas e seus funcionários
CREATE TABLE public.empresa_funcionarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.client_profiles(id),
  funcionario_id UUID NOT NULL REFERENCES public.client_profiles(id),
  cargo_id UUID NOT NULL REFERENCES public.cargos(id),
  pode_aprovar BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(empresa_id, funcionario_id)
);

-- Atualizar tabela de solicitações para ter múltiplos aprovadores possíveis
ALTER TABLE public.solicitacoes 
ADD COLUMN aprovadores_necessarios JSONB DEFAULT '[]'::jsonb,
ADD COLUMN aprovadores_completos JSONB DEFAULT '[]'::jsonb;

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.cargos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresa_funcionarios ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para cargos
CREATE POLICY "Todos podem ver cargos" ON public.cargos
  FOR SELECT USING (true);

CREATE POLICY "Admins podem gerenciar cargos" ON public.cargos
  FOR ALL USING (is_admin_user_safe());

-- Políticas RLS para empresa_funcionarios
CREATE POLICY "Funcionários podem ver sua empresa" ON public.empresa_funcionarios
  FOR SELECT USING (
    funcionario_id = auth.uid() OR 
    empresa_id = auth.uid() OR 
    is_admin_user_safe()
  );

CREATE POLICY "Empresas podem gerenciar funcionários" ON public.empresa_funcionarios
  FOR ALL USING (
    empresa_id = auth.uid() OR 
    is_admin_user_safe()
  );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_empresa_funcionarios()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_empresa_funcionarios_updated_at
  BEFORE UPDATE ON public.empresa_funcionarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_empresa_funcionarios();
