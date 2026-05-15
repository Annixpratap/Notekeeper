import { NotesService } from '../services/notes.service.js';
import { CreateNoteRequestSchema, UpdateNoteRequestSchema } from '../schemas/note.js';
import { PaginationParamsSchema } from '../schemas/pagination.js';

/**
 * Notes Controller
 * Handles HTTP requests for note endpoints
 */

/**
 * Create note endpoint handler
 * POST /notes
 */
export const createNote = async (req, res, next) => {
  try {
    // Validate request body
    const validatedData = CreateNoteRequestSchema.parse(req.body);

    // Call service
    const note = await NotesService.createNote(req.user.id, validatedData);

    // Return 201 with created note
    res.status(201).json({
      message: 'Note created successfully',
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all notes endpoint handler
 * GET /notes
 */
export const getAllNotes = async (req, res, next) => {
  try {
    // Validate query parameters
    const validatedParams = PaginationParamsSchema.parse({
      page: req.query.page,
      limit: req.query.limit,
    });

    const searchQuery = req.query.q || '';

    // Call service
    const result = await NotesService.getUserNotes(
      req.user.id,
      validatedParams.page,
      validatedParams.limit,
      searchQuery
    );

    // Return 200 with paginated results
    res.status(200).json({
      message: 'Notes retrieved successfully',
      data: result.data,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single note endpoint handler
 * GET /notes/:id
 */
export const getNoteById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Call service
    const note = await NotesService.getNoteById(req.user.id, id);

    // Return 200 with note
    res.status(200).json({
      message: 'Note retrieved successfully',
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update note endpoint handler
 * PUT /notes/:id
 */
export const updateNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate request body
    const validatedData = UpdateNoteRequestSchema.parse(req.body);

    // Call service
    const note = await NotesService.updateNote(req.user.id, id, validatedData);

    // Return 200 with updated note
    res.status(200).json({
      message: 'Note updated successfully',
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete note endpoint handler
 * DELETE /notes/:id
 */
export const deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Call service
    await NotesService.deleteNote(req.user.id, id);

    // Return 204 No Content
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
