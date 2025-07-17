
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Building, 
  User, 
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useFPAClients, useCreateFPAClient } from '@/hooks/useFPAClients';
import { useToast } from '@/components/ui/use-toast';

interface FPAClientManagerProps {
  onClientSelect?: (clientId: string) => void;
  selectedClientId?: string;
}

const FPAClientManager: React.FC<FPAClientManagerProps> = ({ 
  onClientSelect, 
  selectedClientId 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    industry: '',
    business_model: '',
    strategic_objectives: '',
    client_profile_id: ''
  });

  const { data: clients = [], isLoading } = useFPAClients();
  const createClient = useCreateFPAClient();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company_name) {
      toast({
        title: "Erro",
        description: "Nome da empresa é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      await createClient.mutateAsync(formData);
      toast({
        title: "Sucesso",
        description: "Cliente FP&A criado com sucesso"
      });
      setShowForm(false);
      setFormData({
        company_name: '',
        industry: '',
        business_model: '',
        strategic_objectives: '',
        client_profile_id: ''
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao criar cliente FP&A",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (client: any) => {
    if (client.onboarding_completed) {
      return <Badge className="bg-green-100 text-green-700">Ativo</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-700">Onboarding</Badge>;
  };

  const getPhaseInfo = (phase: number) => {
    switch (phase) {
      case 1: return { name: 'Diagnóstico', color: 'text-blue-600' };
      case 2: return { name: 'Modelagem', color: 'text-purple-600' };
      case 3: return { name: 'Implementação', color: 'text-orange-600' };
      case 4: return { name: 'Monitoramento', color: 'text-green-600' };
      default: return { name: 'Indefinido', color: 'text-gray-600' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Clientes FP&A</CardTitle>
          <Button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Novo Cliente FP&A</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company_name">Nome da Empresa *</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                      placeholder="Ex: TechCorp Ltda"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">Setor</Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => setFormData({...formData, industry: e.target.value})}
                      placeholder="Ex: Tecnologia"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="business_model">Modelo de Negócio</Label>
                  <Input
                    id="business_model"
                    value={formData.business_model}
                    onChange={(e) => setFormData({...formData, business_model: e.target.value})}
                    placeholder="Ex: SaaS, E-commerce, Consultoria"
                  />
                </div>
                
                <div>
                  <Label htmlFor="strategic_objectives">Objetivos Estratégicos</Label>
                  <Textarea
                    id="strategic_objectives"
                    value={formData.strategic_objectives}
                    onChange={(e) => setFormData({...formData, strategic_objectives: e.target.value})}
                    placeholder="Descreva os principais objetivos estratégicos..."
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" disabled={createClient.isPending}>
                    {createClient.isPending ? 'Criando...' : 'Criar Cliente'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {clients.length === 0 ? (
          <div className="text-center py-8">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum cliente FP&A cadastrado
            </h3>
            <p className="text-gray-600 mb-4">
              Comece criando seu primeiro cliente FP&A
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Cliente
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {clients.map((client) => {
              const phase = getPhaseInfo(client.current_phase);
              const isSelected = selectedClientId === client.id;
              
              return (
                <Card 
                  key={client.id} 
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                  }`}
                  onClick={() => onClientSelect?.(client.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <Building className="h-5 w-5 text-gray-500" />
                        <div>
                          <h4 className="font-semibold text-gray-900">{client.company_name}</h4>
                          <p className="text-sm text-gray-600">{client.industry || 'Setor não definido'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(client)}
                        <Badge variant="outline" className={phase.color}>
                          Fase {client.current_phase}: {phase.name}
                        </Badge>
                      </div>
                    </div>
                    
                    {client.client_profile && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <User className="h-4 w-4" />
                        <span>{client.client_profile.name}</span>
                        <Mail className="h-4 w-4 ml-2" />
                        <span>{client.client_profile.email}</span>
                      </div>
                    )}
                    
                    {client.business_model && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Modelo:</strong> {client.business_model}
                      </p>
                    )}
                    
                    {client.strategic_objectives && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        <strong>Objetivos:</strong> {client.strategic_objectives}
                      </p>
                    )}
                    
                    <div className="flex justify-between items-center mt-3 pt-3 border-t">
                      <span className="text-xs text-gray-500">
                        Criado em {new Date(client.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FPAClientManager;
