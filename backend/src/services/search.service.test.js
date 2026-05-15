import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { SearchService } from './search.service.js';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

describe('SearchService', () => {
  let user, note1, note2, note3;

  beforeAll(async () => {
    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 12);
    user = await prisma.user.create({
      data: {
        email: 'search@test.com',
        password: hashedPassword,
      },
    });

    // Create test notes
    note1 = await prisma.note.create({
      data: {
        title: 'JavaScript Tutorial',
        content: 'Learn JavaScript basics',
        ownerId: user.id,
      },
    });

    note2 = await prisma.note.create({
      data: {
        title: 'Python Guide',
        content: 'Python programming language',
        ownerId: user.id,
      },
    });

    note3 = await prisma.note.create({
      data: {
        title: 'Web Development',
        content: 'JavaScript and HTML for web development',
        ownerId: user.id,
      },
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.note.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('escapeQuery', () => {
    it('should escape percent signs', () => {
      const escaped = SearchService.escapeQuery('test%query');
      expect(escaped).toBe('test\\%query');
    });

    it('should escape underscores', () => {
      const escaped = SearchService.escapeQuery('test_query');
      expect(escaped).toBe('test\\_query');
    });

    it('should escape backslashes', () => {
      const escaped = SearchService.escapeQuery('test\\query');
      expect(escaped).toBe('test\\\\query');
    });

    it('should escape multiple special characters', () => {
      const escaped = SearchService.escapeQuery('test%_\\query');
      expect(escaped).toBe('test\\%\\_\\\\query');
    });

    it('should handle empty string', () => {
      const escaped = SearchService.escapeQuery('');
      expect(escaped).toBe('');
    });

    it('should handle null', () => {
      const escaped = SearchService.escapeQuery(null);
      expect(escaped).toBe('');
    });

    it('should handle non-string input', () => {
      const escaped = SearchService.escapeQuery(123);
      expect(escaped).toBe('');
    });

    it('should not escape normal characters', () => {
      const escaped = SearchService.escapeQuery('normal query');
      expect(escaped).toBe('normal query');
    });
  });

  describe('searchNotes', () => {
    it('should find notes by title', async () => {
      const results = await SearchService.searchNotes(user.id, 'JavaScript');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((n) => n.id === note1.id)).toBe(true);
      expect(results.some((n) => n.id === note3.id)).toBe(true);
    });

    it('should find notes by content', async () => {
      const results = await SearchService.searchNotes(user.id, 'Python');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((n) => n.id === note2.id)).toBe(true);
    });

    it('should be case-insensitive', async () => {
      const results = await SearchService.searchNotes(user.id, 'javascript');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((n) => n.id === note1.id)).toBe(true);
    });

    it('should return empty array for no matches', async () => {
      const results = await SearchService.searchNotes(user.id, 'nonexistent');
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it('should return all notes for empty query', async () => {
      const results = await SearchService.searchNotes(user.id, '');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return all notes for null query', async () => {
      const results = await SearchService.searchNotes(user.id, null);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle special characters in query', async () => {
      const results = await SearchService.searchNotes(user.id, 'test%query');
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('searchNotesWithPagination', () => {
    it('should return paginated results', async () => {
      const result = await SearchService.searchNotesWithPagination(user.id, '', 1, 2);
      expect(result.data).toBeDefined();
      expect(result.total).toBeDefined();
      expect(result.page).toBe(1);
      expect(result.totalPages).toBeDefined();
      expect(result.data.length).toBeLessThanOrEqual(2);
    });

    it('should calculate correct total pages', async () => {
      const result = await SearchService.searchNotesWithPagination(user.id, '', 1, 1);
      expect(result.totalPages).toBe(3);
    });

    it('should return correct page', async () => {
      const page1 = await SearchService.searchNotesWithPagination(user.id, '', 1, 1);
      const page2 = await SearchService.searchNotesWithPagination(user.id, '', 2, 1);
      expect(page1.data[0].id).not.toBe(page2.data[0].id);
    });

    it('should search with pagination', async () => {
      const result = await SearchService.searchNotesWithPagination(user.id, 'JavaScript', 1, 10);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
    });

    it('should return empty results for no matches', async () => {
      const result = await SearchService.searchNotesWithPagination(user.id, 'nonexistent', 1, 10);
      expect(result.data.length).toBe(0);
      expect(result.total).toBe(0);
    });
  });
});
