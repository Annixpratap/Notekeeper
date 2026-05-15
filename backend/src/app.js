import express from 'express';
import { corsMiddleware } from './middleware/cors.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { bodyParserMiddleware } from './middleware/bodyParser.js';
import { loggerMiddleware } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import notesRoutes from './routes/notes.routes.js';
import searchRoutes from './routes/search.routes.js';
import shareRoutes from './routes/share.routes.js';
import docsRoutes from './routes/docs.routes.js';

export const createApp = () => {
  const app = express();

  // Middleware stack (in order)
  app.use(loggerMiddleware);
  app.use(corsMiddleware);
  app.use(rateLimiter);
  app.use(bodyParserMiddleware);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Routes
  app.use('/auth', authRoutes);
  app.use('/notes', notesRoutes);
  app.use('/notes/:id/shares', shareRoutes);
  app.use('/search', searchRoutes);
  app.use('/', docsRoutes);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
};
