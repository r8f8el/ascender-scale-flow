
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Shield, Users } from 'lucide-react';
import { useCompanyAccess } from '@/hooks/useCompanyAccess';
import { useAuth } from '@/contexts/AuthContext';

interface Aprovador {
  id: string;
  name: string;
  email: string;
  cargo: string;
  nivel: number;
}

interface SeletorAprovadoresEquipeProps {
  aprovadoresSelecionados: Aprovador[];
  onAprovadoresChange: (aprovadores: Aprovador[]) => void;
}

export const SeletorAprovadoresEquipe: React.FC<SeletorAprovadoresEquipeProps> = ({
  aprovadoresSelecionados,
  onAprovadoresChange
}) => {
  const { user } = useAuth();
  const [aprovadorSelecionado, setAprovadorSelecionado] = useState<string>('');
  
  const { data: companyAccess, isLoading } = useCompanyAccess();

  // Get company members who can be approvers (excluding current user)
  const aprovadoresDisponiveis = (companyAccess?.companyMembers || []).filter(member => {
    // Exclude self
    if (member.id === user?.id) return false;
    return true;
  });

  const adicionarAprovador = () => {
    if (!aprovadorSelecionado) return;

    const membro = aprovadoresDisponiveis.find(m => m.id === aprovadorSelecionado);
    if (!membro) return;

    // Check if already added
    if (aprovadoresSelecionados.some(a => a.id === membro.id)) return;

    const novoAprovador: Aprovador = {
      id: membro.id,
      name: membro.name,
      email: membro.email,
      cargo: membro.hierarchy_levels?.name || 'Colaborador',
      nivel: membro.hierarchy_levels?.level || 5
    };

    onAprovadoresChange([...aprovadoresSelecionados, novoAprovador]);
    setAprovadorSelecionado('');
  };

  const removerAprovador = (id: string) => {
    onAprovadoresChange(aprovadoresSelecionados.filter(a => a.id !== id));
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Carregando equipe...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Selecionar Aprovadores da Equipe
        </Label>
        <p className="text-sm text-muted-foreground mb-3">
          Escolha os membros da empresa que devem aprovar esta solicitação
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select 
            value={aprovadorSelecionado} 
            onValueChange={setAprovadorSelecionado}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um aprovador" />
            </SelectTrigger>
            <SelectContent>
              {aprovadoresDisponiveis.map(membro => (
                <SelectItem key={membro.id} value={membro.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{membro.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {membro.hierarchy_levels?.name || 'Colaborador'} - {membro.email}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            type="button"
            onClick={adicionarAprovador}
            disabled={!aprovadorSelecionado}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Selected approvers list */}
      {aprovadoresSelecionados.length > 0 && (
        <div className="space-y-2">
          <Label>Aprovadores selecionados (por ordem hierárquica):</Label>
          <div className="space-y-2">
            {aprovadoresSelecionados
              .sort((a, b) => a.nivel - b.nivel) // Lower level = higher hierarchy
              .map((aprovador, index) => (
                <div key={aprovador.id} className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{index + 1}º</Badge>
                    <div>
                      <p className="font-medium">{aprovador.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {aprovador.cargo} - {aprovador.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removerAprovador(aprovador.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
          </div>
        </div>
      )}

      {aprovadoresDisponiveis.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Nenhum membro da equipe com permissão de aprovação encontrado.</p>
          <p className="text-sm mt-1">
            Configure o nível hierárquico dos membros na seção de Equipe.
          </p>
        </div>
      )}
    </div>
  );
};
