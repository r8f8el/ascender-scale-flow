
export interface Solicitacao {
  id: string;
  titulo: string;
  descricao: string;
  tipo_solicitacao: string;
  periodo_referencia: string;
  valor_solicitado?: number;
  justificativa?: string;
  data_limite?: string;
  prioridade: 'Baixa' | 'Media' | 'Alta';
  status: 'Em Elaboração' | 'Pendente' | 'Aprovado' | 'Rejeitado' | 'Requer Ajuste';
  solicitante_id: string;
  aprovador_atual_id?: string;
  etapa_atual: number;
  aprovadores_necessarios?: Array<{
    id: string;
    name: string;
    email: string;
    nivel: number;
    aprovado: boolean;
    data_aprovacao?: string;
  }>;
  aprovadores_completos?: Array<{
    id: string;
    name: string;
    email: string;
    nivel: number;
    aprovado: boolean;
    data_aprovacao: string;
    comentario?: string;
  }>;
  data_criacao: string;
  data_ultima_modificacao: string;
}

export interface Anexo {
  id: string;
  solicitacao_id: string;
  nome_arquivo: string;
  url_arquivo: string;
  tamanho_arquivo?: number;
  tipo_arquivo?: string;
  data_upload: string;
}

export interface HistoricoAprovacao {
  id: string;
  solicitacao_id: string;
  usuario_id: string;
  nome_usuario: string;
  acao: 'Criação' | 'Aprovação' | 'Rejeição' | 'Solicitação de Ajuste';
  comentario?: string;
  data_acao: string;
}

export interface FluxoAprovador {
  id: string;
  cliente_id: string;
  aprovador_id: string;
  ordem: number;
  nome_aprovador: string;
  email_aprovador: string;
  created_at: string;
}

export interface Cargo {
  id: string;
  nome: string;
  nivel: number;
  descricao?: string;
  created_at: string;
  updated_at: string;
}

export interface EmpresaFuncionario {
  id: string;
  empresa_id: string;
  funcionario_id: string;
  cargo_id: string;
  pode_aprovar: boolean;
  created_at: string;
  updated_at: string;
}
