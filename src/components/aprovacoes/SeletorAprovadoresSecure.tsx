
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Aprovador {
  id: string;
  name: string;
  email: string;
  cargo: string;
  nivel: number;
}

interface SeletorAprovadoresSecureProps {
  aprovadoresSelecionados: Aprovador[];
  onAprovadoresChange: (aprovadores: Aprovador[]) => void;
}

export const SeletorAprovadoresSecure: React.FC<SeletorAprovadoresSecureProps> = ({
  aprovadoresSelecionados,
  onAprovadoresChange
}) => {
  const { user } = useAuth();
  const [aprovadoresDisponiveis, setAprovadoresDisponiveis] = useState<Aprovador[]>([]);
  const [userCompany, setUserCompany] = useState<string>('');
  const [aprovadorSelecionado, setAprovadorSelecionado] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Get current user's company first
  useEffect(() => {
    const fetchUserCompany = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('client_profiles')
          .select('company')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUserCompany(data?.company || '');
      } catch (error) {
        console.error('Erro ao buscar empresa do usuário:', error);
        toast.error('Erro ao carregar dados do usuário');
      }
    };

    fetchUserCompany();
  }, [user?.id]);

  // Fetch approvers from the same company only
  useEffect(() => {
    if (!userCompany || !user?.id) {
      setAprovadoresDisponiveis([]);
      return;
    }

    const fetchAprovadores = async () => {
      setLoading(true);
      try {
        // Only fetch users from the same company who can approve
        const { data, error } = await supabase
          .from('client_profiles')
          .select(`
            id,
            name,
            email,
            pode_aprovar,
            empresa_funcionarios!inner(
              cargos!inner(nome, nivel)
            )
          `)
          .eq('company', userCompany)
          .eq('pode_aprovar', true)
          .order('empresa_funcionarios.cargos.nivel', { ascending: false });

        if (error) throw error;

        const aprovadores = (data || []).map(item => ({
          id: item.id,
          name: item.name,
          email: item.email,
          cargo: item.empresa_funcionarios?.[0]?.cargos?.nome || 'Sem cargo',
          nivel: item.empresa_funcionarios?.[0]?.cargos?.nivel || 0
        }));

        setAprovadoresDisponiveis(aprovadores);
      } catch (error) {
        console.error('Erro ao buscar aprovadores:', error);
        toast.error('Erro ao carregar aprovadores');
        setAprovadoresDisponiveis([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAprovadores();
  }, [userCompany, user?.id]);

  const adicionarAprovador = () => {
    if (!aprovadorSelecionado) {
      toast.error('Selecione um aprovador');
      return;
    }

    const aprovador = aprovadoresDisponiveis.find(a => a.id === aprovadorSelecionado);
    if (!aprovador) {
      toast.error('Aprovador não encontrado');
      return;
    }

    // Verificar se já foi adicionado
    if (aprovadoresSelecionados.some(a => a.id === aprovador.id)) {
      toast.error('Aprovador já foi adicionado');
      return;
    }

    onAprovadoresChange([...aprovadoresSelecionados, aprovador]);
    setAprovadorSelecionado('');
  };

  const removerAprovador = (id: string) => {
    onAprovadoresChange(aprovadoresSelecionados.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Selecionar Aprovadores</Label>
        <p className="text-sm text-gray-600 mb-3">
          Selecione os aprovadores da sua empresa ({userCompany || 'Carregando...'})
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select 
            value={aprovadorSelecionado} 
            onValueChange={setAprovadorSelecionado}
            disabled={loading || !userCompany}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione aprovador" />
            </SelectTrigger>
            <SelectContent>
              {aprovadoresDisponiveis.map(aprovador => (
                <SelectItem key={aprovador.id} value={aprovador.id}>
                  <div className="flex flex-col">
                    <span>{aprovador.name}</span>
                    <span className="text-xs text-gray-500">
                      {aprovador.cargo} - {aprovador.email}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            type="button"
            onClick={adicionarAprovador}
            disabled={!aprovadorSelecionado || loading}
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
          <Label>Aprovadores selecionados (ordem de aprovação):</Label>
          <div className="space-y-2">
            {aprovadoresSelecionados
              .sort((a, b) => b.nivel - a.nivel) // Ordenar por hierarquia (maior primeiro)
              .map((aprovador, index) => (
                <div key={aprovador.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{index + 1}º</Badge>
                    <div>
                      <p className="font-medium">{aprovador.name}</p>
                      <p className="text-sm text-gray-600">
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
    </div>
  );
};
