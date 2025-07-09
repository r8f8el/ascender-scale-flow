export interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CollaboratorFormData {
  name: string;
  email: string;
  role: string;
  department: string;
  phone: string;
  is_active: boolean;
}

export const ROLE_LABELS = {
  manager: 'Gerente',
  developer: 'Desenvolvedor',
  designer: 'Designer',
  analyst: 'Analista',
  consultant: 'Consultor',
  collaborator: 'Colaborador'
} as const;

export const getRoleLabel = (role: string): string => {
  return ROLE_LABELS[role as keyof typeof ROLE_LABELS] || 'Colaborador';
};