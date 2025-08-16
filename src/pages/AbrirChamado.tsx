
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTicketForm } from '@/hooks/useTicketForm';
import { ModernTicketForm } from '@/components/ticket/ModernTicketForm';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';

const AbrirChamado = () => {
  const navigate = useNavigate();
  const {
    formData,
    files,
    isLoading,
    categories,
    priorities,
    loadFormData,
    handleInputChange,
    handleSelectChange,
    handleFileChange,
    handleSubmit
  } = useTicketForm();

  // Load form data on component mount
  useEffect(() => {
    loadFormData();
  }, []);

  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleSubmit(e);
    // The handleSubmit from the hook already handles navigation
  }, [handleSubmit]);

  // Transform formData to match ModernTicketForm expectations
  const transformedFormData = {
    name: formData.user_name,
    email: formData.user_email,
    phone: formData.user_phone,
    title: formData.title,
    description: formData.description,
    category_id: formData.category_id,
    priority_id: formData.priority_id
  };

  // Handle input changes and transform back to hook format
  const handleInputUpdate = (field: string, value: string) => {
    const fieldMap: { [key: string]: string } = {
      name: 'user_name',
      email: 'user_email',
      phone: 'user_phone',
      title: 'title',
      description: 'description'
    };

    const mappedField = fieldMap[field] || field;
    const syntheticEvent = {
      target: {
        name: mappedField,
        value: value
      }
    } as React.ChangeEvent<HTMLInputElement>;

    handleInputChange(syntheticEvent);
  };

  const handleSelectUpdate = (field: string, value: string) => {
    handleSelectChange(field, value);
  };

  const handleFilesUpdate = (newFiles: File[]) => {
    const syntheticEvent = {
      target: {
        files: newFiles
      }
    } as React.ChangeEvent<HTMLInputElement>;

    handleFileChange(syntheticEvent);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link to="/">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Headphones className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Abrir Chamado</h1>
                    <p className="text-muted-foreground">
                      Relate seu problema e nossa equipe entrará em contato
                    </p>
                  </div>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <ModernTicketForm
              formData={transformedFormData}
              files={files}
              isLoading={isLoading}
              categories={categories}
              priorities={priorities}
              onInputChange={handleInputUpdate}
              onSelectChange={handleSelectUpdate}
              onFileChange={handleFilesUpdate}
              onSubmit={onSubmit}
            />
          </div>
        </div>

        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default AbrirChamado;
