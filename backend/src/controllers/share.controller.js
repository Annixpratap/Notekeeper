import { ShareService } from '../services/share.service.js';
import { ShareRequestSchema } from '../schemas/share.js';

/**
 * Share Controller
 * Handles note sharing endpoints
 */

/**
 * Share a note with another user
 * POST /notes/:id/share
 */
export const shareNote = async (req, res, next) => {
  try {
    const { id: noteId } = req.params;
    const userId = req.user.id;

    // Validate request body
    const validatedData = ShareRequestSchema.parse(req.body);

    // Share note
    const noteShare = await ShareService.shareNote(userId, noteId, validatedData.share_with_email);

    res.status(201).json({
      message: 'Note shared successfully',
      noteShare: {
        id: noteShare.id,
        noteId: noteShare.noteId,
        userId: noteShare.userId,
        sharedAt: noteShare.sharedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get share information for a note
 * GET /notes/:id/shares
 */
export const getShareInfo = async (req, res, next) => {
  try {
    const { id: noteId } = req.params;
    const userId = req.user.id;

    // Verify user owns the note
    const isOwner = await ShareService.isOwner(userId, noteId);
    if (!isOwner) {
      const error = new Error('Access denied');
      error.statusCode = 403;
      throw error;
    }

    // Get share info
    const shareInfo = await ShareService.getShareInfo(noteId);

    res.status(200).json({
      shares: shareInfo.map((share) => ({
        id: share.id,
        noteId: share.noteId,
        user: {
          id: share.user.id,
          email: share.user.email,
        },
        sharedAt: share.sharedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Revoke share access
 * DELETE /notes/:id/shares/:userId
 */
export const revokeShare = async (req, res, next) => {
  try {
    const { id: noteId, userId } = req.params;
    const ownerId = req.user.id;

    // Revoke share
    await ShareService.revokeShare(ownerId, noteId, userId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
