import { AuthService } from '../services/auth.service.js';
import { RegisterRequestSchema, LoginRequestSchema } from '../schemas/auth.js';

/**
 * Authentication Controller
 * Handles HTTP requests for authentication endpoints
 */

/**
 * Register endpoint handler
 * POST /auth/register
 */
export const register = async (req, res, next) => {
  try {
    // Validate request body
    const validatedData = RegisterRequestSchema.parse(req.body);

    // Call service
    const result = await AuthService.register(validatedData.email, validatedData.password);

    // Return 201 with success message
    res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      access_token: result.token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login endpoint handler
 * POST /auth/login
 */
export const login = async (req, res, next) => {
  try {
    // Validate request body
    const validatedData = LoginRequestSchema.parse(req.body);

    // Call service
    const result = await AuthService.login(validatedData.email, validatedData.password);

    // Return 200 with token and user info
    res.status(200).json({
      message: 'Login successful',
      user: result.user,
      access_token: result.token,
    });
  } catch (error) {
    next(error);
  }
};
