# Notes App Backend

A production-ready Express.js backend for the Notes App with PostgreSQL, Prisma ORM, JWT authentication, Notion-style block editor, and comprehensive middleware stack.

## Project Structure

```
backend/
├── src/
│   ├── app.js                 # Express app configuration
│   ├── server.js              # Server entry point
│   ├── middleware/            # Middleware stack
│   │   ├── auth.js            # JWT authentication middleware
│   │   ├── bodyParser.js      # JSON body parser
│   │   ├── cors.js            # CORS configuration
│   │   ├── errorHandler.js    # Global error handler
│   │   ├── logger.js          # Request logging
│   │   ├── rateLimiter.js     # Rate limiting (100 req/15min)
│   │   └── validation.js      # Zod validation middleware
│   ├── schemas/               # Zod validation schemas
│   │   ├── auth.js            # Auth request schemas
│   │   ├── block.js           # Block validation schemas
│   │   ├── note.js            # Note request schemas
│   │   ├── pagination.js      # Pagination schemas
│   │   └── share.js           # Share request schemas
│   ├── utils/                 # Utility functions
│   │   ├── jwt.js             # JWT token generation/validation
│   │   └── password.js        # Password hashing/comparison
│   ├── routes/                # API route handlers (to be implemented)
│   ├── controllers/           # Route controllers (to be implemented)
│   └── services/              # Business logic services (to be implemented)
├── prisma/
│   └── schema.prisma          # Prisma database schema
├── .env                       # Environment variables (development)
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## Technology Stack

- **Framework**: Express.js 4.18.2
- **Database**: PostgreSQL with Prisma ORM 5.7.1
- **Authentication**: JWT (jsonwebtoken 9.0.3)
- **Password Hashing**: bcrypt 5.1.1 (12 salt rounds)
- **Validation**: Zod 3.22.4
- **Rate Limiting**: express-rate-limit 7.1.5
- **CORS**: cors 2.8.5
- **HTTP Client**: axios 1.6.2
- **Documentation**: swagger-ui-express 5.0.0
- **Environment**: dotenv 16.3.1

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- Git

### Installation

1. **Clone the repository** (if applicable)
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/notes_app"
   JWT_SECRET="your-super-secret-key"
   PORT=5000
   NODE_ENV="development"
   CORS_ORIGIN="http://localhost:5173"
   ```

4. **Set up the database**
   ```bash
   npm run prisma:migrate
   ```

5. **Generate Prisma Client**
   ```bash
   npm run prisma:generate
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm start` - Start production server
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:seed` - Seed database with demo data
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint

## API Endpoints

### Health & Documentation
- `GET /health` - Server health check
- `GET /about` - App information with features
- `GET /openapi.json` - OpenAPI 3.0 specification

### Authentication
- `POST /register` - User registration (email, password)
- `POST /login` - User login (returns JWT token)

### Notes (CRUD)
- `GET /notes` - Get user's notes with pagination (page, limit)
- `POST /notes` - Create a new note (title, content, blocks)
- `GET /notes/{id}` - Get a specific note
- `PUT /notes/{id}` - Update a note (title, content, blocks)
- `DELETE /notes/{id}` - Delete a note

### Search
- `GET /search?q=keyword` - Full-text search across notes (case-insensitive)

### Note Sharing
- `POST /notes/{id}/share` - Share a note with another user (share_with_email)

## Features Implemented

### Core Features (Required)
✅ User registration with email and password validation
✅ JWT-based authentication with 24-hour token expiry
✅ CRUD operations for notes
✅ Note sharing with other users (read-only access)
✅ Full-text search across note titles and content
✅ Pagination support on GET /notes endpoint
✅ OpenAPI/Swagger documentation
✅ About endpoint with app information

### Special Feature (Notion-style Block Editor)
✅ Block-based note structure with JSON storage
✅ 8 block types: text, heading1, heading2, bullet, todo, code, divider, quote
✅ Auto-generated plain-text content field for search indexing
✅ Block metadata (id, type, content, checked status)

### Stretch Goals
✅ Pagination on GET /notes API
✅ Full-text search endpoint (GET /search?q=keyword)
✅ Docker containerization
✅ Frontend integration (React with Vite)

## Middleware Stack

The middleware is applied in the following order:

1. **Logger Middleware** - Logs all incoming requests and response times
2. **CORS Middleware** - Allows cross-origin requests from configured origin
3. **Rate Limiter** - Limits to 100 requests per 15 minutes per IP
4. **Body Parser** - Parses JSON request bodies (10MB limit)
5. **Auth Middleware** - Validates JWT tokens on protected routes
6. **Validation Middleware** - Validates request bodies against Zod schemas
7. **Global Error Handler** - Catches and formats all errors

## Authentication

### JWT Token Generation
- Tokens are generated with 24-hour expiry
- Tokens are signed with `JWT_SECRET` from environment variables
- Tokens contain the user ID in the payload

### Password Hashing
- Passwords are hashed using bcrypt with 12 salt rounds
- Passwords are never stored in plain text
- Passwords are never returned in API responses

### Protected Routes
Protected routes require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

## Error Handling

All errors are formatted consistently:

```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/auth/register"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Validation Error
- `401` - Authentication Error
- `403` - Authorization Error
- `404` - Not Found
- `409` - Conflict
- `429` - Rate Limited
- `500` - Server Error

## Database Schema

### User Model
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  
  notes      Note[]
  sharedWith NoteShare[] @relation("recipient")
  sharedBy   NoteShare[] @relation("owner")
}
```

### Note Model
```prisma
model Note {
  id        String   @id @default(cuid())
  title     String
  content   String   @default("")
  blocks    Json     @default("[]")
  color     String   @default("#ffffff")
  tags      String[] @default([])
  isPinned  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  ownerId   String
  owner     User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  
  sharedWith NoteShare[]
  
  @@index([ownerId])
  @@index([createdAt])
}
```

### NoteShare Model
```prisma
model NoteShare {
  id        String   @id @default(cuid())
  noteId    String
  note      Note     @relation(fields: [noteId], references: [id], onDelete: Cascade)
  
  userId    String
  user      User     @relation("recipient", fields: [userId], references: [id], onDelete: Cascade)
  
  ownerId   String
  owner     User     @relation("owner", fields: [ownerId], references: [id], onDelete: Cascade)
  
  sharedAt  DateTime @default(now())
  
  @@unique([noteId, userId])
  @@index([userId])
}
```

## Block Structure

Each block in the `blocks` JSON array has the following structure:

```json
{
  "id": "uuid-string",
  "type": "text|heading1|heading2|bullet|todo|code|divider|quote",
  "content": "string",
  "checked": false,
  "language": "javascript"
}
```

## Validation Schemas

### Auth Schemas
- `RegisterRequest` - Email (valid format) + Password (8+ characters)
- `LoginRequest` - Email (valid format) + Password (required)

### Note Schemas
- `CreateNoteRequest` - Title (required, non-empty) + optional blocks, color, tags, isPinned
- `UpdateNoteRequest` - All fields optional

### Block Schemas
- `Block` - id, type (text|heading1|heading2|bullet|todo|code|divider|quote), content, optional checked/language
- `BlockArray` - Array of Block objects

### Other Schemas
- `ShareRequest` - share_with_email (valid email format)
- `PaginationParams` - page (≥1, default 1), limit (1-100, default 10)

## Development

### Adding New Routes

1. Create a route file in `src/routes/`
2. Create a controller in `src/controllers/`
3. Create a service in `src/services/` for business logic
4. Import and register the route in `src/app.js`

Example:
```javascript
// src/routes/auth.js
import express from 'express';
import { registerUser, loginUser } from '../controllers/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { RegisterRequestSchema, LoginRequestSchema } from '../schemas/auth.js';

const router = express.Router();

router.post('/register', validateRequest(RegisterRequestSchema), registerUser);
router.post('/login', validateRequest(LoginRequestSchema), loginUser);

export default router;
```

### Testing

Run tests with:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Deployment

### Deployed Backend
- **URL**: https://notekeeper-7bn4.onrender.com
- **Platform**: Render.com
- **Database**: PostgreSQL on Render

### Environment Variables for Production

```env
DATABASE_URL="postgresql://user:password@prod-db:5432/notes_app"
JWT_SECRET="production-secret-key-min-32-chars"
PORT=5000
NODE_ENV="production"
CORS_ORIGIN="https://notekeeper-1-x6wo.onrender.com"
```

### Docker Deployment

A Dockerfile is provided for containerization. Build and run:
```bash
docker build -t notes-app-backend .
docker run -p 5000:5000 --env-file .env notes-app-backend
```

### Render.com Deployment

A `render.yaml` configuration file is provided. Deploy with:
```bash
git push origin main
```

The deployment will automatically:
1. Install dependencies
2. Run Prisma migrations
3. Generate Prisma Client
4. Start the server

## Security Considerations

- JWT secrets should be at least 32 characters in production
- Passwords are hashed with bcrypt (12 salt rounds)
- Rate limiting prevents brute force attacks
- CORS is configured to only allow requests from the frontend origin
- All inputs are validated with Zod before processing
- SQL injection is prevented by Prisma's parameterized queries
- Sensitive data (passwords) is never returned in API responses

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists: `createdb notes_app`

### Port Already in Use
- Change PORT in .env
- Or kill the process: `lsof -ti:5000 | xargs kill -9`

### Prisma Migration Issues
- Reset database: `npx prisma migrate reset`
- Check schema.prisma for syntax errors

### JWT Token Errors
- Verify JWT_SECRET is set in .env
- Check token format: `Authorization: Bearer <token>`
- Tokens expire after 24 hours

### Search Not Working
- Ensure notes have content in title or content fields
- Search is case-insensitive
- Empty search query returns all user's notes

## Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Submit a pull request

## License

MIT
