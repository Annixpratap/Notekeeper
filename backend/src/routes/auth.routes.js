import express from 'express';
import { register, login } from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * POST /auth/register
 * Register a new user
 * Body: { email: string, password: string }
 * Response: { message: string, user: { id, email }, access_token: string }
 */
router.post('/register', register);

/**
 * POST /auth/login
 * Login a user
 * Body: { email: string, password: string }
 * Response: { message: string, user: { id, email }, access_token: string }
 */
router.post('/login', login);

export default router;
