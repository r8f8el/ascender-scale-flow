import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Collaborator, CollaboratorFormData } from '@/types/collaborator';
import { useCollaborators } from '@/hooks/useCollaborators';
import { CollaboratorCard } from '@/components/admin/CollaboratorCard';
import { CollaboratorForm } from '@/components/admin/CollaboratorForm';
import { EmptyCollaboratorState } from '@/components/admin/EmptyCollaboratorState';

const CollaboratorsAdmin = () => {
  const { collaborators, isLoading, saveCollaborator, toggleCollaboratorStatus } = useCollaborators();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);

  const [formData, setFormData] = useState<CollaboratorFormData>({
    name: '',
    email: '',
    role: 'collaborator',
    department: '',
    phone: '',
    is_active: true
  });

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
          <p className="text-muted-foreground">Gerencie a equipe e suas funções</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collaborators.map((collaborator) => (
          <CollaboratorCard
            key={collaborator.id}
            collaborator={collaborator}
            onEdit={handleEdit}
            onToggleStatus={toggleCollaboratorStatus}
          />
        ))}
      </div>

      {collaborators.length === 0 && <EmptyCollaboratorState />}

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