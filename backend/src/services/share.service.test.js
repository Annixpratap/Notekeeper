import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { ShareService } from './share.service.js';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

describe('ShareService', () => {
  let owner, recipient, note;

  beforeAll(async () => {
    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    owner = await prisma.user.create({
      data: {
        email: 'owner@test.com',
        password: hashedPassword,
      },
    });

    recipient = await prisma.user.create({
      data: {
        email: 'recipient@test.com',
        password: hashedPassword,
      },
    });

    // Create test note
    note = await prisma.note.create({
      data: {
        title: 'Test Note',
        content: 'Test content',
        ownerId: owner.id,
      },
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.noteShare.deleteMany({});
    await prisma.note.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('shareNote', () => {
    it('should share a note with a valid recipient', async () => {
      const share = await ShareService.shareNote(owner.id, note.id, recipient.email);
      expect(share).toBeDefined();
      expect(share.noteId).toBe(note.id);
      expect(share.userId).toBe(recipient.id);
      expect(share.ownerId).toBe(owner.id);
    });

    it('should reject sharing with non-existent recipient', async () => {
      const note2 = await prisma.note.create({
        data: {
          title: 'Test Note 2',
          content: 'Test content',
          ownerId: owner.id,
        },
      });

      await expect(
        ShareService.shareNote(owner.id, note2.id, 'nonexistent@test.com')
      ).rejects.toThrow('Recipient not found');
    });

    it('should reject sharing with self', async () => {
      const note2 = await prisma.note.create({
        data: {
          title: 'Test Note 2',
          content: 'Test content',
          ownerId: owner.id,
        },
      });

      await expect(
        ShareService.shareNote(owner.id, note2.id, owner.email)
      ).rejects.toThrow('Cannot share note with yourself');
    });

    it('should reject sharing already shared note', async () => {
      await expect(
        ShareService.shareNote(owner.id, note.id, recipient.email)
      ).rejects.toThrow('Note already shared with this user');
    });

    it('should reject non-owner sharing', async () => {
      const note2 = await prisma.note.create({
        data: {
          title: 'Test Note 2',
          content: 'Test content',
          ownerId: owner.id,
        },
      });

      const other = await prisma.user.create({
        data: {
          email: 'other@test.com',
          password: await bcrypt.hash('password123', 12),
        },
      });

      await expect(
        ShareService.shareNote(other.id, note2.id, recipient.email)
      ).rejects.toThrow('Access denied');
    });

    it('should reject sharing non-existent note', async () => {
      await expect(
        ShareService.shareNote(owner.id, 'nonexistent', recipient.email)
      ).rejects.toThrow('Note not found');
    });
  });

  describe('getSharedNotes', () => {
    it('should return notes shared with user', async () => {
      const sharedNotes = await ShareService.getSharedNotes(recipient.id);
      expect(Array.isArray(sharedNotes)).toBe(true);
      expect(sharedNotes.length).toBeGreaterThan(0);
      expect(sharedNotes[0].id).toBe(note.id);
    });

    it('should return empty array for user with no shared notes', async () => {
      const other = await prisma.user.create({
        data: {
          email: 'other2@test.com',
          password: await bcrypt.hash('password123', 12),
        },
      });

      const sharedNotes = await ShareService.getSharedNotes(other.id);
      expect(Array.isArray(sharedNotes)).toBe(true);
      expect(sharedNotes.length).toBe(0);
    });
  });

  describe('revokeShare', () => {
    it('should revoke share access', async () => {
      const note2 = await prisma.note.create({
        data: {
          title: 'Test Note 2',
          content: 'Test content',
          ownerId: owner.id,
        },
      });

      // Share note
      await ShareService.shareNote(owner.id, note2.id, recipient.email);

      // Verify share exists
      let shares = await prisma.noteShare.findMany({
        where: { noteId: note2.id, userId: recipient.id },
      });
      expect(shares.length).toBe(1);

      // Revoke share
      await ShareService.revokeShare(owner.id, note2.id, recipient.id);

      // Verify share is deleted
      shares = await prisma.noteShare.findMany({
        where: { noteId: note2.id, userId: recipient.id },
      });
      expect(shares.length).toBe(0);
    });

    it('should reject revoking from non-owner', async () => {
      const other = await prisma.user.create({
        data: {
          email: 'other3@test.com',
          password: await bcrypt.hash('password123', 12),
        },
      });

      await expect(
        ShareService.revokeShare(other.id, note.id, recipient.id)
      ).rejects.toThrow('Access denied');
    });

    it('should reject revoking from non-existent note', async () => {
      await expect(
        ShareService.revokeShare(owner.id, 'nonexistent', recipient.id)
      ).rejects.toThrow('Note not found');
    });
  });

  describe('hasAccess', () => {
    it('should return true for owner', async () => {
      const hasAccess = await ShareService.hasAccess(owner.id, note.id);
      expect(hasAccess).toBe(true);
    });

    it('should return true for recipient with share', async () => {
      const hasAccess = await ShareService.hasAccess(recipient.id, note.id);
      expect(hasAccess).toBe(true);
    });

    it('should return false for user without access', async () => {
      const other = await prisma.user.create({
        data: {
          email: 'other4@test.com',
          password: await bcrypt.hash('password123', 12),
        },
      });

      const hasAccess = await ShareService.hasAccess(other.id, note.id);
      expect(hasAccess).toBe(false);
    });

    it('should return false for non-existent note', async () => {
      const hasAccess = await ShareService.hasAccess(owner.id, 'nonexistent');
      expect(hasAccess).toBe(false);
    });
  });

  describe('isOwner', () => {
    it('should return true for owner', async () => {
      const isOwner = await ShareService.isOwner(owner.id, note.id);
      expect(isOwner).toBe(true);
    });

    it('should return false for non-owner', async () => {
      const isOwner = await ShareService.isOwner(recipient.id, note.id);
      expect(isOwner).toBe(false);
    });

    it('should return false for non-existent note', async () => {
      const isOwner = await ShareService.isOwner(owner.id, 'nonexistent');
      expect(isOwner).toBe(false);
    });
  });

  describe('getShareInfo', () => {
    it('should return share information for a note', async () => {
      const shareInfo = await ShareService.getShareInfo(note.id);
      expect(Array.isArray(shareInfo)).toBe(true);
      expect(shareInfo.length).toBeGreaterThan(0);
      expect(shareInfo[0].user.email).toBe(recipient.email);
    });

    it('should return empty array for note with no shares', async () => {
      const note2 = await prisma.note.create({
        data: {
          title: 'Test Note 2',
          content: 'Test content',
          ownerId: owner.id,
        },
      });

      const shareInfo = await ShareService.getShareInfo(note2.id);
      expect(Array.isArray(shareInfo)).toBe(true);
      expect(shareInfo.length).toBe(0);
    });
  });
});
