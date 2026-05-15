import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth.service.js';
import * as passwordUtils from '../utils/password.js';
import * as jwtUtils from '../utils/jwt.js';

// Mock Prisma
vi.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  };
  return {
    PrismaClient: vi.fn(() => mockPrismaClient),
  };
});

// Mock password utilities
vi.mock('../utils/password.js', () => ({
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
}));

// Mock JWT utilities
vi.mock('../utils/jwt.js', () => ({
  generateToken: vi.fn(),
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashed_password';
      const userId = 'user_123';
      const token = 'jwt_token';

      // Mock implementations
      const { PrismaClient } = await import('@prisma/client');
      const prismaInstance = new PrismaClient();
      
      prismaInstance.user.findUnique.mockResolvedValue(null);
      prismaInstance.user.create.mockResolvedValue({
        id: userId,
        email,
        password: hashedPassword,
      });

      passwordUtils.hashPassword.mockResolvedValue(hashedPassword);
      jwtUtils.generateToken.mockReturnValue(token);

      const result = await AuthService.register(email, password);

      expect(result).toEqual({
        user: {
          id: userId,
          email,
        },
        token,
      });
      expect(passwordUtils.hashPassword).toHaveBeenCalledWith(password);
      expect(jwtUtils.generateToken).toHaveBeenCalledWith(userId);
    });

    it('should throw error if email already exists', async () => {
      const email = 'existing@example.com';
      const password = 'password123';

      const { PrismaClient } = await import('@prisma/client');
      const prismaInstance = new PrismaClient();
      
      prismaInstance.user.findUnique.mockResolvedValue({
        id: 'user_123',
        email,
      });

      try {
        await AuthService.register(email, password);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toBe('Email already registered');
        expect(error.statusCode).toBe(409);
      }
    });

    it('should hash password with bcrypt', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashed_password';
      const userId = 'user_123';
      const token = 'jwt_token';

      const { PrismaClient } = await import('@prisma/client');
      const prismaInstance = new PrismaClient();
      
      prismaInstance.user.findUnique.mockResolvedValue(null);
      prismaInstance.user.create.mockResolvedValue({
        id: userId,
        email,
        password: hashedPassword,
      });

      passwordUtils.hashPassword.mockResolvedValue(hashedPassword);
      jwtUtils.generateToken.mockReturnValue(token);

      await AuthService.register(email, password);

      expect(passwordUtils.hashPassword).toHaveBeenCalledWith(password);
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashed_password';
      const userId = 'user_123';
      const token = 'jwt_token';

      const { PrismaClient } = await import('@prisma/client');
      const prismaInstance = new PrismaClient();
      
      prismaInstance.user.findUnique.mockResolvedValue({
        id: userId,
        email,
        password: hashedPassword,
      });

      passwordUtils.comparePassword.mockResolvedValue(true);
      jwtUtils.generateToken.mockReturnValue(token);

      const result = await AuthService.login(email, password);

      expect(result).toEqual({
        user: {
          id: userId,
          email,
        },
        token,
      });
      expect(passwordUtils.comparePassword).toHaveBeenCalledWith(password, hashedPassword);
      expect(jwtUtils.generateToken).toHaveBeenCalledWith(userId);
    });

    it('should throw error if user not found', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      const { PrismaClient } = await import('@prisma/client');
      const prismaInstance = new PrismaClient();
      
      prismaInstance.user.findUnique.mockResolvedValue(null);

      try {
        await AuthService.login(email, password);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toBe('Invalid email or password');
        expect(error.statusCode).toBe(401);
      }
    });

    it('should throw error if password is incorrect', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const hashedPassword = 'hashed_password';
      const userId = 'user_123';

      const { PrismaClient } = await import('@prisma/client');
      const prismaInstance = new PrismaClient();
      
      prismaInstance.user.findUnique.mockResolvedValue({
        id: userId,
        email,
        password: hashedPassword,
      });

      passwordUtils.comparePassword.mockResolvedValue(false);

      try {
        await AuthService.login(email, password);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toBe('Invalid email or password');
        expect(error.statusCode).toBe(401);
      }
    });

    it('should compare password with stored hash', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashed_password';
      const userId = 'user_123';
      const token = 'jwt_token';

      const { PrismaClient } = await import('@prisma/client');
      const prismaInstance = new PrismaClient();
      
      prismaInstance.user.findUnique.mockResolvedValue({
        id: userId,
        email,
        password: hashedPassword,
      });

      passwordUtils.comparePassword.mockResolvedValue(true);
      jwtUtils.generateToken.mockReturnValue(token);

      await AuthService.login(email, password);

      expect(passwordUtils.comparePassword).toHaveBeenCalledWith(password, hashedPassword);
    });
  });
});
