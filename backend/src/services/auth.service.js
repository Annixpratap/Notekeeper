import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';

const prisma = new PrismaClient();

/**
 * Authentication Service
 * Handles user registration, login, and token generation
 */
export class AuthService {
  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - User password (plain text)
   * @returns {Promise<{user: {id: string, email: string}, token: string}>}
   * @throws {Error} If email already exists or validation fails
   */
  static async register(email, password) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const error = new Error('Email already registered');
      error.statusCode = 409;
      throw error;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // Generate token
    const token = generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      token,
    };
  }

  /**
   * Login a user
   * @param {string} email - User email
   * @param {string} password - User password (plain text)
   * @returns {Promise<{user: {id: string, email: string}, token: string}>}
   * @throws {Error} If credentials are invalid
   */
  static async login(email, password) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Generate token
    const token = generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      token,
    };
  }
}
