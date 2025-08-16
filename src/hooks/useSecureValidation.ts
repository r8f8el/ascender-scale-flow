
import { useState } from 'react';
import { toast } from 'sonner';

interface ValidationRule {
  field: string;
  validator: (value: any) => boolean;
  message: string;
}

interface ValidationOptions {
  sanitize?: boolean;
  maxLength?: { [key: string]: number };
  required?: string[];
}

export const useSecureValidation = () => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const sanitizeInput = (input: string): string => {
    if (typeof input !== 'string') return '';
    
    // Remove potential XSS vectors
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  };

  const validateRequired = (value: any): boolean => {
    if (typeof value === 'string') return value.trim().length > 0;
    return value !== null && value !== undefined;
  };

  const validateLength = (value: string, min: number = 0, max: number = Infinity): boolean => {
    const length = value ? value.length : 0;
    return length >= min && length <= max;
  };

  const validateInput = (value: string, type: string): string | null => {
    if (typeof value !== 'string') return null;
    
    // Sanitize first
    const sanitized = sanitizeInput(value);
    
    // Validate based on type
    switch (type) {
      case 'email':
        return validateEmail(sanitized) ? sanitized : null;
      case 'password':
        return validateLength(sanitized, 6, 128) ? sanitized : null;
      case 'name':
        return validateLength(sanitized, 1, 100) ? sanitized : null;
      case 'csrf_token':
        return sanitized; // CSRF tokens are validated separately
      default:
        return sanitized.length <= 1000 ? sanitized : null; // General max length
    }
  };

  const validateForm = (
    data: { [key: string]: any },
    rules: ValidationRule[],
    options: ValidationOptions = {}
  ): boolean => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    // Check required fields
    if (options.required) {
      options.required.forEach(field => {
        if (!validateRequired(data[field])) {
          newErrors[field] = `${field} é obrigatório`;
          isValid = false;
        }
      });
    }

    // Apply custom validation rules
    rules.forEach(rule => {
      const value = data[rule.field];
      if (value && !rule.validator(value)) {
        newErrors[rule.field] = rule.message;
        isValid = false;
      }
    });

    // Check maximum lengths
    if (options.maxLength) {
      Object.entries(options.maxLength).forEach(([field, maxLen]) => {
        const value = data[field];
        if (typeof value === 'string' && value.length > maxLen) {
          newErrors[field] = `${field} deve ter no máximo ${maxLen} caracteres`;
          isValid = false;
        }
      });
    }

    // Sanitize inputs if requested
    if (options.sanitize) {
      Object.keys(data).forEach(key => {
        if (typeof data[key] === 'string') {
          data[key] = sanitizeInput(data[key]);
        }
      });
    }

    setErrors(newErrors);

    if (!isValid) {
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError || 'Erro de validação');
    }

    return isValid;
  };

  const clearErrors = () => {
    setErrors({});
  };

  return {
    errors,
    validateForm,
    validateEmail,
    validateRequired,
    validateLength,
    validateInput,
    sanitizeInput,
    clearErrors
  };
};
