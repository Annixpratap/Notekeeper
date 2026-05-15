import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Share Service
 * Handles note sharing and access control
 */
export class ShareService {
  /**
   * Share a note with another user
   * @param {string} ownerId - Owner user ID
   * @param {string} noteId - Note ID
   * @param {string} recipientEmail - Recipient email
   * @returns {Promise<Object>} Created NoteShare record
   * @throws {Error} If note not found, recipient not found, or already shared
   */
  static async shareNote(ownerId, noteId, recipientEmail) {
    // Verify note exists and user owns it
    const note = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      const error = new Error('Note not found');
      error.statusCode = 404;
      throw error;
    }

    if (note.ownerId !== ownerId) {
      const error = new Error('Access denied');
      error.statusCode = 403;
      throw error;
    }

    // Verify recipient exists
    const recipient = await prisma.user.findUnique({
      where: { email: recipientEmail },
    });

    if (!recipient) {
      const error = new Error('Recipient not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if sharing with self
    if (recipient.id === ownerId) {
      const error = new Error('Cannot share note with yourself');
      error.statusCode = 400;
      throw error;
    }

    // Check if already shared
    const existingShare = await prisma.noteShare.findUnique({
      where: {
        noteId_userId: {
          noteId: noteId,
          userId: recipient.id,
        },
      },
    });

    if (existingShare) {
      const error = new Error('Note already shared with this user');
      error.statusCode = 409;
      throw error;
    }

    // Create share record
    const noteShare = await prisma.noteShare.create({
      data: {
        noteId: noteId,
        userId: recipient.id,
        ownerId: ownerId,
      },
    });

    return noteShare;
  }

  /**
   * Get all notes shared with a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of shared notes
   */
  static async getSharedNotes(userId) {
    const sharedNotes = await prisma.note.findMany({
      where: {
        sharedWith: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        sharedWith: {
          where: {
            userId: userId,
          },
        },
      },
    });

    return sharedNotes;
  }

  /**
   * Revoke share access
   * @param {string} ownerId - Owner user ID
   * @param {string} noteId - Note ID
   * @param {string} userId - User ID to revoke access from
   * @throws {Error} If note not found or user doesn't own it
   */
  static async revokeShare(ownerId, noteId, userId) {
    // Verify note exists and user owns it
    const note = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      const error = new Error('Note not found');
      error.statusCode = 404;
      throw error;
    }

    if (note.ownerId !== ownerId) {
      const error = new Error('Access denied');
      error.statusCode = 403;
      throw error;
    }

    // Delete share record
    await prisma.noteShare.deleteMany({
      where: {
        noteId: noteId,
        userId: userId,
      },
    });
  }

  /**
   * Check if user has access to a note (owner or shared)
   * @param {string} userId - User ID
   * @param {string} noteId - Note ID
   * @returns {Promise<boolean>} True if user has access
   */
  static async hasAccess(userId, noteId) {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: {
        sharedWith: {
          where: {
            userId: userId,
          },
        },
      },
    });

    if (!note) {
      return false;
    }

    // User has access if they own it or it's shared with them
    return note.ownerId === userId || note.sharedWith.length > 0;
  }

  /**
   * Check if user is owner of a note
   * @param {string} userId - User ID
   * @param {string} noteId - Note ID
   * @returns {Promise<boolean>} True if user owns the note
   */
  static async isOwner(userId, noteId) {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      return false;
    }

    return note.ownerId === userId;
  }

  /**
   * Get share information for a note
   * @param {string} noteId - Note ID
   * @returns {Promise<Array>} Array of share records with user info
   */
  static async getShareInfo(noteId) {
    const shares = await prisma.noteShare.findMany({
      where: { noteId: noteId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return shares;
  }
}
