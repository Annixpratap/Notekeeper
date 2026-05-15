import { SearchService } from '../services/search.service.js';
import { z } from 'zod';

/**
 * Search Controller
 * Handles search endpoints
 */

// Validation schema for search query
const SearchQuerySchema = z.object({
  q: z.string().optional().default(''),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

/**
 * Search notes
 * GET /search?q=keyword&page=1&limit=10
 */
export const searchNotes = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Validate query parameters
    const validatedParams = SearchQuerySchema.parse(req.query);

    // Search notes with pagination
    const result = await SearchService.searchNotesWithPagination(
      userId,
      validatedParams.q,
      validatedParams.page,
      validatedParams.limit
    );

    res.status(200).json({
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: validatedParams.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};
