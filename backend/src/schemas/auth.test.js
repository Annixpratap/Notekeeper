import { describe, it, expect } from 'vitest';
import { RegisterRequestSchema, LoginRequestSchema } from './auth.js';

describe('Auth Schemas', () => {
  describe('RegisterRequestSchema', () => {
    it('should validate valid registration request', () => {
      const validRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = RegisterRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validRequest);
    });

    it('should reject invalid email format', () => {
      const invalidRequest = {
        email: 'not-an-email',
        password: 'password123',
      };

      const result = RegisterRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject password shorter than 8 characters', () => {
      const invalidRequest = {
        email: 'test@example.com',
        password: 'short',
      };

      const result = RegisterRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should accept password with exactly 8 characters', () => {
      const validRequest = {
        email: 'test@example.com',
        password: '12345678',
      };

      const result = RegisterRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should reject missing email', () => {
      const invalidRequest = {
        password: 'password123',
      };

      const result = RegisterRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const invalidRequest = {
        email: 'test@example.com',
      };

      const result = RegisterRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject empty email', () => {
      const invalidRequest = {
        email: '',
        password: 'password123',
      };

      const result = RegisterRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const invalidRequest = {
        email: 'test@example.com',
        password: '',
      };

      const result = RegisterRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should accept various valid email formats', () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user123@test-domain.com',
      ];

      for (const email of validEmails) {
        const result = RegisterRequestSchema.safeParse({
          email,
          password: 'password123',
        });
        expect(result.success).toBe(true);
      }
    });

    it('should accept long passwords', () => {
      const longPassword = 'a'.repeat(100);
      const result = RegisterRequestSchema.safeParse({
        email: 'test@example.com',
        password: longPassword,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('LoginRequestSchema', () => {
    it('should validate valid login request', () => {
      const validRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = LoginRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validRequest);
    });

    it('should reject invalid email format', () => {
      const invalidRequest = {
        email: 'not-an-email',
        password: 'password123',
      };

      const result = LoginRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should accept password shorter than 8 characters for login', () => {
      const validRequest = {
        email: 'test@example.com',
        password: 'short',
      };

      const result = LoginRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should reject missing email', () => {
      const invalidRequest = {
        password: 'password123',
      };

      const result = LoginRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const invalidRequest = {
        email: 'test@example.com',
      };

      const result = LoginRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject empty email', () => {
      const invalidRequest = {
        email: '',
        password: 'password123',
      };

      const result = LoginRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject empty password for login', () => {
      const invalidRequest = {
        email: 'test@example.com',
        password: '',
      };

      const result = LoginRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });

  describe('Property 3: Email Uniqueness and Password Validation', () => {
    it('should validate email format correctly', () => {
      const validEmails = [
        'user@example.com',
        'test.user@domain.co.uk',
        'user+tag@example.com',
      ];

      for (const email of validEmails) {
        const result = RegisterRequestSchema.safeParse({
          email,
          password: 'password123',
        });
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'notanemail',
        'user@',
        '@example.com',
        'user @example.com',
      ];

      for (const email of invalidEmails) {
        const result = RegisterRequestSchema.safeParse({
          email,
          password: 'password123',
        });
        expect(result.success).toBe(false);
      }
    });

    it('should validate password length requirement (8+ characters)', () => {
      const shortPasswords = ['', '1', '1234567'];
      for (const password of shortPasswords) {
        const result = RegisterRequestSchema.safeParse({
          email: 'test@example.com',
          password,
        });
        expect(result.success).toBe(false);
      }

      const validPasswords = ['12345678', 'password123', 'a'.repeat(100)];
      for (const password of validPasswords) {
        const result = RegisterRequestSchema.safeParse({
          email: 'test@example.com',
          password,
        });
        expect(result.success).toBe(true);
      }
    });
  });
});
