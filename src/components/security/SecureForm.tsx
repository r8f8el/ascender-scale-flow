
import React, { useState, useCallback } from 'react';
import { useSecurityContext } from './SecureAuthWrapper';
import { useSecureValidation } from '@/hooks/useSecureValidation';

interface SecureFormProps {
  children: React.ReactNode;
  onSubmit: (data: any) => Promise<void>;
  formType: 'login' | 'signup' | 'password_reset' | 'general';
  className?: string;
}

export const SecureForm: React.FC<SecureFormProps> = ({
  children,
  onSubmit,
  formType,
  className
}) => {
  const { checkAuthRateLimit, logSecurityEvent } = useSecurityContext();
  const { validateInput } = useSecureValidation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [csrfToken] = useState(() => crypto.randomUUID());

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (isSubmitting) return;

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Validate CSRF token
    if (formData.get('csrf_token') !== csrfToken) {
      await logSecurityEvent('csrf_token_mismatch', 'form', {
        form_type: formType,
        timestamp: new Date().toISOString()
      });
      throw new Error('Security validation failed');
    }

    // Check rate limits for auth forms
    if (['login', 'signup', 'password_reset'].includes(formType)) {
      const email = data.email as string;
      if (!email || !validateInput(email, 'email')) {
        await logSecurityEvent('invalid_email_format', 'form', {
          form_type: formType,
          timestamp: new Date().toISOString()
        });
        throw new Error('Invalid email format');
      }

      const allowed = await checkAuthRateLimit(email, formType as any);
      if (!allowed) {
        return; // Rate limit message already shown
      }
    }

    // Validate all inputs
    const validatedData: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === 'csrf_token') continue;
      
      const validatedValue = validateInput(value as string, key);
      if (validatedValue === null) {
        await logSecurityEvent('input_validation_failed', 'form', {
          form_type: formType,
          field: key,
          timestamp: new Date().toISOString()
        });
        throw new Error(`Invalid ${key} format`);
      }
      validatedData[key] = validatedValue;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(validatedData);
    } finally {
      setIsSubmitting(false);
    }
  }, [csrfToken, formType, checkAuthRateLimit, logSecurityEvent, validateInput, isSubmitting, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className={className}>
      <input type="hidden" name="csrf_token" value={csrfToken} />
      {children}
    </form>
  );
};
