
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TicketFormHeader } from '@/components/ticket/TicketFormHeader';
import { PersonalInfoForm } from '@/components/ticket/PersonalInfoForm';
import { TicketDetailsForm } from '@/components/ticket/TicketDetailsForm';
import { CategoryPriorityForm } from '@/components/ticket/CategoryPriorityForm';
import { FileUploadForm } from '@/components/ticket/FileUploadForm';
import { useTicketForm } from '@/hooks/useTicketForm';

const AbrirChamado = () => {
  const {
    formData,
    file,
    isLoading,
    categories,
    priorities,
    loadFormData,
    handleInputChange,
    handleSelectChange,
    handleFileChange,
    handleSubmit
  } = useTicketForm();

  React.useEffect(() => {
    loadFormData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-8">
        <TicketFormHeader />

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#003366]">Dados do Chamado</CardTitle>
              <CardDescription>
                Preencha todas as informações para que possamos ajudá-lo da melhor forma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <PersonalInfoForm 
                  formData={formData}
                  onInputChange={handleInputChange}
                />

                <TicketDetailsForm 
                  formData={formData}
                  onInputChange={handleInputChange}
                />

                <CategoryPriorityForm 
                  categories={categories}
                  priorities={priorities}
                  onSelectChange={handleSelectChange}
                />

                <FileUploadForm 
                  file={file}
                  onFileChange={handleFileChange}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-[#f07c00] hover:bg-[#e56b00] text-white text-lg py-3"
                  disabled={isLoading}
                >
                  {isLoading ? 'Criando Chamado...' : 'Abrir Chamado'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AbrirChamado;
