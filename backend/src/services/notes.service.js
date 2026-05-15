import { PrismaClient } from '@prisma/client';
import { BlockService } from './block.service.js';

const prisma = new PrismaClient();

/**
 * Notes Service
 * Handles CRUD operations for notes and access control
 */
export class NotesService {
  /**
   * Create a new note
   * @param {string} userId - Owner user ID
   * @param {Object} data - Note data
   * @returns {Promise<Object>} Created note
   */
  static async createNote(userId, data) {
    // Generate content from blocks if provided
    const blocks = data.blocks || [];
    const content = BlockService.generateContent(blocks);

    const note = await prisma.note.create({
      data: {
        title: data.title,
        content: content,
        blocks: blocks,
        color: data.color || '#ffffff',
        tags: data.tags || [],
        isPinned: data.isPinned || false,
        ownerId: userId,
      },
    });

    return note;
  }

  /**
   * Get all notes for a user (owned + shared)
   * @param {string} userId - User ID
   * @param {number} page - Page number (1-indexed)
   * @param {number} limit - Items per page
   * @param {string} q - Search query (optional)
   * @returns {Promise<{data: Array, total: number, page: number, totalPages: number}>}
   */
  static async getUserNotes(userId, page = 1, limit = 10, q = '') {
    const offset = (page - 1) * limit;

    // Build search filter
    const searchFilter = q
      ? {
          OR: [
            { title: { ilike: `%${q}%` } },
            { content: { ilike: `%${q}%` } },
          ],
        }
      : {};

    // Get owned notes
    const ownedNotes = await prisma.note.findMany({
      where: {
        ownerId: userId,
        ...searchFilter,
      },
      skip: offset,
      take: limit,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      include: {
        owner: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    // Get shared notes with owner information
    const sharedNotes = await prisma.note.findMany({
      where: {
        sharedWith: {
          some: {
            userId: userId,
          },
        },
        ...searchFilter,
      },
      skip: offset,
      take: limit,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      include: {
        owner: {
          select: {
            id: true,
            email: true,
          },
        },
        sharedWith: {
          where: {
            userId: userId,
          },
        },
      },
    });

    // Mark shared notes with owner metadata
    const sharedNotesWithMetadata = sharedNotes.map((note) => ({
      ...note,
      sharedBy: {
        id: note.owner.id,
        email: note.owner.email,
      },
      isShared: true,
    }));

    // Mark owned notes as not shared
    const ownedNotesWithMetadata = ownedNotes.map((note) => ({
      ...note,
      isShared: false,
    }));

    // Combine and deduplicate
    const allNotes = [...ownedNotesWithMetadata, ...sharedNotesWithMetadata];
    const uniqueNotes = Array.from(
      new Map(allNotes.map((note) => [note.id, note])).values()
    );

    // Sort combined results
    uniqueNotes.sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return b.isPinned - a.isPinned;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Get total count
    const ownedCount = await prisma.note.count({
      where: {
        ownerId: userId,
        ...searchFilter,
      },
    });

    const sharedCount = await prisma.note.count({
      where: {
        sharedWith: {
          some: {
            userId: userId,
          },
        },
        ...searchFilter,
      },
    });

    const total = ownedCount + sharedCount;
    const totalPages = Math.ceil(total / limit);

    return {
      data: uniqueNotes.slice(0, limit),
      total,
      page,
      totalPages,
    };
  }

  /**
   * Get a single note by ID
   * @param {string} userId - User ID (for access control)
   * @param {string} noteId - Note ID
   * @returns {Promise<Object>} Note with all blocks
   * @throws {Error} If note not found or user doesn't have access
   */
  static async getNoteById(userId, noteId) {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
          },
        },
        sharedWith: true,
      },
    });

    if (!note) {
      const error = new Error('Note not found');
      error.statusCode = 404;
      throw error;
    }

    // Check access: user must own note or have share access
    const isOwner = note.ownerId === userId;
    const hasShareAccess = note.sharedWith.some((share) => share.userId === userId);

    if (!isOwner && !hasShareAccess) {
      const error = new Error('Access denied');
      error.statusCode = 403;
      throw error;
    }

    // Add metadata for shared notes
    const noteWithMetadata = {
      ...note,
      isShared: !isOwner,
    };

    // If note is shared with user, include owner information
    if (!isOwner) {
      noteWithMetadata.sharedBy = {
        id: note.owner.id,
        email: note.owner.email,
      };
    }

    return noteWithMetadata;
  }

  /**
   * Update a note
   * @param {string} userId - User ID (for access control)
   * @param {string} noteId - Note ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated note
   * @throws {Error} If note not found or user doesn't own it
   */
  static async updateNote(userId, noteId, data) {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: {
        sharedWith: true,
      },
    });

    if (!note) {
      const error = new Error('Note not found');
      error.statusCode = 404;
      throw error;
    }

    // Only owner can update (shared notes are read-only)
    if (note.ownerId !== userId) {
      const error = new Error('Shared notes are read-only');
      error.statusCode = 403;
      throw error;
    }

    // Build update data
    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.blocks !== undefined) {
      updateData.blocks = data.blocks;
      // Generate content from blocks
      updateData.content = BlockService.generateContent(data.blocks);
    }
    if (data.color !== undefined) updateData.color = data.color;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.isPinned !== undefined) updateData.isPinned = data.isPinned;

    // Update note
    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data: updateData,
    });

    return updatedNote;
  }

  /**
   * Delete a note
   * @param {string} userId - User ID (for access control)
   * @param {string} noteId - Note ID
   * @throws {Error} If note not found or user doesn't own it
   */
  static async deleteNote(userId, noteId) {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: {
        sharedWith: true,
      },
    });

    if (!note) {
      const error = new Error('Note not found');
      error.statusCode = 404;
      throw error;
    }

    // Only owner can delete (shared notes are read-only)
    if (note.ownerId !== userId) {
      const error = new Error('Shared notes are read-only');
      error.statusCode = 403;
      throw error;
    }

    // Delete note (cascades to NoteShare records)
    await prisma.note.delete({
      where: { id: noteId },
    });
  }
}
