
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Collaborator, CollaboratorFormData } from '@/types/collaborator';
import { useCollaborators } from '@/hooks/useCollaborators';
import { CollaboratorCard } from '@/components/admin/CollaboratorCard';
import { CollaboratorForm } from '@/components/admin/CollaboratorForm';
import { EmptyCollaboratorState } from '@/components/admin/EmptyCollaboratorState';
import { useToast } from '@/hooks/use-toast';

const CollaboratorsAdmin = () => {
  const { collaborators, isLoading, saveCollaborator, toggleCollaboratorStatus } = useCollaborators();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<CollaboratorFormData>({
    name: '',
    email: '',
    role: 'collaborator',
    department: '',
    phone: '',
    is_active: true
  });

  // Filtrar apenas colaboradores @ascalate.com.br
  const ascalateCollaborators = collaborators.filter(collaborator => 
    collaborator.email.endsWith('@ascalate.com.br')
  );

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'collaborator',
      department: '',
      phone: '',
      is_active: true
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar email @ascalate.com.br
    if (!formData.email.endsWith('@ascalate.com.br')) {
      toast({
        title: "Email inválido",
        description: "Apenas emails @ascalate.com.br são permitidos para colaboradores.",
        variant: "destructive"
      });
      return;
    }

    const success = await saveCollaborator(formData, editingCollaborator);
    if (success) {
      setIsDialogOpen(false);
      setEditingCollaborator(null);
      resetForm();
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

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCollaborator(null);
    resetForm();
  };

  const handleNewCollaborator = () => {
    setEditingCollaborator(null);
    resetForm();
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Carregando colaboradores...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Colaboradores</h2>
          <p className="text-muted-foreground">
            Gerencie a equipe Ascalate (@ascalate.com.br) e suas funções
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewCollaborator}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Colaborador
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {ascalateCollaborators.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-sm text-blue-700 font-medium">
              Colaboradores Ascalate ({ascalateCollaborators.length} encontrados)
            </p>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Apenas colaboradores com email @ascalate.com.br podem ser atribuídos a tarefas e chamados.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ascalateCollaborators.map((collaborator) => (
          <CollaboratorCard
            key={collaborator.id}
            collaborator={collaborator}
            onEdit={handleEdit}
            onToggleStatus={toggleCollaboratorStatus}
          />
        ))}
      </div>

      {ascalateCollaborators.length === 0 && <EmptyCollaboratorState />}

      <CollaboratorForm
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editingCollaborator={editingCollaborator}
      />
    </div>
  );
};

export default CollaboratorsAdmin;
