import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Upload, FileText, X } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres').max(100, 'Título muito longo'),
  description: z.string().min(20, 'Descrição deve ter pelo menos 20 caracteres'),
  flowTypeId: z.string().min(1, 'Selecione um tipo de fluxo'),
  priority: z.enum(['low', 'medium', 'high']),
  amount: z.number().optional()
});

type FormData = z.infer<typeof formSchema>;

export const NewApprovalRequestForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [attachments, setAttachments] = useState<File[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      flowTypeId: '',
      priority: 'medium',
      amount: undefined
    }
  });

  // Buscar tipos de fluxo disponíveis
  const { data: flowTypes } = useQuery({
    queryKey: ['approval-flow-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('approval_flow_types')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Mutation para criar solicitação
  const createRequestMutation = useMutation({
    mutationFn: async (data: FormData & { attachmentUrls?: string[] }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data: request, error } = await supabase
        .from('approval_requests')
        .insert({
          title: data.title,
          description: data.description,
          flow_type_id: data.flowTypeId,
          priority: data.priority,
          amount: data.amount,
          requested_by_user_id: user.id,
          requested_by_name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
          requested_by_email: user.email || '',
          status: 'pending',
          current_step: 1,
          total_steps: 3 // Será ajustado baseado no fluxo
        })
        .select()
        .single();

      if (error) throw error;

      // Upload de anexos se existirem
      if (attachments.length > 0) {
        for (const file of attachments) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${request.id}/${Date.now()}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          // Salvar anexo na tabela
          const { error: attachmentError } = await supabase
            .from('approval_attachments')
            .insert({
              request_id: request.id,
              filename: file.name,
              file_path: uploadData.path,
              file_size: file.size,
              content_type: file.type,
              uploaded_by_user_id: user.id,
              uploaded_by_name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário'
            });

          if (attachmentError) throw attachmentError;
        }
      }

      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-requests'] });
      queryClient.invalidateQueries({ queryKey: ['approval-stats'] });
      form.reset();
      setAttachments([]);
      toast({
        title: "Sucesso",
        description: "Solicitação criada com sucesso!"
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar solicitação. Tente novamente.",
        variant: "destructive"
      });
      console.error('Erro ao criar solicitação:', error);
    }
  });

  const onSubmit = (data: FormData) => {
    createRequestMutation.mutate(data);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => 
      file.size <= 10 * 1024 * 1024 && // 10MB max
      ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)
    );

    if (validFiles.length !== files.length) {
      toast({
        title: "Aviso",
        description: "Alguns arquivos foram ignorados. Apenas PDF, Excel e Word são permitidos (máx. 10MB).",
        variant: "destructive"
      });
    }

    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Nova Solicitação de Aprovação</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da Solicitação *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Aprovação de orçamento para novo projeto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="flowTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Fluxo *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de fluxo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {flowTypes?.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0,00" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição Detalhada *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva detalhadamente sua solicitação, incluindo justificativas e informações relevantes..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Upload de Anexos */}
            <div className="space-y-4">
              <Label>Anexos</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Clique para fazer upload ou arraste arquivos aqui
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        PDF, Excel, Word até 10MB
                      </span>
                    </label>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      multiple
                      className="sr-only"
                      accept=".pdf,.xls,.xlsx,.doc,.docx"
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>
              </div>

              {/* Lista de Anexos */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-gray-500">
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
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={createRequestMutation.isPending}
                className="flex-1"
              >
                {createRequestMutation.isPending ? 'Enviando...' : 'Enviar Solicitação'}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  form.reset();
                  setAttachments([]);
                }}
              >
                Limpar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};