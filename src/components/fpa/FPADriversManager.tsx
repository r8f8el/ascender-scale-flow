
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useFPAClients } from '@/hooks/useFPAClients';
import { 
  TrendingUp, 
  Calculator, 
  Plus, 
  Edit, 
  Trash2,
  Settings,
  BarChart3,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

interface Driver {
  id: string;
  name: string;
  description: string;
  driver_type: string;
  unit: string;
  formula?: string;
  is_active: boolean;
}

const FPADriversManager: React.FC<{ clientId: string }> = ({ clientId }) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const driverTypes = [
    { value: 'revenue', label: 'Receita', icon: TrendingUp },
    { value: 'cost', label: 'Custo', icon: Calculator },
    { value: 'operational', label: 'Operacional', icon: Settings },
    { value: 'headcount', label: 'Recursos Humanos', icon: Target },
    { value: 'market', label: 'Mercado', icon: BarChart3 }
  ];

  const commonDrivers = {
    revenue: [
      { name: 'Número de Clientes', unit: 'unidades' },
      { name: 'Ticket Médio', unit: 'R$' },
      { name: 'Vendedores Ativos', unit: 'pessoas' },
      { name: 'Taxa de Conversão', unit: '%' }
    ],
    cost: [
      { name: 'Custo por Funcionário', unit: 'R$/mês' },
      { name: 'Custo de Marketing', unit: '% receita' },
      { name: 'Custo de Aquisição (CAC)', unit: 'R$' },
      { name: 'Margem Bruta', unit: '%' }
    ],
    operational: [
      { name: 'Produtividade por Funcionário', unit: 'R$/pessoa' },
      { name: 'Tempo de Ciclo', unit: 'dias' },
      { name: 'Taxa de Retenção', unit: '%' },
      { name: 'NPS Score', unit: 'pontos' }
    ]
  };

  const handleSaveDriver = (driverData: any) => {
    if (editingDriver) {
      setDrivers(prev => prev.map(d => d.id === editingDriver.id ? { ...d, ...driverData } : d));
      toast.success('Direcionador atualizado com sucesso');
    } else {
      const newDriver = {
        id: Date.now().toString(),
        ...driverData,
        is_active: true
      };
      setDrivers(prev => [...prev, newDriver]);
      toast.success('Direcionador criado com sucesso');
    }
    
    setShowForm(false);
    setEditingDriver(null);
  };

  const getDriverTypeIcon = (type: string) => {
    const driverType = driverTypes.find(dt => dt.value === type);
    const Icon = driverType?.icon || Calculator;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Direcionadores de Negócio</h3>
          <p className="text-gray-600">Configure os principais drivers que impactam seus resultados</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Direcionador
        </Button>
      </div>

      {/* Driver Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {driverTypes.map(type => {
          const typeDrivers = drivers.filter(d => d.driver_type === type.value);
          const Icon = type.icon;
          
          return (
            <Card key={type.value}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{type.label}</CardTitle>
                  <Badge variant="secondary">{typeDrivers.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {typeDrivers.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nenhum direcionador configurado</p>
                ) : (
                  <div className="space-y-2">
                    {typeDrivers.slice(0, 3).map(driver => (
                      <div key={driver.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-sm">{driver.name}</p>
                          <p className="text-xs text-gray-500">{driver.unit}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditingDriver(driver);
                              setShowForm(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {typeDrivers.length > 3 && (
                      <p className="text-xs text-gray-500">+{typeDrivers.length - 3} mais...</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Rápido</CardTitle>
          <p className="text-sm text-gray-600">
            Adicione direcionadores comuns baseados no seu tipo de negócio
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(commonDrivers).map(([category, items]) => (
              <div key={category} className="space-y-2">
                <h4 className="font-medium text-gray-900 capitalize">{category}</h4>
                {items.map(item => (
                  <Button
                    key={item.name}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      const newDriver = {
                        name: item.name,
                        description: `Direcionador de ${category}`,
                        driver_type: category,
                        unit: item.unit,
                        formula: ''
                      };
                      handleSaveDriver(newDriver);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    {item.name}
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Driver Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">
              {editingDriver ? 'Editar Direcionador' : 'Novo Direcionador'}
            </h3>
            
            <DriverForm
              driver={editingDriver}
              driverTypes={driverTypes}
              onSave={handleSaveDriver}
              onCancel={() => {
                setShowForm(false);
                setEditingDriver(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const DriverForm: React.FC<{
  driver?: Driver | null;
  driverTypes: any[];
  onSave: (data: any) => void;
  onCancel: () => void;
}> = ({ driver, driverTypes, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: driver?.name || '',
    description: driver?.description || '',
    driver_type: driver?.driver_type || '',
    unit: driver?.unit || '',
    formula: driver?.formula || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome do Direcionador</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ex: Número de Clientes"
          required
        />
      </div>

      <div>
        <Label htmlFor="type">Tipo</Label>
        <Select value={formData.driver_type} onValueChange={(value) => setFormData(prev => ({ ...prev, driver_type: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            {driverTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="unit">Unidade</Label>
        <Input
          id="unit"
          value={formData.unit}
          onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
          placeholder="Ex: unidades, R$, %"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Descreva como este direcionador impacta o negócio"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="formula">Fórmula (opcional)</Label>
        <Textarea
          id="formula"
          value={formData.formula}
          onChange={(e) => setFormData(prev => ({ ...prev, formula: e.target.value }))}
          placeholder="Ex: receita_mensal / numero_clientes"
          rows={2}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {driver ? 'Atualizar' : 'Criar'} Direcionador
        </Button>
      </div>
    </form>
  );
};

export default FPADriversManager;
