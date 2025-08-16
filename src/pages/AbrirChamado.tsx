
import React, { useState, useCallback } from 'react';
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
    updateField,
    updateSelectField,
    setFiles,
    submitTicket
  } = useTicketForm();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submitTicket();
    if (success) {
      navigate('/');
    }
  }, [submitTicket, navigate]);

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
              formData={formData}
              files={files}
              isLoading={isLoading}
              categories={categories}
              priorities={priorities}
              onInputChange={updateField}
              onSelectChange={updateSelectField}
              onFileChange={setFiles}
              onSubmit={handleSubmit}
            />
          </div>
        </div>

        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default AbrirChamado;
