
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Shield } from 'lucide-react';
import { useCompanyTeamMembers } from '@/hooks/useTeamMembers';

interface Aprovador {
  id: string;
  name: string;
  email: string;
  hierarchy_level: {
    name: string;
    level: number;
    can_approve: boolean;
  };
}

interface SeletorAprovadoresHierarquiaProps {
  aprovadoresSelecionados: Aprovador[];
  onAprovadoresChange: (aprovadores: Aprovador[]) => void;
}

export const SeletorAprovadoresHierarquia: React.FC<SeletorAprovadoresHierarquiaProps> = ({
  aprovadoresSelecionados,
  onAprovadoresChange
}) => {
  const [aprovadorSelecionado, setAprovadorSelecionado] = useState<string>('');
  
  const { data: teamMembers = [], isLoading } = useCompanyTeamMembers();

  // Filtrar apenas membros que podem aprovar
  const aprovadoresDisponiveis = teamMembers.filter(member => 
    member.hierarchy_levels?.can_approve
  );

  const adicionarAprovador = () => {
    if (!aprovadorSelecionado) return;

    const membro = aprovadoresDisponiveis.find(m => m.id === aprovadorSelecionado);
    if (!membro || !membro.hierarchy_levels) return;

    // Verificar se já foi adicionado
    if (aprovadoresSelecionados.some(a => a.id === membro.id)) return;

    const novoAprovador: Aprovador = {
      id: membro.id,
      name: membro.name,
      email: membro.email,
      hierarchy_level: membro.hierarchy_levels
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
          <Shield className="h-4 w-4" />
          Selecionar Aprovadores da Equipe
        </Label>
        <p className="text-sm text-muted-foreground mb-3">
          Apenas membros com permissão de aprovação aparecerão na lista
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
                      {membro.hierarchy_levels?.name} - {membro.email}
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

      {/* Lista de aprovadores selecionados */}
      {aprovadoresSelecionados.length > 0 && (
        <div className="space-y-2">
          <Label>Aprovadores selecionados (por ordem hierárquica):</Label>
          <div className="space-y-2">
            {aprovadoresSelecionados
              .sort((a, b) => a.hierarchy_level.level - b.hierarchy_level.level)
              .map((aprovador, index) => (
                <div key={aprovador.id} className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{index + 1}º</Badge>
                    <div>
                      <p className="font-medium">{aprovador.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {aprovador.hierarchy_level.name} - {aprovador.email}
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
        </div>
      )}
    </div>
  );
};
