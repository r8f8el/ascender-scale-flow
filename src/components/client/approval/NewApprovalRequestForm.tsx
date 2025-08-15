import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const formSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  reference_period: z.string().min(1, 'Período de referência é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  flow_type_id: z.string().min(1, 'Tipo de fluxo é obrigatório'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  amount: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export const NewApprovalRequestForm = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  // Fetch available flow types
  const { data: flowTypes = [] } = useQuery({
    queryKey: ['approval-flow-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('approval_flow_types')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch user profile
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!user || !userProfile) throw new Error('Usuário não encontrado');

      // Get flow steps to determine total steps
      const { data: steps, error: stepsError } = await supabase
        .from('approval_steps')
        .select('*')
        .eq('flow_type_id', data.flow_type_id)
        .order('step_order');

      if (stepsError) throw stepsError;

      // Create the approval request
      const requestData = {
        title: data.title,
        description: `**Período de Referência:** ${data.reference_period}\n\n${data.description}`,
        flow_type_id: data.flow_type_id,
        requested_by_user_id: user.id,
        requested_by_email: userProfile.email,
        requested_by_name: userProfile.name,
        priority: data.priority,
        amount: data.amount ? parseFloat(data.amount) : null,
        total_steps: steps.length,
        current_step: 1,
        status: 'pending',
      };

      const { data: request, error: requestError } = await supabase
        .from('approval_requests')
        .insert([requestData])
        .select()
        .single();

      if (requestError) throw requestError;

      // Upload attachments
      if (attachments.length > 0) {
        const uploadPromises = attachments.map(async (file) => {
          const fileName = `${request.id}/${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          // Save attachment metadata
          const { error: attachmentError } = await supabase
            .from('approval_attachments')
            .insert([{
              request_id: request.id,
              filename: file.name,
              file_path: fileName,
              content_type: file.type,
              file_size: file.size,
              uploaded_by_user_id: user.id,
              uploaded_by_name: userProfile.name,
            }]);

          if (attachmentError) throw attachmentError;
        });

        await Promise.all(uploadPromises);
      }

      // Send notification to first approver
      if (steps.length > 0) {
        const firstStep = steps[0];
        await supabase.functions.invoke('send-notification', {
          body: {
            notificationId: crypto.randomUUID(),
            recipientEmail: firstStep.approver_email,
            subject: `Nova solicitação de aprovação: ${data.title}`,
            message: `Uma nova solicitação "${data.title}" aguarda sua aprovação.`,
            type: 'approval_request',
          },
        });
      }

      return request;
    },
    onSuccess: () => {
      toast.success('Solicitação criada com sucesso!');
      reset();
      setAttachments([]);
      queryClient.invalidateQueries({ queryKey: ['my-approval-requests'] });
    },
    onError: (error: any) => {
      toast.error('Erro ao criar solicitação: ' + error.message);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
      ];
      return validTypes.includes(file.type);
    });

    if (validFiles.length !== files.length) {
      toast.error('Apenas arquivos PDF, Excel e Word são permitidos');
    }

    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    setUploading(true);
    try {
      await createRequestMutation.mutateAsync(data);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Título da Solicitação *</Label>
          <Input
            id="title"
            {...register('title')}
            placeholder="Digite o título da solicitação"
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="flow_type_id">Tipo de Fluxo *</Label>
          <Select onValueChange={(value) => setValue('flow_type_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de fluxo" />
            </SelectTrigger>
            <SelectContent>
              {flowTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.flow_type_id && (
            <p className="text-sm text-destructive">{errors.flow_type_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reference_period">Período de Referência *</Label>
          <Input
            id="reference_period"
            {...register('reference_period')}
            placeholder="Ex: Janeiro 2024"
          />
          {errors.reference_period && (
            <p className="text-sm text-destructive">{errors.reference_period.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Prioridade</Label>
          <Select onValueChange={(value) => setValue('priority', value as 'low' | 'medium' | 'high')}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Valor (opcional)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            {...register('amount')}
            placeholder="0,00"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição Detalhada *</Label>
        <Textarea
          id="description"
          {...register('description')}
          rows={6}
          placeholder="Descreva detalhadamente sua solicitação..."
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-4">
        <Label>Anexos</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <div className="mt-4">
              <Label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-primary hover:text-primary/80">
                  Clique para fazer upload
                </span>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".pdf,.xlsx,.xls,.docx,.doc"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </Label>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Arquivos PDF, Excel e Word são aceitos
            </p>
          </div>
        </div>

        {attachments.length > 0 && (
          <div className="space-y-2">
            <Label>Arquivos Selecionados:</Label>
            {attachments.map((file, index) => (
              <Card key={index}>
                <CardContent className="flex items-center justify-between p-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={uploading || createRequestMutation.isPending}
          className="min-w-32"
        >
          {(uploading || createRequestMutation.isPending) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Enviar Solicitação
        </Button>
      </div>
    </form>
  );
};