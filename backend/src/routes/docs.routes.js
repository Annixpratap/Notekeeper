import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { getOpenAPISpec, getAbout, getOpenAPISpecObject } from '../controllers/docs.controller.js';

const router = express.Router();

/**
 * GET /openapi.json
 * Get OpenAPI 3.0 specification
 */
router.get('/openapi.json', getOpenAPISpec);

/**
 * GET /docs
 * Swagger UI documentation
 * Serves the Swagger UI interface with the OpenAPI specification
 * Allows developers to test API endpoints directly from the browser
 */
router.use('/docs', swaggerUi.serve);
router.get('/docs', (req, res, next) => {
  try {
    // Get the OpenAPI spec object
    const spec = getOpenAPISpecObject(req);
    
    // Serve Swagger UI with the spec
    swaggerUi.setup(spec, {
      customCss: '.swagger-ui { font-family: "DM Mono", monospace; }',
      customSiteTitle: 'Notes App API Documentation',
      swaggerOptions: {
        persistAuthorization: true,
        displayOperationId: false,
        filter: true,
        showExtensions: false,
        deepLinking: true,
      },
    })(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /about
 * Get about information
 */
router.get('/about', getAbout);

export default router;
