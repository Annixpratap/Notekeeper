import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
} from '../controllers/notes.controller.js';
import { shareNote } from '../controllers/share.controller.js';

const router = express.Router();

// All note routes require authentication
router.use(authMiddleware);

/**
 * POST /notes
 * Create a new note
 * Body: { title, content?, blocks?, color?, tags?, isPinned? }
 * Response: { message: string, data: Note }
 */
router.post('/', createNote);

/**
 * GET /notes
 * Get all notes for authenticated user (owned + shared)
 * Query: ?page=1&limit=10&q=keyword
 * Response: { message: string, data: Note[], total: number, page: number, totalPages: number }
 */
router.get('/', getAllNotes);

/**
 * GET /notes/:id
 * Get a single note by ID
 * Response: { message: string, data: Note }
 */
router.get('/:id', getNoteById);

/**
 * PUT /notes/:id
 * Update a note
 * Body: { title?, blocks?, color?, tags?, isPinned? }
 * Response: { message: string, data: Note }
 */
router.put('/:id', updateNote);

/**
 * DELETE /notes/:id
 * Delete a note
 * Response: 204 No Content
 */
router.delete('/:id', deleteNote);

/**
 * POST /notes/:id/share
 * Share a note with another user
 * Body: { share_with_email: string }
 * Response: { message: string, noteShare: NoteShare }
 */
router.post('/:id/share', shareNote);

export default router;