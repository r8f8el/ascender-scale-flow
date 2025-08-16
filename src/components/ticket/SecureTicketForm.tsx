
import React, { useState } from 'react';
import { SecureForm } from '@/components/ui/secure-form';
import { validateInput, sanitizeInput } from '@/utils/security';
import { PersonalInfoForm } from './PersonalInfoForm';
import { TicketDetailsForm } from './TicketDetailsForm';
import { CategoryPriorityForm } from './CategoryPriorityForm';
import { FileUploadForm } from './FileUploadForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useSecurityContext } from '@/contexts/SecurityContext';

interface SecureTicketFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting: boolean;
}

export const SecureTicketForm: React.FC<SecureTicketFormProps> = ({
  onSubmit,
  isSubmitting
}) => {
  const { logActivity, monitorSuspiciousActivity } = useSecurityContext();
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_phone: '',
    title: '',
    description: '',
    category_id: '',
    priority_id: ''
  });
  const [files, setFiles] = useState<File[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Real-time validation and sanitization
    let sanitizedValue = value;
    
    if (name === 'user_email') {
      sanitizedValue = sanitizeInput.text(value.toLowerCase());
      if (value && !validateInput.email(sanitizedValue)) {
        toast.error('Formato de email inválido');
        return;
      }
    } else if (name === 'user_phone') {
      sanitizedValue = sanitizeInput.text(value);
      if (value && !validateInput.phone(sanitizedValue)) {
        toast.error('Formato de telefone inválido');
        return;
      }
    } else {
      sanitizedValue = sanitizeInput.text(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: sanitizeInput.text(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Additional security validations
    if (!validateInput.email(formData.user_email)) {
      toast.error('Email inválido');
      await monitorSuspiciousActivity('Invalid email in ticket form', 'medium');
      return;
    }

    if (!validateInput.phone(formData.user_phone)) {
      toast.error('Telefone inválido');
      await monitorSuspiciousActivity('Invalid phone in ticket form', 'medium');
      return;
    }

    if (!validateInput.text(formData.title, 200)) {
      toast.error('Título inválido ou muito longo');
      await monitorSuspiciousActivity('Invalid title in ticket form', 'medium');
      return;
    }

    if (!validateInput.text(formData.description, 5000)) {
      toast.error('Descrição inválida ou muito longa');
      await monitorSuspiciousActivity('Invalid description in ticket form', 'medium');
      return;
    }

    // Validate files
    for (const file of files) {
      const sanitizedName = sanitizeInput.filename(file.name);
      if (sanitizedName !== file.name) {
        toast.error(`Nome de arquivo inválido: ${file.name}`);
        await monitorSuspiciousActivity('Suspicious filename in upload', 'high');
        return;
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast.error('Arquivo muito grande. Limite: 50MB');
        return;
      }
    }

    // Create secure FormData
    const secureFormData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      secureFormData.append(key, sanitizeInput.text(value));
    });

    files.forEach((file, index) => {
      secureFormData.append(`file_${index}`, file);
    });
    secureFormData.append('file_count', files.length.toString());

    await logActivity('Ticket form submission', {
      hasFiles: files.length > 0,
      fileCount: files.length
    });

    await onSubmit(secureFormData);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <SecureForm 
          onSubmit={handleSubmit}
          rateLimitKey={`ticket-form-${formData.user_email}`}
          maxAttempts={3}
          className="space-y-6"
        >
          <PersonalInfoForm
            formData={formData}
            onInputChange={handleInputChange}
          />

          <TicketDetailsForm
            formData={{
              title: formData.title,
              description: formData.description
            }}
            onInputChange={handleInputChange}
          />

          <CategoryPriorityForm
            formData={{
              category_id: formData.category_id,
              priority_id: formData.priority_id
            }}
            onSelectChange={handleSelectChange}
          />

          <FileUploadForm
            files={files}
            onFilesChange={setFiles}
            maxFiles={5}
            maxSize={50 * 1024 * 1024}
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Chamado'}
          </Button>
        </SecureForm>
      </CardContent>
    </Card>
  );
};
