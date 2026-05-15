import { extractTokenFromHeader, validateToken } from '../utils/jwt.js';

/**
 * Authentication middleware
 * Validates JWT token and attaches user to request
 * Returns 401 on missing or invalid token
 */
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        message: 'Missing authorization token',
      });
    }

    const decoded = validateToken(token);
    req.user = {
      id: decoded.userId,
    };

    next();
  } catch (error) {
    res.status(401).json({
      message: error.message || 'Invalid token',
    });
  }
};

export default authMiddleware;
