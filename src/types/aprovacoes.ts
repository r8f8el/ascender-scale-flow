
export interface Solicitacao {
  id: string;
  titulo: string;
  periodo_referencia: string;
  descricao: string;
  status: 'Em Elaboração' | 'Pendente' | 'Aprovado' | 'Rejeitado' | 'Requer Ajuste';
  solicitante_id: string;
  aprovador_atual_id?: string;
  etapa_atual: number;
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
