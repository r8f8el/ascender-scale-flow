
import DOMPurify from 'dompurify';
import { useMemo } from 'react';

export const useInputSanitization = () => {
  const sanitizeInput = useMemo(() => {
    return (input: string): string => {
      // Remove HTML tags and scripts
      const cleaned = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
      
      // Additional validation for common injection patterns
      const sqlPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi;
      const jsPattern = /(<script|javascript:|vbscript:|onload|onerror|onclick)/gi;
      
      if (sqlPattern.test(cleaned) || jsPattern.test(cleaned)) {
        throw new Error('Input contains potentially dangerous content');
      }
      
      return cleaned.trim();
    };
  }, []);

  const sanitizeFormData = useMemo(() => {
    return (data: Record<string, any>): Record<string, any> => {
      const sanitized: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
          sanitized[key] = sanitizeInput(value);
        } else {
          sanitized[key] = value;
        }
      }
      
      return sanitized;
    };
  }, [sanitizeInput]);

  return { sanitizeInput, sanitizeFormData };
};
