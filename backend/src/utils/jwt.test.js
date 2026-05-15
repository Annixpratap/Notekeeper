import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateToken, validateToken, extractTokenFromHeader } from './jwt.js';

describe('JWT Utilities', () => {
  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const userId = 'user_123';
      const token = generateToken(userId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should encode user ID in token', () => {
      const userId = 'user_456';
      const token = generateToken(userId);

      const decoded = validateToken(token);
      expect(decoded.userId).toBe(userId);
    });

    it('should generate different tokens for different user IDs', () => {
      const token1 = generateToken('user_1');
      const token2 = generateToken('user_2');

      expect(token1).not.toBe(token2);
    });
  });

  describe('validateToken', () => {
    it('should validate a valid token', () => {
      const userId = 'user_123';
      const token = generateToken(userId);
      const decoded = validateToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(userId);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => validateToken(invalidToken)).toThrow();
    });

    it('should throw error for tampered token', () => {
      const userId = 'user_123';
      const token = generateToken(userId);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';

      expect(() => validateToken(tamperedToken)).toThrow();
    });

    it('should throw error for empty token', () => {
      expect(() => validateToken('')).toThrow();
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Authorization header', () => {
      const token = 'my_jwt_token';
      const authHeader = `Bearer ${token}`;
      const extracted = extractTokenFromHeader(authHeader);

      expect(extracted).toBe(token);
    });

    it('should return null for missing Authorization header', () => {
      const extracted = extractTokenFromHeader(null);
      expect(extracted).toBeNull();
    });

    it('should return null for empty Authorization header', () => {
      const extracted = extractTokenFromHeader('');
      expect(extracted).toBeNull();
    });

    it('should return null for header without Bearer prefix', () => {
      const extracted = extractTokenFromHeader('Token my_jwt_token');
      expect(extracted).toBeNull();
    });

    it('should return null for malformed Bearer header', () => {
      const extracted = extractTokenFromHeader('Bearer');
      expect(extracted).toBeNull();
    });

    it('should handle Bearer with extra spaces', () => {
      const token = 'my_jwt_token';
      const authHeader = `Bearer  ${token}`;
      const extracted = extractTokenFromHeader(authHeader);

      // Should extract the token with the extra space
      expect(extracted).toBe(` ${token}`);
    });
  });

  describe('Property 2: Authentication Flow Round-Trip', () => {
    it('should verify authentication flow round-trip for various user IDs', () => {
      const userIds = [
        'user_123',
        'user_abc_def',
        'clh1234567890abcdef',
        'admin_user',
      ];

      for (const userId of userIds) {
        const token = generateToken(userId);
        const decoded = validateToken(token);
        expect(decoded.userId).toBe(userId);
      }
    });

    it('should maintain user ID through token generation and validation', () => {
      const userId = 'test_user_456';
      const token = generateToken(userId);
      const decoded = validateToken(token);

      expect(decoded.userId).toBe(userId);
    });

    it('should extract token from header and validate it', () => {
      const userId = 'user_789';
      const token = generateToken(userId);
      const authHeader = `Bearer ${token}`;
      const extracted = extractTokenFromHeader(authHeader);
      const decoded = validateToken(extracted);

      expect(decoded.userId).toBe(userId);
    });
  });
});
