import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Search Service
 * Handles full-text search across notes
 */
export class SearchService {
  /**
   * Escape special characters in search query for SQL safety
   * @param {string} query - Search query
   * @returns {string} Escaped query
   */
  static escapeQuery(query) {
    if (!query || typeof query !== 'string') {
      return '';
    }

    // Escape special characters that could be used in SQL injection
    // For ILIKE queries, we need to escape % and _ characters
    return query
      .replace(/\\/g, '\\\\') // Escape backslashes first
      .replace(/%/g, '\\%')   // Escape percent signs
      .replace(/_/g, '\\_');  // Escape underscores
  }

  /**
   * Search notes for a user
   * @param {string} userId - User ID
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of matching notes
   */
  static async searchNotes(userId, query) {
    // If query is empty, return all user's notes
    if (!query || query.trim() === '') {
      return await prisma.note.findMany({
        where: {
          OR: [
            { ownerId: userId },
            {
              sharedWith: {
                some: {
                  userId: userId,
                },
              },
            },
          ],
        },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        include: {
          sharedWith: {
            where: {
              userId: userId,
            },
          },
        },
      });
    }

    // Escape query for safety
    const escapedQuery = this.escapeQuery(query);

    // Search across title and content using contains (case-insensitive)
    const results = await prisma.note.findMany({
      where: {
        AND: [
          {
            OR: [
              { ownerId: userId },
              {
                sharedWith: {
                  some: {
                    userId: userId,
                  },
                },
              },
            ],
          },
          {
            OR: [
              { title: { contains: escapedQuery, mode: 'insensitive' } },
              { content: { contains: escapedQuery, mode: 'insensitive' } },
            ],
          },
        ],
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      include: {
        sharedWith: {
          where: {
            userId: userId,
          },
        },
      },
    });

    return results;
  }

  /**
   * Search notes with pagination
   * @param {string} userId - User ID
   * @param {string} query - Search query
   * @param {number} page - Page number (1-indexed)
   * @param {number} limit - Items per page
   * @returns {Promise<{data: Array, total: number, page: number, totalPages: number}>}
   */
  static async searchNotesWithPagination(userId, query, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    // If query is empty, return all user's notes
    if (!query || query.trim() === '') {
      const total = await prisma.note.count({
        where: {
          OR: [
            { ownerId: userId },
            {
              sharedWith: {
                some: {
                  userId: userId,
                },
              },
            },
          ],
        },
      });

      const data = await prisma.note.findMany({
        where: {
          OR: [
            { ownerId: userId },
            {
              sharedWith: {
                some: {
                  userId: userId,
                },
              },
            },
          ],
        },
        skip: offset,
        take: limit,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        include: {
          sharedWith: {
            where: {
              userId: userId,
            },
          },
        },
      });

      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }

    // Escape query for safety
    const escapedQuery = this.escapeQuery(query);

    // Count total results
    const total = await prisma.note.count({
      where: {
        AND: [
          {
            OR: [
              { ownerId: userId },
              {
                sharedWith: {
                  some: {
                    userId: userId,
                  },
                },
              },
            ],
          },
          {
            OR: [
              { title: { contains: escapedQuery, mode: 'insensitive' } },
              { content: { contains: escapedQuery, mode: 'insensitive' } },
            ],
          },
        ],
      },
    });

    // Get paginated results
    const data = await prisma.note.findMany({
      where: {
        AND: [
          {
            OR: [
              { ownerId: userId },
              {
                sharedWith: {
                  some: {
                    userId: userId,
                  },
                },
              },
            ],
          },
          {
            OR: [
              { title: { contains: escapedQuery, mode: 'insensitive' } },
              { content: { contains: escapedQuery, mode: 'insensitive' } },
            ],
          },
        ],
      },
      skip: offset,
      take: limit,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      include: {
        sharedWith: {
          where: {
            userId: userId,
          },
        },
      },
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
