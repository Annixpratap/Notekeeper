import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { shareNote, getShareInfo, revokeShare } from '../controllers/share.controller.js';

const router = express.Router({ mergeParams: true });

// All share routes require authentication
router.use(authMiddleware);

/**
 * POST /notes/:id/share
 * Share a note with another user
 */
router.post('/', shareNote);

/**
 * GET /notes/:id/shares
 * Get share information for a note
 */
router.get('/', getShareInfo);

/**
 * DELETE /notes/:id/shares/:userId
 * Revoke share access
 */
router.delete('/:userId', revokeShare);

export default router;
