
import DOMPurify from 'dompurify';

// Input validation utilities
export const validateInput = {
  // Email validation with injection protection
  email: (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const sanitized = email.trim().toLowerCase();
    return emailRegex.test(sanitized) && sanitized.length <= 254 && !containsSQLInjection(sanitized);
  },

  // Enhanced CNPJ validation
  cnpj: (cnpj: string): boolean => {
    const sanitized = cnpj.replace(/[^\d]/g, '');
    if (sanitized.length !== 11 && sanitized.length !== 14) return false;
    return !containsSQLInjection(cnpj) && !containsXSS(cnpj);
  },

  // Phone validation
  phone: (phone: string): boolean => {
    const sanitized = phone.replace(/[^\d]/g, '');
    return sanitized.length >= 10 && sanitized.length <= 15 && !containsXSS(phone);
  },

  // Text input validation
  text: (text: string, maxLength: number = 1000): boolean => {
    return text.length <= maxLength && !containsSQLInjection(text);
  },

  // URL validation
  url: (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol) && !containsXSS(url);
    } catch {
      return false;
    }
  }
};

// XSS protection
export const sanitizeInput = {
  html: (input: string): string => {
    return DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  },

  text: (input: string): string => {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  },

  filename: (filename: string): string => {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\.{2,}/g, '.')
      .substring(0, 255);
  }
};

// Injection detection
const containsSQLInjection = (input: string): boolean => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(--|\/\*|\*\/|;|'|")/,
    /(\bOR\b|\bAND\b).*[=<>]/i
  ];
  return sqlPatterns.some(pattern => pattern.test(input));
};

const containsXSS = (input: string): boolean => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi
  ];
  return xssPatterns.some(pattern => pattern.test(input));
};

// Rate limiting utility
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (identifier: string, maxAttempts: number = 5, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const key = identifier;
  const current = rateLimitMap.get(key);

  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= maxAttempts) {
    return false;
  }

  current.count++;
  return true;
};

// Security logging utility
export const logSecurityEvent = async (eventType: string, description: string, metadata: any = {}) => {
  try {
    const response = await fetch('/api/security-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,
        description,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        }
      })
    });
    
    if (!response.ok) {
      console.warn('Failed to log security event');
    }
  } catch (error) {
    console.warn('Security logging error:', error);
  }
};
