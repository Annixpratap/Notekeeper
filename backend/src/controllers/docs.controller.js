/**
 * Docs Controller
 * Handles API documentation endpoints
 */

/**
 * Generate OpenAPI 3.0 specification object
 * Used by both the /openapi.json endpoint and Swagger UI
 */
export const getOpenAPISpecObject = (req) => {
  const baseUrl = req ? `${req.protocol}://${req.get('host')}` : (process.env.API_URL || 'http://localhost:5000');
  
  return {
    openapi: '3.0.0',
    info: {
      title: 'Notes App API',
      description: 'A production-grade notes application with block editor, sharing, and search',
      version: '1.0.0',
      contact: {
        name: 'Notes App Team',
      },
    },
    servers: [
      {
        url: baseUrl,
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
          },
        },
        Block: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: {
              type: 'string',
              enum: ['text', 'heading1', 'heading2', 'bullet', 'todo', 'code', 'divider', 'quote'],
            },
            content: { type: 'string' },
            checked: { type: 'boolean' },
            language: { type: 'string' },
          },
          required: ['id', 'type', 'content'],
        },
        Note: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string' },
            blocks: {
              type: 'array',
              items: { $ref: '#/components/schemas/Block' },
            },
            color: { type: 'string' },
            tags: {
              type: 'array',
              items: { type: 'string' },
            },
            isPinned: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            ownerId: { type: 'string' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    paths: {
      '/auth/register': {
        post: {
          summary: 'Register a new user',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                  },
                  required: ['email', 'password'],
                },
              },
            },
          },
          responses: {
            201: {
              description: 'User registered successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                      user: { $ref: '#/components/schemas/User' },
                      access_token: { type: 'string' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/auth/login': {
        post: {
          summary: 'Login user',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                  },
                  required: ['email', 'password'],
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                      user: { $ref: '#/components/schemas/User' },
                      access_token: { type: 'string' },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Invalid credentials',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/notes': {
        post: {
          summary: 'Create a new note',
          tags: ['Notes'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    blocks: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Block' },
                    },
                    color: { type: 'string' },
                    tags: { type: 'array', items: { type: 'string' } },
                    isPinned: { type: 'boolean' },
                  },
                  required: ['title'],
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Note created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Note' },
                },
              },
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            401: {
              description: 'Unauthorized',
            },
          },
        },
        get: {
          summary: 'Get all notes for authenticated user',
          tags: ['Notes'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 10, maximum: 100 },
            },
          ],
          responses: {
            200: {
              description: 'Notes retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Note' },
                      },
                      pagination: {
                        type: 'object',
                        properties: {
                          total: { type: 'integer' },
                          page: { type: 'integer' },
                          limit: { type: 'integer' },
                          totalPages: { type: 'integer' },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized',
            },
          },
        },
      },
      '/notes/{id}': {
        get: {
          summary: 'Get a single note by ID',
          tags: ['Notes'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: {
              description: 'Note retrieved successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Note' },
                },
              },
            },
            401: {
              description: 'Unauthorized',
            },
            403: {
              description: 'Access denied',
            },
            404: {
              description: 'Note not found',
            },
          },
        },
        put: {
          summary: 'Update a note',
          tags: ['Notes'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    blocks: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Block' },
                    },
                    color: { type: 'string' },
                    tags: { type: 'array', items: { type: 'string' } },
                    isPinned: { type: 'boolean' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Note updated successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Note' },
                },
              },
            },
            401: {
              description: 'Unauthorized',
            },
            403: {
              description: 'Access denied',
            },
            404: {
              description: 'Note not found',
            },
          },
        },
        delete: {
          summary: 'Delete a note',
          tags: ['Notes'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            204: {
              description: 'Note deleted successfully',
            },
            401: {
              description: 'Unauthorized',
            },
            403: {
              description: 'Access denied',
            },
            404: {
              description: 'Note not found',
            },
          },
        },
      },
      '/notes/{id}/share': {
        post: {
          summary: 'Share a note with another user',
          tags: ['Sharing'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    share_with_email: { type: 'string', format: 'email' },
                  },
                  required: ['share_with_email'],
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Note shared successfully',
            },
            401: {
              description: 'Unauthorized',
            },
            403: {
              description: 'Access denied',
            },
            404: {
              description: 'Note or recipient not found',
            },
          },
        },
      },
      '/search': {
        get: {
          summary: 'Search notes',
          tags: ['Search'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'q',
              in: 'query',
              schema: { type: 'string' },
              description: 'Search query',
            },
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 10, maximum: 100 },
            },
          ],
          responses: {
            200: {
              description: 'Search results',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Note' },
                      },
                      pagination: {
                        type: 'object',
                        properties: {
                          total: { type: 'integer' },
                          page: { type: 'integer' },
                          limit: { type: 'integer' },
                          totalPages: { type: 'integer' },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized',
            },
          },
        },
      },
      '/about': {
        get: {
          summary: 'Get about information',
          tags: ['Info'],
          responses: {
            200: {
              description: 'About information',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      version: { type: 'string' },
                      description: { type: 'string' },
                      features: {
                        type: 'array',
                        items: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
};

/**
 * Get OpenAPI 3.0 specification
 * GET /openapi.json
 */
export const getOpenAPISpec = async (req, res, next) => {
  try {
    const spec = getOpenAPISpecObject(req);
    res.status(200).json(spec);
  } catch (error) {
    next(error);
  }
};

/**
 * Get about information
 * GET /about
 */
export const getAbout = async (req, res, next) => {
  try {
    const about = {
      name: 'Notes App',
      version: '1.0.0',
      description: 'A production-grade notes application with block editor, sharing, and search',
      features: [
        'User authentication with JWT',
        'Create, read, update, delete notes',
        'Block-based editor with 8 block types',
        'Note sharing with other users',
        'Full-text search across notes',
        'Pagination support',
        'Rate limiting',
        'CORS support',
        'OpenAPI 3.0 documentation',
      ],
      author: 'Notes App Team',
      license: 'MIT',
    };

    res.status(200).json(about);
  } catch (error) {
    next(error);
  }
};
