import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, X, FileText, DollarSign } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres').max(100, 'Título muito longo'),
  department: z.string().min(1, 'Selecione um departamento'),
  expense_type: z.string().min(1, 'Selecione o tipo de gasto'),
  amount: z.number().min(100, 'Valor mínimo R$ 100'),
  cost_center: z.string().optional(),
  account_code: z.string().optional(),
  justification: z.string().min(50, 'Justificativa deve ter pelo menos 50 caracteres'),
  business_case: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const departments = [
  { value: 'IT', label: 'TI' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Operations', label: 'Operações' },
  { value: 'HR', label: 'RH' },
  { value: 'Finance', label: 'Financeiro' },
];

const expenseTypes = [
  { value: 'CAPEX', label: 'CAPEX' },
  { value: 'OPEX', label: 'OPEX' },
  { value: 'Investment', label: 'Investimento' },
  { value: 'Maintenance', label: 'Manutenção' },
];

export const NewApprovalRequestForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDraft, setIsDraft] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      department: '',
      expense_type: '',
      amount: 0,
      cost_center: '',
      account_code: '',
      justification: '',
      business_case: '',
      start_date: '',
      end_date: '',
    },
  });

  // Fetch flow types
  const { data: flowTypes } = useQuery({
    queryKey: ['approval-flow-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('approval_flow_types')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  // Get user profile
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
    mutationFn: async (data: FormData & { status: string }) => {
      if (!user || !userProfile) throw new Error('User not authenticated');

      // Create approval request
      const { data: request, error: requestError } = await supabase
        .from('approval_requests')
        .insert({
          title: data.title,
          description: `Departamento: ${data.department}\nTipo de Gasto: ${data.expense_type}\nJustificativa: ${data.justification}${data.business_case ? `\n\nBusiness Case: ${data.business_case}` : ''}`,
          amount: data.amount,
          priority: data.amount > 50000 ? 'high' : data.amount > 10000 ? 'medium' : 'low',
          status: data.status,
          flow_type_id: flowTypes?.[0]?.id,
          requested_by_user_id: user.id,
          requested_by_name: userProfile.name,
          requested_by_email: userProfile.email,
          current_step: data.status === 'draft' ? 0 : 1,
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // Upload attachments
      for (const file of attachments) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${request.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Save attachment metadata
        const { error: attachmentError } = await supabase
          .from('approval_attachments')
          .insert({
            request_id: request.id,
            filename: file.name,
            file_path: fileName,
            content_type: file.type,
            file_size: file.size,
            uploaded_by_user_id: user.id,
            uploaded_by_name: userProfile.name,
          });

        if (attachmentError) throw attachmentError;
      }

      // Send notification if not draft
      if (data.status !== 'draft') {
        await supabase.functions.invoke('send-approval-notification', {
          body: {
            requestId: request.id,
            type: 'new_request',
          },
        });
      }

      return request;
    },
    onSuccess: () => {
      toast({
        title: isDraft ? 'Rascunho salvo' : 'Solicitação enviada',
        description: isDraft ? 'Sua solicitação foi salva como rascunho.' : 'Sua solicitação foi enviada para aprovação.',
      });
      form.reset();
      setAttachments([]);
      queryClient.invalidateQueries({ queryKey: ['my-approval-requests'] });
    },
    onError: (error) => {
      console.error('Error creating request:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar solicitação. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
      ];
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB
    });

    if (validFiles.length !== files.length) {
      toast({
        title: 'Arquivos inválidos',
        description: 'Apenas PDF, Excel e Word são permitidos (máx. 10MB cada).',
        variant: 'destructive',
      });
    }

    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    const status = isDraft ? 'draft' : 'pending';
    await createRequestMutation.mutateAsync({ ...data, status });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <DollarSign className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Nova Solicitação de Aprovação</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações do Projeto */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Projeto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do Projeto *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Upgrade de Servidores" maxLength={100} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o departamento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.value} value={dept.value}>
                              {dept.label}
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
                  name="expense_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Gasto *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {expenseTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Detalhes Financeiros */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes Financeiros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Solicitado (R$) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="100"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cost_center"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Centro de Custo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: CC001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="account_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conta Contábil</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 1.2.3.001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Justificativa e Anexos */}
          <Card>
            <CardHeader>
              <CardTitle>Justificativa e Anexos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="justification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Justificativa Detalhada *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva detalhadamente a necessidade e benefícios..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="business_case"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Case (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="ROI esperado, impacto no negócio, riscos..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Upload de Anexos */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Anexos</label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Arraste arquivos aqui ou clique para selecionar
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    PDF, Excel, Word (máx. 10MB cada)
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.xlsx,.xls,.docx,.doc"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Selecionar Arquivos
                  </Button>
                </div>

                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cronograma */}
          <Card>
            <CardHeader>
              <CardTitle>Cronograma</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Início Prevista</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Conclusão Prevista</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDraft(true);
                form.handleSubmit(onSubmit)();
              }}
              disabled={createRequestMutation.isPending}
            >
              Salvar Rascunho
            </Button>
            <Button
              type="submit"
              onClick={() => setIsDraft(false)}
              disabled={createRequestMutation.isPending}
            >
              {createRequestMutation.isPending ? 'Enviando...' : 'Enviar para Aprovação'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};