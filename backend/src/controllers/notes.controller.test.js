import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createNote, getAllNotes, getNoteById, updateNote, deleteNote } from './notes.controller.js';
import { NotesService } from '../services/notes.service.js';

// Mock the NotesService
vi.mock('../services/notes.service.js', () => ({
  NotesService: {
    createNote: vi.fn(),
    getUserNotes: vi.fn(),
    getNoteById: vi.fn(),
    updateNote: vi.fn(),
    deleteNote: vi.fn(),
  },
}));

describe('Notes Controller', () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();
    req = {
      user: { id: 'test-user-123' },
      body: {},
      params: {},
      query: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
  });

  describe('createNote', () => {
    it('should create a note with valid data', async () => {
      const noteData = {
        title: 'Test Note',
        content: 'Test content',
      };
      const createdNote = {
        id: 'note-123',
        ...noteData,
        ownerId: 'test-user-123',
      };

      req.body = noteData;
      NotesService.createNote.mockResolvedValue(createdNote);

      await createNote(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Note created successfully',
        data: createdNote,
      });
    });

    it('should handle validation errors', async () => {
      req.body = { title: '' }; // Invalid: empty title

      await createNote(req, res, next);

      // Zod validation error should be passed to next
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeDefined();
    });
  });

  describe('getAllNotes', () => {
    it('should retrieve paginated notes', async () => {
      const notes = [
        { id: 'note-1', title: 'Note 1', ownerId: 'test-user-123' },
      ];

      req.query = { page: '1', limit: '10' };
      NotesService.getUserNotes.mockResolvedValue({
        data: notes,
        total: 1,
        page: 1,
        totalPages: 1,
      });

      await getAllNotes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Notes retrieved successfully',
        data: notes,
        total: 1,
        page: 1,
        totalPages: 1,
      });
    });

    it('should support search query', async () => {
      req.query = { page: '1', limit: '10', q: 'test' };
      NotesService.getUserNotes.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        totalPages: 0,
      });

      await getAllNotes(req, res, next);

      expect(NotesService.getUserNotes).toHaveBeenCalledWith(
        'test-user-123',
        1,
        10,
        'test'
      );
    });
  });

  describe('getNoteById', () => {
    it('should retrieve a note by ID', async () => {
      const note = {
        id: 'note-123',
        title: 'Test Note',
        ownerId: 'test-user-123',
      };

      req.params = { id: 'note-123' };
      NotesService.getNoteById.mockResolvedValue(note);

      await getNoteById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Note retrieved successfully',
        data: note,
      });
    });

    it('should return 404 for nonexistent note', async () => {
      const error = new Error('Note not found');
      error.statusCode = 404;

      req.params = { id: 'nonexistent' };
      NotesService.getNoteById.mockRejectedValue(error);

      await getNoteById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should return 403 for unauthorized access', async () => {
      const error = new Error('Access denied');
      error.statusCode = 403;

      req.params = { id: 'note-123' };
      NotesService.getNoteById.mockRejectedValue(error);

      await getNoteById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateNote', () => {
    it('should update a note', async () => {
      const updateData = {
        title: 'Updated Title',
        isPinned: true,
      };
      const updatedNote = {
        id: 'note-123',
        ...updateData,
        ownerId: 'test-user-123',
      };

      req.params = { id: 'note-123' };
      req.body = updateData;
      NotesService.updateNote.mockResolvedValue(updatedNote);

      await updateNote(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Note updated successfully',
        data: updatedNote,
      });
    });

    it('should return 403 if user does not own the note', async () => {
      const error = new Error('Access denied');
      error.statusCode = 403;

      req.params = { id: 'note-123' };
      req.body = { title: 'Updated Title' };
      NotesService.updateNote.mockRejectedValue(error);

      await updateNote(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteNote', () => {
    it('should delete a note', async () => {
      req.params = { id: 'note-123' };
      NotesService.deleteNote.mockResolvedValue(undefined);

      await deleteNote(req, res, next);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should return 404 for nonexistent note', async () => {
      const error = new Error('Note not found');
      error.statusCode = 404;

      req.params = { id: 'nonexistent' };
      NotesService.deleteNote.mockRejectedValue(error);

      await deleteNote(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should return 403 if user does not own the note', async () => {
      const error = new Error('Access denied');
      error.statusCode = 403;

      req.params = { id: 'note-123' };
      NotesService.deleteNote.mockRejectedValue(error);

      await deleteNote(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
