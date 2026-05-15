# Notes App - Full Stack Application

A production-ready full-stack notes application with Notion-style block editor, real-time search, and note sharing capabilities. Built with Express.js backend and React frontend.
<img width="1919" height="856" alt="image" src="https://github.com/user-attachments/assets/c992e529-592d-41de-8d67-82209fc56a66" />

<img width="1848" height="859" alt="image" src="https://github.com/user-attachments/assets/f08e6901-32cc-4e9e-9762-41eee5c268ee" />


## 🎯 Project Overview

Notes App is a multi-user notes service similar to Google Keep or Apple Notes, with advanced features like:
- Notion-style block-based editor
- Real-time full-text search
- Note sharing with other users
- JWT authentication
- Responsive design
- Auto-save functionality

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Contributing](#contributing)

## ✨ Features

### Core Features (Required)
✅ User registration and authentication
✅ JWT-based session management
✅ Create, read, update, delete notes
✅ Share notes with other users (read-only)
✅ Full-text search across notes
✅ Pagination support
✅ OpenAPI documentation
✅ About endpoint with app info

### Special Feature - Notion-style Block Editor
✅ Block-based note structure
✅ 8 block types: Text, Heading 1, Heading 2, Bullet, Todo, Code, Divider, Quote
✅ Auto-expanding textareas
✅ Seamless block navigation
✅ Todo checkboxes
✅ Code syntax highlighting

### Stretch Goals
✅ Pagination on GET /notes
✅ Full-text search (GET /search?q=keyword)
✅ Docker containerization
✅ Frontend React application
✅ Responsive design
✅ Auto-save with debouncing

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18.2
- **Database**: PostgreSQL 12+
- **ORM**: Prisma 5.7.1
- **Authentication**: JWT (jsonwebtoken 9.0.3)
- **Password Hashing**: bcrypt 5.1.1
- **Validation**: Zod 3.22.4
- **Rate Limiting**: express-rate-limit 7.1.5
- **Testing**: Vitest 1.0.0

### Frontend
- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.1
- **HTTP Client**: Axios 1.6.2
- **Styling**: Tailwind CSS 3.4.1
- **State Management**: React Context API
- **Linting**: ESLint 9.9.0

### Deployment
- **Backend**: Render.com
- **Frontend**: Render.com
- **Database**: PostgreSQL on Render
- **Containerization**: Docker

## 📁 Project Structure

```
Blocknote Editor/
├── backend/                   # Express.js backend
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── schemas/
│   │   └── utils/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── Dockerfile
│   ├── render.yaml
│   ├── package.json
│   └── README.md
│
├── frontend/                  # React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── styles/
│   │   └── utils/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── README.md
│
├── .gitignore
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL 12+ (for local development)
- Git

### Local Development Setup

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd "Blocknote Editor"
```

#### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database URL and JWT secret

# Set up database
npm run prisma:migrate

# Start development server
npm run dev
```

Backend will run on `http://localhost:5000`

#### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with backend URL (http://localhost:5000)

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

### Testing the Application

1. Open `http://localhost:5173` in your browser
2. Register a new account
3. Create a note with blocks
4. Try searching for notes
5. Share a note with another user

## 📡 API Documentation

### Base URL
- **Development**: `http://localhost:5000`
- **Production**: `https://notekeeper-7bn4.onrender.com`

### Authentication Endpoints
- `POST /register` - Register new user
- `POST /login` - Login user (returns JWT token)

### Notes Endpoints
- `GET /notes` - Get all user's notes (with pagination)
- `POST /notes` - Create new note
- `GET /notes/{id}` - Get specific note
- `PUT /notes/{id}` - Update note
- `DELETE /notes/{id}` - Delete note

### Search Endpoint
- `GET /search?q=keyword` - Search notes

### Sharing Endpoint
- `POST /notes/{id}/share` - Share note with user

### Documentation Endpoints
- `GET /health` - Health check
- `GET /about` - App information
- `GET /openapi.json` - OpenAPI specification

For detailed API documentation, see [Backend README](./backend/README.md)

## 🌐 Deployment

### Deployed URLs
- **Backend**: https://notekeeper-7bn4.onrender.com
- **Frontend**: https://notekeeper-1-x6wo.onrender.com

### Deployment Steps

#### Backend Deployment (Render.com)
1. Push code to GitHub
2. Connect repository to Render
3. Set environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `JWT_SECRET`: Secret key for JWT
   - `CORS_ORIGIN`: Frontend URL
4. Deploy automatically on push

#### Frontend Deployment (Render.com)
1. Push code to GitHub
2. Connect repository to Render
3. Set build command: `cd frontend && npm install && npm run build`
4. Set publish directory: `frontend/dist`
5. Set environment variable: `VITE_API_URL`: Backend URL
6. Deploy automatically on push

### Docker Deployment

Build and run with Docker:
```bash
# Backend
cd backend
docker build -t notes-app-backend .
docker run -p 5000:5000 --env-file .env notes-app-backend

# Frontend
cd frontend
docker build -t notes-app-frontend .
docker run -p 3000:3000 notes-app-frontend
```

## 💻 Development

### Backend Development

See [Backend README](./backend/README.md) for:
- Project structure details
- Middleware stack
- Database schema
- Validation schemas
- Testing instructions
- Troubleshooting

### Frontend Development

See [Frontend README](./frontend/README.md) for:
- Component architecture
- Hooks documentation
- Styling guide
- Performance optimizations
- Troubleshooting

### Adding Features

1. **Backend**:
   - Create route in `backend/src/routes/`
   - Create controller in `backend/src/controllers/`
   - Create service in `backend/src/services/`
   - Add validation schema in `backend/src/schemas/`

2. **Frontend**:
   - Create component in `frontend/src/components/`
   - Create hook in `frontend/src/hooks/` if needed
   - Add styles with Tailwind CSS
   - Test with backend API

### Testing

```bash
# Backend tests
cd backend
npm test

# Frontend (manual testing recommended)
cd frontend
npm run dev
```

## 🔒 Security

- JWT tokens with 24-hour expiry
- Bcrypt password hashing (12 salt rounds)
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Input validation with Zod
- SQL injection prevention via Prisma
- Sensitive data never returned in responses

## 📊 Database Schema

### User
- id (unique identifier)
- email (unique)
- password (hashed)
- createdAt

### Note
- id (unique identifier)
- title
- content (auto-generated from blocks)
- blocks (JSON array)
- color
- tags
- isPinned
- ownerId (foreign key)
- createdAt
- updatedAt

### NoteShare
- id (unique identifier)
- noteId (foreign key)
- userId (recipient, foreign key)
- ownerId (sharer, foreign key)
- sharedAt

## 🐛 Troubleshooting

### Backend Issues
- Database connection error: Check DATABASE_URL
- Port already in use: Change PORT in .env
- JWT errors: Verify JWT_SECRET is set
- See [Backend README](./backend/README.md) for more

### Frontend Issues
- API connection error: Check VITE_API_URL
- Authentication issues: Clear localStorage
- Search not working: Verify backend is running
- See [Frontend README](./frontend/README.md) for more

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/notes_app
JWT_SECRET=your-secret-key-min-32-chars
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## 📚 Documentation

- [Backend README](./backend/README.md) - Backend setup and API details
- [Frontend README](./frontend/README.md) - Frontend setup and component details
- [OpenAPI Spec](https://notekeeper-7bn4.onrender.com/openapi.json) - Full API documentation

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Commit: `git commit -am 'Add feature'`
4. Push: `git push origin feature/your-feature`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 👤 Author

Created as an internship assignment for a full-stack notes application.

## 🎓 Learning Outcomes

This project demonstrates:
- Full-stack web development
- RESTful API design
- Database design and optimization
- Authentication and authorization
- Frontend state management
- Responsive UI design
- Deployment and DevOps
- Testing and debugging
- Security best practices

## 📞 Support

For issues or questions:
1. Check the troubleshooting sections in README files
2. Review the API documentation
3. Check browser console for errors
4. Review backend logs on Render dashboard

---

**Status**: ✅ Production Ready

**Last Updated**: May 15, 2026

**Version**: 1.0.0
