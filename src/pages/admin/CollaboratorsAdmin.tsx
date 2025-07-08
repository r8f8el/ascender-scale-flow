import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, UserCheck, UserX, Mail, Phone, Building } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

const CollaboratorsAdmin = () => {
  const { toast } = useToast();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'collaborator',
    department: '',
    phone: '',
    is_active: true
  });

  useEffect(() => {
    loadCollaborators();
  }, []);

  const loadCollaborators = async () => {
    try {
      const { data, error } = await supabase
        .from('collaborators')
        .select('*')
        .order('name');

      if (error) throw error;
      setCollaborators(data || []);
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar colaboradores.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCollaborator) {
        const { error } = await supabase
          .from('collaborators')
          .update(formData)
          .eq('id', editingCollaborator.id);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Colaborador atualizado com sucesso!"
        });
      } else {
        const { error } = await supabase
          .from('collaborators')
          .insert([formData]);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Colaborador criado com sucesso!"
        });
      }

      setIsDialogOpen(false);
      setEditingCollaborator(null);
      setFormData({
        name: '',
        email: '',
        role: 'collaborator',
        department: '',
        phone: '',
        is_active: true
      });
      loadCollaborators();
    } catch (error) {
      console.error('Erro ao salvar colaborador:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar colaborador.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (collaborator: Collaborator) => {
    setEditingCollaborator(collaborator);
    setFormData({
      name: collaborator.name,
      email: collaborator.email,
      role: collaborator.role,
      department: collaborator.department || '',
      phone: collaborator.phone || '',
      is_active: collaborator.is_active
    });
    setIsDialogOpen(true);
  };

  const toggleStatus = async (collaborator: Collaborator) => {
    try {
      const { error } = await supabase
        .from('collaborators')
        .update({ is_active: !collaborator.is_active })
        .eq('id', collaborator.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Colaborador ${!collaborator.is_active ? 'ativado' : 'desativado'} com sucesso!`
      });

      loadCollaborators();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status do colaborador.",
        variant: "destructive"
      });
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'manager': return 'Gerente';
      case 'developer': return 'Desenvolvedor';
      case 'designer': return 'Designer';
      case 'analyst': return 'Analista';
      case 'consultant': return 'Consultor';
      default: return 'Colaborador';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Carregando colaboradores...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Colaboradores</h2>
          <p className="text-muted-foreground">Gerencie a equipe e suas funções</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCollaborator(null);
              setFormData({
                name: '',
                email: '',
                role: 'collaborator',
                department: '',
                phone: '',
                is_active: true
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Colaborador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCollaborator ? 'Editar Colaborador' : 'Novo Colaborador'}</DialogTitle>
              <DialogDescription>
                Preencha as informações do colaborador
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Função</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Gerente</SelectItem>
                      <SelectItem value="developer">Desenvolvedor</SelectItem>
                      <SelectItem value="designer">Designer</SelectItem>
                      <SelectItem value="analyst">Analista</SelectItem>
                      <SelectItem value="consultant">Consultor</SelectItem>
                      <SelectItem value="collaborator">Colaborador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Ativo</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCollaborator ? 'Atualizar' : 'Criar'} Colaborador
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collaborators.map((collaborator) => (
          <Card key={collaborator.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                    {collaborator.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{collaborator.name}</CardTitle>
                    <CardDescription>{getRoleLabel(collaborator.role)}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(collaborator)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleStatus(collaborator)}
                  >
                    {collaborator.is_active ? (
                      <UserX className="h-4 w-4 text-red-500" />
                    ) : (
                      <UserCheck className="h-4 w-4 text-green-500" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={collaborator.is_active ? "default" : "secondary"}>
                    {collaborator.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{collaborator.email}</span>
                  </div>

                  {collaborator.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{collaborator.phone}</span>
                    </div>
                  )}

                  {collaborator.department && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{collaborator.department}</span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  Criado em {new Date(collaborator.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {collaborators.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <UserCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum colaborador encontrado</h3>
            <p className="text-muted-foreground text-center">
              Comece adicionando colaboradores à sua equipe
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CollaboratorsAdmin;