
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Users, 
  FileText, 
  FolderOpen, 
  Building2,
  ArrowRight,
  Star,
  Heart
} from 'lucide-react';
import { useCompanyAccess } from '@/hooks/useCompanyAccess';

interface NewMemberOnboardingProps {
  onComplete: () => void;
}

const NewMemberOnboarding: React.FC<NewMemberOnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { data: companyAccess } = useCompanyAccess();

  const steps = [
    {
      title: 'Bem-vindo à Equipe!',
      icon: <Heart className="h-8 w-8 text-red-500" />,
      content: (
        <div className="text-center space-y-4">
          <div className="text-6xl">🎉</div>
          <h3 className="text-xl font-semibold">
            Parabéns! Você faz parte da {companyAccess?.profile?.company}
          </h3>
          <p className="text-gray-600">
            Você foi convidado para se juntar à nossa equipe e agora tem acesso a todos os recursos da plataforma.
          </p>
          {companyAccess?.isTeamMember && (
            <Badge className="bg-green-100 text-green-700">
              <CheckCircle className="h-4 w-4 mr-1" />
              Membro da Equipe Confirmado
            </Badge>
          )}
        </div>
      )
    },
    {
      title: 'Conheça a Plataforma',
      icon: <Building2 className="h-8 w-8 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center mb-6">
            O que você pode fazer aqui:
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Documentos Compartilhados</h4>
                <p className="text-sm text-gray-600">Acesse e compartilhe documentos com a equipe</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="bg-green-100 p-2 rounded-lg">
                <FolderOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Projetos da Empresa</h4>
                <p className="text-sm text-gray-600">Acompanhe o progresso dos projetos em tempo real</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium">Colaboração em Equipe</h4>
                <p className="text-sm text-gray-600">Trabalhe junto com outros membros da empresa</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Sua Equipe',
      icon: <Users className="h-8 w-8 text-purple-500" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center mb-4">
            Conheça seus colegas
          </h3>
          
          {companyAccess?.companyMembers && companyAccess.companyMembers.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {companyAccess.companyMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.email}</p>
                    {member.is_primary_contact && (
                      <Badge className="text-xs mt-1 bg-blue-100 text-blue-700">
                        <Star className="h-3 w-3 mr-1" />
                        Administrador
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Carregando membros da equipe...</p>
            </div>
          )}
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {steps[currentStep].icon}
          </div>
          <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
          <div className="flex justify-center mt-4">
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === currentStep 
                      ? 'bg-primary' 
                      : index < currentStep 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {steps[currentStep].content}
          
          <div className="flex justify-between pt-6">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Anterior
            </Button>
            
            <Button onClick={nextStep}>
              {currentStep === steps.length - 1 ? 'Começar!' : 'Próximo'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewMemberOnboarding;
