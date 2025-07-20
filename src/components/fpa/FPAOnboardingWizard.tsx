
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useCreateFPAClient, useUpdateFPAClient } from '@/hooks/useFPAClients';
import { useCreateFPAPeriod } from '@/hooks/useFPAPeriods';

interface FPAOnboardingWizardProps {
  clientProfile: any;
  onComplete: () => void;
}

const FPAOnboardingWizard: React.FC<FPAOnboardingWizardProps> = ({ clientProfile, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    company_name: clientProfile?.company || '',
    industry: '',
    business_model: '',
    strategic_objectives: '',
    period_type: 'monthly',
    start_date: '',
    end_date: ''
  });

  const createFPAClient = useCreateFPAClient();
  const updateFPAClient = useUpdateFPAClient();
  const createPeriod = useCreateFPAPeriod();

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Criar cliente FP&A
      const clientData = await createFPAClient.mutateAsync({
        client_profile_id: clientProfile.id,
        company_name: formData.company_name,
        industry: formData.industry,
        business_model: formData.business_model,
        strategic_objectives: formData.strategic_objectives
      });

      // Criar período inicial
      await createPeriod.mutateAsync({
        fpa_client_id: clientData.id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        period_type: formData.period_type,
        is_actual: true
      });

      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="company_name">Nome da Empresa</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Digite o nome da sua empresa"
              />
            </div>
            <div>
              <Label htmlFor="industry">Setor</Label>
              <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Tecnologia</SelectItem>
                  <SelectItem value="retail">Varejo</SelectItem>
                  <SelectItem value="manufacturing">Manufatura</SelectItem>
                  <SelectItem value="services">Serviços</SelectItem>
                  <SelectItem value="finance">Financeiro</SelectItem>
                  <SelectItem value="healthcare">Saúde</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="business_model">Modelo de Negócio</Label>
              <Select value={formData.business_model} onValueChange={(value) => setFormData({ ...formData, business_model: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o modelo de negócio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="b2b">B2B</SelectItem>
                  <SelectItem value="b2c">B2C</SelectItem>
                  <SelectItem value="b2b2c">B2B2C</SelectItem>
                  <SelectItem value="marketplace">Marketplace</SelectItem>
                  <SelectItem value="subscription">Assinatura</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="strategic_objectives">Objetivos Estratégicos</Label>
              <Textarea
                id="strategic_objectives"
                value={formData.strategic_objectives}
                onChange={(e) => setFormData({ ...formData, strategic_objectives: e.target.value })}
                placeholder="Descreva os principais objetivos estratégicos da sua empresa"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="period_type">Tipo de Período</Label>
              <Select value={formData.period_type} onValueChange={(value) => setFormData({ ...formData, period_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="start_date">Data de Início</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="end_date">Data de Fim</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
            <div className="text-center py-4">
              <Check className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-gray-600">
                Pronto para começar! Clique em "Finalizar" para concluir o onboarding.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Configuração Inicial FP&A</CardTitle>
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-gray-600">Passo {currentStep} de {totalSteps}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {renderStep()}
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            
            {currentStep === totalSteps ? (
              <Button
                onClick={handleComplete}
                disabled={createFPAClient.isPending || createPeriod.isPending}
              >
                Finalizar
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FPAOnboardingWizard;
