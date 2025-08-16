
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSecureValidation } from '@/hooks/useSecureValidation';
import { useRateLimit } from '@/hooks/useRateLimit';
import { useSecureFileUpload } from '@/hooks/useSecureFileUpload';
import { SecureFileUpload } from './SecureFileUpload';
import { toast } from 'sonner';

interface SecureApprovalFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const SecureApprovalForm: React.FC<SecureApprovalFormProps> = ({
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tipo_solicitacao: '',
    periodo_referencia: '',
    valor_solicitado: '',
    justificativa: '',
    prioridade: 'Media' as const
  });

  const [files, setFiles] = useState<File[]>([]);
  const { validateForm, errors, clearErrors } = useSecureValidation();
  const { checkRateLimit } = useRateLimit();
  const { uploadFile, uploading } = useSecureFileUpload();

  const validationRules = [
    {
      field: 'titulo',
      validator: (value: string) => value.length >= 3 && value.length <= 200,
      message: 'Título deve ter entre 3 e 200 caracteres'
    },
    {
      field: 'descricao',
      validator: (value: string) => value.length <= 2000,
      message: 'Descrição deve ter no máximo 2000 caracteres'
    },
    {
      field: 'valor_solicitado',
      validator: (value: string) => {
        if (!value) return true; // Optional field
        const num = parseFloat(value.replace(',', '.'));
        return !isNaN(num) && num >= 0;
      },
      message: 'Valor deve ser um número válido'
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      clearErrors();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check rate limit for approval requests
    const allowed = await checkRateLimit({
      action: 'create_approval_request',
      maxAttempts: 10,
      windowMinutes: 60
    });

    if (!allowed) return;

    // Validate form
    const isValid = validateForm(
      formData,
      validationRules,
      {
        required: ['titulo', 'descricao', 'tipo_solicitacao', 'periodo_referencia'],
        maxLength: {
          titulo: 200,
          descricao: 2000,
          justificativa: 1000
        },
        sanitize: true
      }
    );

    if (!isValid) return;

    try {
      let uploadedFiles: any[] = [];

      // Upload files securely if any
      if (files.length > 0) {
        for (const file of files) {
          try {
            const result = await uploadFile(file, {
              bucket: 'documents',
              folder: 'aprovacoes',
              maxSizeBytes: 50 * 1024 * 1024, // 50MB
              allowedTypes: [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'image/jpeg',
                'image/png'
              ]
            });
            uploadedFiles.push(result);
          } catch (error: any) {
            toast.error(`Erro no upload do arquivo ${file.name}: ${error.message}`);
            return;
          }
        }
      }

      // Submit form with uploaded files
      await onSubmit({
        ...formData,
        anexos: uploadedFiles
      });

      // Reset form on success
      setFormData({
        titulo: '',
        descricao: '',
        tipo_solicitacao: '',
        periodo_referencia: '',
        valor_solicitado: '',
        justificativa: '',
        prioridade: 'Media'
      });
      setFiles([]);
      clearErrors();

    } catch (error: any) {
      toast.error('Erro ao criar solicitação: ' + error.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Solicitação de Aprovação</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => handleInputChange('titulo', e.target.value)}
                placeholder="Título da solicitação"
                className={errors.titulo ? 'border-destructive' : ''}
                maxLength={200}
              />
              {errors.titulo && (
                <p className="text-sm text-destructive mt-1">{errors.titulo}</p>
              )}
            </div>

            <div>
              <Label htmlFor="prioridade">Prioridade *</Label>
              <Select 
                value={formData.prioridade} 
                onValueChange={(value) => handleInputChange('prioridade', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                  <SelectItem value="Media">Média</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo_solicitacao">Tipo de Solicitação *</Label>
              <Input
                id="tipo_solicitacao"
                value={formData.tipo_solicitacao}
                onChange={(e) => handleInputChange('tipo_solicitacao', e.target.value)}
                placeholder="Ex: Compra, Contratação, Investimento"
              />
            </div>

            <div>
              <Label htmlFor="periodo_referencia">Período de Referência *</Label>
              <Input
                id="periodo_referencia"
                value={formData.periodo_referencia}
                onChange={(e) => handleInputChange('periodo_referencia', e.target.value)}
                placeholder="Ex: Janeiro 2024, Q1 2024"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              placeholder="Descreva detalhadamente a solicitação"
              rows={4}
              className={errors.descricao ? 'border-destructive' : ''}
              maxLength={2000}
            />
            {errors.descricao && (
              <p className="text-sm text-destructive mt-1">{errors.descricao}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {formData.descricao.length}/2000 caracteres
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valor_solicitado">Valor Solicitado (opcional)</Label>
              <Input
                id="valor_solicitado"
                value={formData.valor_solicitado}
                onChange={(e) => handleInputChange('valor_solicitado', e.target.value)}
                placeholder="Ex: 10000.00"
                type="text"
                className={errors.valor_solicitado ? 'border-destructive' : ''}
              />
              {errors.valor_solicitado && (
                <p className="text-sm text-destructive mt-1">{errors.valor_solicitado}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="justificativa">Justificativa (opcional)</Label>
            <Textarea
              id="justificativa"
              value={formData.justificativa}
              onChange={(e) => handleInputChange('justificativa', e.target.value)}
              placeholder="Justifique a necessidade desta solicitação"
              rows={3}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.justificativa.length}/1000 caracteres
            </p>
          </div>

          <SecureFileUpload
            files={files}
            onFilesChange={setFiles}
            maxFiles={5}
            maxSizeBytes={50 * 1024 * 1024}
            allowedTypes={[
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/vnd.ms-excel',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'image/jpeg',
              'image/png'
            ]}
          />

          <div className="flex justify-end space-x-3">
            <Button
              type="submit"
              disabled={isLoading || uploading}
              className="min-w-[120px]"
            >
              {isLoading || uploading ? 'Enviando...' : 'Criar Solicitação'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
