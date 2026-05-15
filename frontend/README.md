# Notes App Frontend

A modern React + Vite frontend for the Notes App with Notion-style block editor, real-time search, and seamless note management.

## Project Structure

```
frontend/
├── src/
│   ├── App.jsx                # Main app component
│   ├── main.jsx               # Entry point
│   ├── pages/
│   │   ├── Dashboard.jsx      # Notes list view
│   │   ├── NoteEditor.jsx     # Note editor with blocks
│   │   └── Login.jsx          # Authentication page
│   ├── components/
│   │   ├── BlockEditor.jsx    # Block editor component
│   │   ├── NoteCard.jsx       # Note card component
│   │   ├── SearchBar.jsx      # Search component
│   │   └── Header.jsx         # Header component
│   ├── hooks/
│   │   ├── useNotes.js        # Notes API hooks
│   │   ├── useSearch.js       # Search API hook
│   │   ├── useAuth.js         # Authentication hook
│   │   └── useAutoSave.js     # Auto-save hook
│   ├── store/
│   │   └── AuthContext.jsx    # Auth state management
│   ├── styles/
│   │   └── index.css          # Global styles
│   └── utils/
│       └── api.js             # API client configuration
├── .env                       # Environment variables
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── index.html                 # HTML entry point
├── vite.config.js             # Vite configuration
├── eslint.config.js           # ESLint configuration
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## Technology Stack

- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.1
- **HTTP Client**: Axios 1.6.2
- **Styling**: CSS3 with Tailwind CSS 3.4.1
- **State Management**: React Context API
- **Linting**: ESLint 9.9.0
- **Node**: 18+

## Features

### Core Features
✅ User authentication with JWT tokens
✅ Create, read, update, delete notes
✅ Notion-style block editor with 8 block types
✅ Auto-save with debouncing (2 seconds)
✅ Full-text search across notes
✅ Share notes with other users
✅ Responsive design
✅ Real-time UI updates

### Block Editor Features
✅ 8 block types: Text, Heading 1, Heading 2, Bullet, Todo, Code, Divider, Quote
✅ Press Enter to create new block
✅ Press Backspace on empty block to delete
✅ Auto-expanding textareas
✅ Todo blocks with checkboxes
✅ Code blocks with syntax highlighting
✅ Seamless Notion-like experience

### Search Features
✅ Real-time search as you type
✅ Case-insensitive search
✅ Search across note titles and content
✅ Pagination support
✅ Instant results

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see backend README)

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
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
   VITE_API_URL="http://localhost:5000"
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The app will start on `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Environment Variables

```env
VITE_API_URL=http://localhost:5000  # Backend API URL
```

For production:
```env
VITE_API_URL=https://notekeeper-7bn4.onrender.com
```

## API Integration

The frontend communicates with the backend API at the configured `VITE_API_URL`.

### Authentication Flow
1. User registers or logs in
2. Backend returns JWT token
3. Token is stored in localStorage
4. Token is sent in Authorization header for all protected requests

### Auto-Save
- Notes are automatically saved 2 seconds after last keystroke
- Debounced to prevent excessive API calls
- Shows "Saving..." and "Saved ✓" status indicators

### Search
- Real-time search as user types
- Searches note titles and content
- Results update instantly
- Empty search shows all notes

## Component Architecture

### Pages
- **Dashboard**: Lists all user's notes with search
- **NoteEditor**: Full-screen note editor with blocks
- **Login**: Authentication page

### Components
- **BlockEditor**: Renders individual blocks with auto-expand
- **NoteCard**: Displays note preview on dashboard
- **SearchBar**: Search input with real-time results
- **Header**: Navigation and user info

### Hooks
- **useNotes**: CRUD operations for notes
- **useSearch**: Search functionality
- **useAuth**: Authentication and token management
- **useAutoSave**: Debounced auto-save logic

## Styling

The app uses Tailwind CSS for styling with a clean, modern design inspired by Notion.

### Color Scheme
- Primary: Blue (#3B82F6)
- Secondary: Gray (#6B7280)
- Success: Green (#10B981)
- Danger: Red (#EF4444)

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly UI

## Deployment

### Deployed Frontend
- **URL**: https://notekeeper-1-x6wo.onrender.com
- **Platform**: Render.com
- **Build Command**: `cd frontend && npm install && npm run build`
- **Publish Directory**: `frontend/dist`

### Environment Variables for Production
```env
VITE_API_URL=https://notekeeper-7bn4.onrender.com
```

### Build for Production
```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

## Development Workflow

### Adding a New Feature

1. Create component in `src/components/`
2. Create hook in `src/hooks/` if needed
3. Import and use in page component
4. Style with Tailwind CSS
5. Test with backend API

### Making API Calls

Use the provided hooks:
```javascript
import { useNotes } from '../hooks/useNotes';

function MyComponent() {
  const { notes, createNote, updateNote, deleteNote } = useNotes();
  
  // Use the functions
}
```

### Debugging

- Open browser DevTools (F12)
- Check Network tab for API calls
- Check Console for errors
- Check Application tab for localStorage (auth token)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- Code splitting with React.lazy
- Image optimization
- CSS minification
- JavaScript minification
- Debounced search and auto-save
- Efficient re-renders with React hooks

## Troubleshooting

### API Connection Error
- Verify backend is running
- Check VITE_API_URL in .env
- Check browser console for CORS errors
- Verify backend CORS configuration

### Authentication Issues
- Clear localStorage: `localStorage.clear()`
- Check token expiry (24 hours)
- Re-login if token expired
- Check JWT_SECRET on backend

### Search Not Working
- Verify backend search endpoint is working
- Check network tab for API response
- Ensure notes have content
- Try refreshing page

### Auto-Save Not Working
- Check network tab for PUT requests
- Verify token is valid
- Check browser console for errors
- Ensure note has content

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`
- Check for TypeScript errors
- Verify all imports are correct

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT
