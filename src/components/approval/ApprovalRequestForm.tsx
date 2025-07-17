
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, DollarSign, FileText, AlertTriangle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { CreateApprovalRequestData, ApprovalFlowType, PriorityLevel } from '@/types/approval';

interface ApprovalRequestFormProps {
  flowTypes: ApprovalFlowType[];
  onSubmit: (data: CreateApprovalRequestData) => Promise<boolean>;
  loading: boolean;
}

export const ApprovalRequestForm: React.FC<ApprovalRequestFormProps> = ({
  flowTypes,
  onSubmit,
  loading,
}) => {
  const [selectedFlowType, setSelectedFlowType] = useState<ApprovalFlowType | null>(null);
  const [dueDate, setDueDate] = useState<Date>();
  
  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<CreateApprovalRequestData>();

  const flowTypeId = watch('flow_type_id');

  // Atualizar tipo de fluxo selecionado
  React.useEffect(() => {
    if (flowTypeId) {
      const flowType = flowTypes.find(ft => ft.id === flowTypeId);
      setSelectedFlowType(flowType || null);
    }
  }, [flowTypeId, flowTypes]);

  const onFormSubmit = async (data: CreateApprovalRequestData) => {
    const success = await onSubmit({
      ...data,
      due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined,
    });
    
    if (success) {
      reset();
      setSelectedFlowType(null);
      setDueDate(undefined);
    }
  };

  const requiredFields = selectedFlowType?.required_fields || {};

  const priorityOptions: { value: PriorityLevel; label: string; color: string }[] = [
    { value: 'low', label: 'Baixa', color: 'bg-gray-100 text-gray-700' },
    { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-700' },
    { value: 'high', label: 'Alta', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'urgent', label: 'Urgente', color: 'bg-red-100 text-red-700' },
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Nova Solicitação de Aprovação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Tipo de Fluxo */}
          <div className="space-y-2">
            <Label htmlFor="flow_type_id">Tipo de Solicitação *</Label>
            <Select onValueChange={(value) => setValue('flow_type_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de solicitação" />
              </SelectTrigger>
              <SelectContent>
                {flowTypes.map((flowType) => (
                  <SelectItem key={flowType.id} value={flowType.id}>
                    <div>
                      <div className="font-medium">{flowType.name}</div>
                      {flowType.description && (
                        <div className="text-sm text-gray-500">{flowType.description}</div>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.flow_type_id && (
              <p className="text-sm text-red-600">Tipo de solicitação é obrigatório</p>
            )}
          </div>

          {selectedFlowType && (
            <>
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    {...register('title', { required: 'Título é obrigatório' })}
                    placeholder="Digite um título descritivo"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select onValueChange={(value) => setValue('priority', value as PriorityLevel)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <Badge className={option.color}>{option.label}</Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Descreva detalhadamente sua solicitação"
                  rows={3}
                />
              </div>

              {/* Campos Condicionais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requiredFields.amount && (
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Valor *
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      {...register('amount', { 
                        required: 'Valor é obrigatório',
                        min: { value: 0, message: 'Valor deve ser positivo' }
                      })}
                      placeholder="0,00"
                    />
                    {errors.amount && (
                      <p className="text-sm text-red-600">{errors.amount.message}</p>
                    )}
                  </div>
                )}

                {requiredFields.department && (
                  <div className="space-y-2">
                    <Label htmlFor="department">Departamento *</Label>
                    <Input
                      id="department"
                      {...register('department', { required: 'Departamento é obrigatório' })}
                      placeholder="Departamento solicitante"
                    />
                    {errors.department && (
                      <p className="text-sm text-red-600">{errors.department.message}</p>
                    )}
                  </div>
                )}

                {requiredFields.cost_center && (
                  <div className="space-y-2">
                    <Label htmlFor="cost_center">Centro de Custo *</Label>
                    <Input
                      id="cost_center"
                      {...register('cost_center', { required: 'Centro de custo é obrigatório' })}
                      placeholder="Código do centro de custo"
                    />
                    {errors.cost_center && (
                      <p className="text-sm text-red-600">{errors.cost_center.message}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Prazo</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, 'PPP', { locale: ptBR }) : 'Selecionar data'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        disabled={(date) => date < new Date()}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Justificativas */}
              {requiredFields.business_justification && (
                <div className="space-y-2">
                  <Label htmlFor="business_justification">Justificativa de Negócio *</Label>
                  <Textarea
                    id="business_justification"
                    {...register('business_justification', { 
                      required: 'Justificativa de negócio é obrigatória' 
                    })}
                    placeholder="Explique a justificativa de negócio para esta solicitação"
                    rows={3}
                  />
                  {errors.business_justification && (
                    <p className="text-sm text-red-600">{errors.business_justification.message}</p>
                  )}
                </div>
              )}

              {requiredFields.expected_outcome && (
                <div className="space-y-2">
                  <Label htmlFor="expected_outcome">Resultado Esperado *</Label>
                  <Textarea
                    id="expected_outcome"
                    {...register('expected_outcome', { 
                      required: 'Resultado esperado é obrigatório' 
                    })}
                    placeholder="Descreva os resultados esperados"
                    rows={3}
                  />
                  {errors.expected_outcome && (
                    <p className="text-sm text-red-600">{errors.expected_outcome.message}</p>
                  )}
                </div>
              )}

              {requiredFields.risk_assessment && (
                <div className="space-y-2">
                  <Label htmlFor="risk_assessment" className="flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    Avaliação de Riscos *
                  </Label>
                  <Textarea
                    id="risk_assessment"
                    {...register('risk_assessment', { 
                      required: 'Avaliação de riscos é obrigatória' 
                    })}
                    placeholder="Identifique e avalie os riscos associados"
                    rows={3}
                  />
                  {errors.risk_assessment && (
                    <p className="text-sm text-red-600">{errors.risk_assessment.message}</p>
                  )}
                </div>
              )}

              {/* Botão de Envio */}
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    reset();
                    setSelectedFlowType(null);
                    setDueDate(undefined);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Enviando...' : 'Criar Solicitação'}
                </Button>
              </div>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
