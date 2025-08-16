
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, AlertCircle, Info, Phone, Mail, User, FileText, Tag, Zap } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface Priority {
  id: string;
  name: string;
  description?: string;
}

interface ModernTicketFormProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    title: string;
    description: string;
    category_id: string;
    priority_id: string;
  };
  files: File[];
  isLoading: boolean;
  categories: Category[];
  priorities: Priority[];
  onInputChange: (field: string, value: string) => void;
  onSelectChange: (field: string, value: string) => void;
  onFileChange: (files: File[]) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ModernTicketForm: React.FC<ModernTicketFormProps> = ({
  formData,
  files,
  isLoading,
  categories,
  priorities,
  onInputChange,
  onSelectChange,
  onFileChange,
  onSubmit
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFileChange(Array.from(e.target.files));
    }
  };

  const getPriorityBadge = (priorityId: string) => {
    const priority = priorities.find(p => p.id === priorityId);
    if (!priority) return null;

    const variant = priority.name.toLowerCase() === 'alta' ? 'destructive' : 
                   priority.name.toLowerCase() === 'média' ? 'secondary' : 'outline';
    
    return <Badge variant={variant}>{priority.name}</Badge>;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Preencha todas as informações necessárias para que possamos ajudá-lo da melhor forma possível.
        </AlertDescription>
      </Alert>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>
              Seus dados de contato para acompanhamento do chamado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nome Completo *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => onInputChange('name', e.target.value)}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefone *
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => onInputChange('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                E-mail *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => onInputChange('email', e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Ticket Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detalhes do Chamado
            </CardTitle>
            <CardDescription>
              Descreva seu problema ou solicitação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Assunto *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => onInputChange('title', e.target.value)}
                placeholder="Descreva brevemente o problema"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição Detalhada *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => onInputChange('description', e.target.value)}
                placeholder="Descreva detalhadamente o problema ou solicitação..."
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Category and Priority */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Classificação
            </CardTitle>
            <CardDescription>
              Ajude-nos a direcionar seu chamado corretamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select value={formData.category_id} onValueChange={(value) => onSelectChange('category_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Prioridade *
                </Label>
                <Select value={formData.priority_id} onValueChange={(value) => onSelectChange('priority_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.id} value={priority.id}>
                        <div className="flex items-center gap-2">
                          {priority.name}
                          {getPriorityBadge(priority.id)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Anexos
            </CardTitle>
            <CardDescription>
              Anexe prints, documentos ou arquivos relevantes (opcional)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <Input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="max-w-xs mx-auto"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Formatos aceitos: PDF, DOC, DOCX, JPG, PNG, GIF (máx. 10MB cada)
                </p>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <Label>Arquivos selecionados:</Label>
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{file.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <Card>
          <CardContent className="pt-6">
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando Chamado...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Abrir Chamado
                </>
              )}
            </Button>
            
            <Alert className="mt-4" variant="default">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Após o envio, você receberá um e-mail de confirmação com o número do seu chamado.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};
