import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { searchNotes } from '../controllers/search.controller.js';

const router = express.Router();

// All search routes require authentication
router.use(authMiddleware);

/**
 * GET /search?q=keyword&page=1&limit=10
 * Search notes
 */
router.get('/', searchNotes);

export default router;
