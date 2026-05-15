import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NotesService } from './notes.service.js';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
vi.mock('@prisma/client', () => {
  const mockPrisma = {
    note: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  };
  return {
    PrismaClient: vi.fn(() => mockPrisma),
  };
});

const prisma = new PrismaClient();

describe('NotesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createNote', () => {
    it('should create a note with all provided fields', async () => {
      const userId = 'user-123';
      const noteData = {
        title: 'Test Note',
        blocks: [{ id: '1', type: 'text', content: 'Block 1' }],
        color: '#ff0000',
        tags: ['tag1', 'tag2'],
        isPinned: true,
      };

      const createdNote = {
        id: 'note-123',
        title: noteData.title,
        content: 'Block 1', // Generated from blocks
        blocks: noteData.blocks,
        color: noteData.color,
        tags: noteData.tags,
        isPinned: noteData.isPinned,
        ownerId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.note.create.mockResolvedValue(createdNote);

      const result = await NotesService.createNote(userId, noteData);

      expect(prisma.note.create).toHaveBeenCalledWith({
        data: {
          title: noteData.title,
          content: 'Block 1', // Generated from blocks
          blocks: noteData.blocks,
          color: noteData.color,
          tags: noteData.tags,
          isPinned: noteData.isPinned,
          ownerId: userId,
        },
      });
      expect(result).toEqual(createdNote);
    });

    it('should create a note with default values when optional fields are not provided', async () => {
      const userId = 'user-123';
      const noteData = {
        title: 'Test Note',
      };

      const createdNote = {
        id: 'note-123',
        title: 'Test Note',
        content: '',
        blocks: [],
        color: '#ffffff',
        tags: [],
        isPinned: false,
        ownerId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.note.create.mockResolvedValue(createdNote);

      const result = await NotesService.createNote(userId, noteData);

      expect(prisma.note.create).toHaveBeenCalledWith({
        data: {
          title: noteData.title,
          content: '',
          blocks: [],
          color: '#ffffff',
          tags: [],
          isPinned: false,
          ownerId: userId,
        },
      });
      expect(result).toEqual(createdNote);
    });
  });

  describe('getUserNotes', () => {
    it('should retrieve paginated notes for user', async () => {
      const userId = 'user-123';
      const ownedNotes = [
        {
          id: 'note-1',
          title: 'Note 1',
          ownerId: userId,
          isPinned: false,
          createdAt: new Date('2024-01-01'),
          owner: { id: userId, email: 'user@example.com' },
        },
      ];

      const sharedNotes = [
        {
          id: 'note-2',
          title: 'Note 2',
          ownerId: 'user-456',
          isPinned: false,
          createdAt: new Date('2024-01-02'),
          owner: { id: 'user-456', email: 'other@example.com' },
          sharedWith: [{ userId }],
        },
      ];

      prisma.note.findMany
        .mockResolvedValueOnce(ownedNotes)
        .mockResolvedValueOnce(sharedNotes);

      prisma.note.count
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(1);

      const result = await NotesService.getUserNotes(userId, 1, 10);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
      
      // Verify owned note has isShared: false
      const ownedNote = result.data.find(n => n.id === 'note-1');
      expect(ownedNote.isShared).toBe(false);
      
      // Verify shared note has isShared: true and sharedBy metadata
      const sharedNote = result.data.find(n => n.id === 'note-2');
      expect(sharedNote.isShared).toBe(true);
      expect(sharedNote.sharedBy).toEqual({ id: 'user-456', email: 'other@example.com' });
    });

    it('should sort pinned notes first', async () => {
      const userId = 'user-123';
      const ownedNotes = [
        {
          id: 'note-1',
          title: 'Note 1',
          ownerId: userId,
          isPinned: false,
          createdAt: new Date('2024-01-02'),
          owner: { id: userId, email: 'user@example.com' },
        },
      ];

      const sharedNotes = [
        {
          id: 'note-2',
          title: 'Note 2',
          ownerId: 'user-456',
          isPinned: true,
          createdAt: new Date('2024-01-01'),
          owner: { id: 'user-456', email: 'other@example.com' },
          sharedWith: [{ userId }],
        },
      ];

      prisma.note.findMany
        .mockResolvedValueOnce(ownedNotes)
        .mockResolvedValueOnce(sharedNotes);

      prisma.note.count
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(1);

      const result = await NotesService.getUserNotes(userId, 1, 10);

      expect(result.data[0].isPinned).toBe(true);
      expect(result.data[1].isPinned).toBe(false);
    });

    it('should support search query', async () => {
      const userId = 'user-123';
      const searchQuery = 'test';

      prisma.note.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      prisma.note.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      await NotesService.getUserNotes(userId, 1, 10, searchQuery);

      // Verify search filter was applied
      const firstCall = prisma.note.findMany.mock.calls[0][0];
      expect(firstCall.where).toHaveProperty('OR');
    });

    it('should calculate pagination correctly', async () => {
      const userId = 'user-123';

      prisma.note.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      prisma.note.count
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(0);

      const result = await NotesService.getUserNotes(userId, 2, 10);

      expect(result.page).toBe(2);
      expect(result.totalPages).toBe(5);
      expect(result.total).toBe(50);
    });
  });

  describe('getNoteById', () => {
    it('should retrieve a note owned by the user', async () => {
      const userId = 'user-123';
      const noteId = 'note-123';
      const note = {
        id: noteId,
        title: 'Test Note',
        ownerId: userId,
        owner: { id: userId, email: 'user@example.com' },
        sharedWith: [],
      };

      prisma.note.findUnique.mockResolvedValue(note);

      const result = await NotesService.getNoteById(userId, noteId);

      expect(result).toEqual({
        ...note,
        isShared: false,
      });
    });

    it('should retrieve a note shared with the user and include owner metadata', async () => {
      const userId = 'user-123';
      const noteId = 'note-123';
      const note = {
        id: noteId,
        title: 'Test Note',
        ownerId: 'user-456',
        owner: { id: 'user-456', email: 'other@example.com' },
        sharedWith: [{ userId, noteId }],
      };

      prisma.note.findUnique.mockResolvedValue(note);

      const result = await NotesService.getNoteById(userId, noteId);

      expect(result).toEqual({
        ...note,
        isShared: true,
        sharedBy: { id: 'user-456', email: 'other@example.com' },
      });
    });

    it('should throw 404 if note does not exist', async () => {
      const userId = 'user-123';
      const noteId = 'nonexistent';

      prisma.note.findUnique.mockResolvedValue(null);

      await expect(NotesService.getNoteById(userId, noteId)).rejects.toThrow(
        'Note not found'
      );
    });

    it('should throw 403 if user does not have access', async () => {
      const userId = 'user-123';
      const noteId = 'note-123';
      const note = {
        id: noteId,
        title: 'Test Note',
        ownerId: 'user-456',
        owner: { id: 'user-456', email: 'other@example.com' },
        sharedWith: [],
      };

      prisma.note.findUnique.mockResolvedValue(note);

      await expect(NotesService.getNoteById(userId, noteId)).rejects.toThrow(
        'Access denied'
      );
    });
  });

  describe('updateNote', () => {
    it('should update a note owned by the user', async () => {
      const userId = 'user-123';
      const noteId = 'note-123';
      const updateData = {
        title: 'Updated Title',
        isPinned: true,
      };

      const existingNote = {
        id: noteId,
        title: 'Old Title',
        ownerId: userId,
      };

      const updatedNote = {
        ...existingNote,
        ...updateData,
      };

      prisma.note.findUnique.mockResolvedValue(existingNote);
      prisma.note.update.mockResolvedValue(updatedNote);

      const result = await NotesService.updateNote(userId, noteId, updateData);

      expect(prisma.note.update).toHaveBeenCalledWith({
        where: { id: noteId },
        data: updateData,
      });
      expect(result).toEqual(updatedNote);
    });

    it('should throw 404 if note does not exist', async () => {
      const userId = 'user-123';
      const noteId = 'nonexistent';

      prisma.note.findUnique.mockResolvedValue(null);

      await expect(
        NotesService.updateNote(userId, noteId, { title: 'New Title' })
      ).rejects.toThrow('Note not found');
    });

    it('should throw 403 if user does not own the note', async () => {
      const userId = 'user-123';
      const noteId = 'note-123';
      const note = {
        id: noteId,
        ownerId: 'user-456',
        sharedWith: [],
      };

      prisma.note.findUnique.mockResolvedValue(note);

      await expect(
        NotesService.updateNote(userId, noteId, { title: 'New Title' })
      ).rejects.toThrow('Shared notes are read-only');
    });

    it('should only update provided fields', async () => {
      const userId = 'user-123';
      const noteId = 'note-123';
      const updateData = {
        title: 'Updated Title',
      };

      const existingNote = {
        id: noteId,
        title: 'Old Title',
        ownerId: userId,
        color: '#ffffff',
      };

      prisma.note.findUnique.mockResolvedValue(existingNote);
      prisma.note.update.mockResolvedValue({
        ...existingNote,
        ...updateData,
      });

      await NotesService.updateNote(userId, noteId, updateData);

      expect(prisma.note.update).toHaveBeenCalledWith({
        where: { id: noteId },
        data: { title: 'Updated Title' },
      });
    });
  });

  describe('deleteNote', () => {
    it('should delete a note owned by the user', async () => {
      const userId = 'user-123';
      const noteId = 'note-123';
      const note = {
        id: noteId,
        ownerId: userId,
      };

      prisma.note.findUnique.mockResolvedValue(note);
      prisma.note.delete.mockResolvedValue(note);

      await NotesService.deleteNote(userId, noteId);

      expect(prisma.note.delete).toHaveBeenCalledWith({
        where: { id: noteId },
      });
    });

    it('should throw 404 if note does not exist', async () => {
      const userId = 'user-123';
      const noteId = 'nonexistent';

      prisma.note.findUnique.mockResolvedValue(null);

      await expect(NotesService.deleteNote(userId, noteId)).rejects.toThrow(
        'Note not found'
      );
    });

    it('should throw 403 if user does not own the note', async () => {
      const userId = 'user-123';
      const noteId = 'note-123';
      const note = {
        id: noteId,
        ownerId: 'user-456',
      };

      prisma.note.findUnique.mockResolvedValue(note);

      await expect(NotesService.deleteNote(userId, noteId)).rejects.toThrow(
        'Access denied'
      );
    });
  });
});
