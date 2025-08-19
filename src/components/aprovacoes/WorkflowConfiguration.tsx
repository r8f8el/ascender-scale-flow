
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Plus, 
  Trash2, 
  ArrowRight, 
  User,
  DollarSign,
  Clock
} from 'lucide-react';

interface WorkflowLevel {
  id: string;
  name: string;
  minValue: number;
  maxValue: number;
  slaHours: number;
  autoEscalation: boolean;
}

export const WorkflowConfiguration = () => {
  const [workflowLevels, setWorkflowLevels] = useState<WorkflowLevel[]>([
    {
      id: '1',
      name: 'Gerente de Área',
      minValue: 0,
      maxValue: 50000,
      slaHours: 48,
      autoEscalation: true
    },
    {
      id: '2',
      name: 'Diretor Executivo',
      minValue: 50001,
      maxValue: 500000,
      slaHours: 72,
      autoEscalation: true
    },
    {
      id: '3',
      name: 'CFO',
      minValue: 500001,
      maxValue: 999999999,
      slaHours: 120,
      autoEscalation: false
    }
  ]);

  const [newLevel, setNewLevel] = useState({
    name: '',
    minValue: 0,
    maxValue: 0,
    slaHours: 24,
    autoEscalation: true
  });

  const addWorkflowLevel = () => {
    if (!newLevel.name || newLevel.maxValue <= 0) return;
    
    const level: WorkflowLevel = {
      id: Date.now().toString(),
      ...newLevel
    };
    
    setWorkflowLevels([...workflowLevels, level]);
    setNewLevel({
      name: '',
      minValue: 0,
      maxValue: 0,
      slaHours: 24,
      autoEscalation: true
    });
  };

  const removeLevel = (id: string) => {
    setWorkflowLevels(workflowLevels.filter(level => level.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Designer Visual do Fluxo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Designer de Fluxo de Aprovação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="flex items-center gap-4">
              {/* Solicitante */}
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <span className="text-sm font-medium">Solicitante</span>
              </div>

              <ArrowRight className="h-6 w-6 text-gray-400" />

              {/* Níveis de Aprovação */}
              {workflowLevels.map((level, index) => (
                <React.Fragment key={level.id}>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                      <User className="h-8 w-8 text-green-600" />
                    </div>
                    <span className="text-xs font-medium">{level.name}</span>
                    <div className="text-xs text-muted-foreground mt-1">
                      {level.slaHours}h SLA
                    </div>
                  </div>
                  {index < workflowLevels.length - 1 && (
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  )}
                </React.Fragment>
              ))}

              <ArrowRight className="h-6 w-6 text-gray-400" />

              {/* Aprovado */}
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center mb-2">
                  <Badge className="bg-emerald-500">✓</Badge>
                </div>
                <span className="text-sm font-medium">Aprovado</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações por Nível */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações por Nível</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {workflowLevels.map((level, index) => (
            <div key={level.id} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">Nível {index + 1}</Badge>
                  <h3 className="font-semibold">{level.name}</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeLevel(level.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span>
                    Alçada: R$ {level.minValue.toLocaleString()} - R$ {level.maxValue.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>SLA: {level.slaHours} horas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-purple-600" />
                  <span>
                    Escalação: {level.autoEscalation ? 'Automática' : 'Manual'}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Adicionar Novo Nível */}
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <h4 className="font-medium mb-4">Adicionar Novo Nível</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="levelName">Nome do Nível</Label>
                <Input
                  id="levelName"
                  value={newLevel.name}
                  onChange={(e) => setNewLevel({...newLevel, name: e.target.value})}
                  placeholder="Ex: Diretor"
                />
              </div>
              <div>
                <Label htmlFor="minValue">Valor Mínimo (R$)</Label>
                <Input
                  id="minValue"
                  type="number"
                  value={newLevel.minValue}
                  onChange={(e) => setNewLevel({...newLevel, minValue: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="maxValue">Valor Máximo (R$)</Label>
                <Input
                  id="maxValue"
                  type="number"
                  value={newLevel.maxValue}
                  onChange={(e) => setNewLevel({...newLevel, maxValue: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="slaHours">SLA (horas)</Label>
                <Input
                  id="slaHours"
                  type="number"
                  value={newLevel.slaHours}
                  onChange={(e) => setNewLevel({...newLevel, slaHours: Number(e.target.value)})}
                />
              </div>
            </div>
            <Button onClick={addWorkflowLevel}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Nível
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">
          Cancelar Alterações
        </Button>
        <Button>
          Salvar Configuração
        </Button>
      </div>
    </div>
  );
};
