# Frontend Implementation Quick Reference

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── axiosInstance.js      # Axios with interceptors
│   │   └── queryClient.js        # React Query configuration
│   ├── components/               # Reusable UI components
│   │   ├── BlockEditor.jsx       # Block-based editor
│   │   ├── ColorPicker.jsx       # Color selection
│   │   ├── CommandMenu.jsx       # Block type menu
│   │   ├── NoteCard.jsx          # Note preview card
│   │   ├── SearchBar.jsx         # Search input
│   │   ├── ShareModal.jsx        # Share dialog
│   │   ├── Sidebar.jsx           # User sidebar
│   │   └── TagInput.jsx          # Tag management
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.js            # Authentication state
│   │   ├── useAutoSave.js        # Auto-save with debounce
│   │   ├── useNotes.js           # Note CRUD operations
│   │   └── useSearch.js          # Search functionality
│   ├── pages/                    # Page components
│   │   ├── Dashboard.jsx         # Main dashboard
│   │   ├── Login.jsx             # Login page
│   │   ├── NoteEditor.jsx        # Note editor
│   │   └── Register.jsx          # Registration page
│   ├── router/
│   │   └── Router.jsx            # Route configuration
│   ├── store/
│   │   └── AuthContext.jsx       # Authentication context
│   ├── App.jsx                   # Root component
│   ├── index.css                 # Global styles
│   └── main.jsx                  # Entry point
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── vercel.json                   # Vercel deployment config
├── tailwind.config.js            # Tailwind configuration
├── postcss.config.js             # PostCSS configuration
├── vite.config.js                # Vite configuration
├── package.json                  # Dependencies
└── index.html                    # HTML template
```

## Key Components

### Dashboard (`/dashboard`)
- Displays all user notes in masonry grid
- Pinned notes at top
- Search functionality
- Mobile-responsive sidebar
- Empty state with CTA

### NoteEditor (`/notes/:id`)
- Full-page editor
- Editable title
- Block-based content editor
- 8 block types (text, heading1, heading2, bullet, todo, code, divider, quote)
- Auto-save with 2-second debounce
- Color picker
- Tags input
- Share modal
- Delete with confirmation

### Sidebar
- User avatar and email
- New note button
- Logout button
- Mobile slide-in animation

### SearchBar
- Debounced search (300ms)
- Real-time results
- Clear button
- Loading indicator

### NoteCard
- Title and preview
- Color background
- Tags display
- Pin indicator
- Shared badge
- Context menu (pin/delete)

### BlockEditor
- Textarea for each block
- Keyboard shortcuts:
  - Enter: New block
  - Backspace on empty: Delete block
  - /: Open command menu
- Drag-and-drop reordering
- Add/delete block buttons

### CommandMenu
- 8 block type options
- Keyboard navigation
- Smooth animations

### ColorPicker
- 8 preset colors
- Circular swatches
- Immediate update

### TagInput
- Comma-separated input
- Tag chips with remove
- Duplicate prevention

### ShareModal
- Email input
- Share button
- List of shared users
- Remove option

## Custom Hooks

### useAuth()
```javascript
const { user, token, isLoading, login, register, logout, isAuthenticated } = useAuth();
```

### useNotes(page, limit)
```javascript
const { data, isLoading, error } = useNotes(1, 20);
const createNoteMutation = useCreateNote();
const updateNoteMutation = useUpdateNote();
const deleteNoteMutation = useDeleteNote();
```

### useSearch()
```javascript
const { results, isLoading, error, search, clear, query } = useSearch();
```

### useAutoSave(noteId, debounceMs)
```javascript
const { save, cancel, isSaving, error, lastSaved } = useAutoSave(noteId, 2000);
```

## Styling

### Colors
- **Charcoal:** #0f0f0f (background)
- **Off-white:** #f0ede6 (text)
- **Amber:** #e8a045 (accent)

### Fonts
- **Playfair Display:** Headings
- **DM Mono:** Code blocks
- **Lora:** Body text

### Responsive Breakpoints
- **Mobile:** < 768px (1 column)
- **Tablet:** 768px - 1024px (2 columns)
- **Desktop:** > 1024px (3+ columns)

## API Integration

### Endpoints Used
- `POST /register` - User registration
- `POST /login` - User login
- `GET /notes` - Get user notes (paginated)
- `GET /notes/:id` - Get single note
- `POST /notes` - Create note
- `PUT /notes/:id` - Update note
- `DELETE /notes/:id` - Delete note
- `GET /search` - Search notes
- `POST /notes/:id/share` - Share note
- `DELETE /notes/:id/share/:userId` - Revoke share

### Request/Response Format
```javascript
// Create note
POST /notes
{
  title: string,
  content?: string,
  blocks?: Block[],
  color?: string,
  tags?: string[],
  isPinned?: boolean
}

// Update note
PUT /notes/:id
{
  title?: string,
  content?: string,
  blocks?: Block[],
  color?: string,
  tags?: string[],
  isPinned?: boolean
}

// Share note
POST /notes/:id/share
{
  share_with_email: string
}
```

## State Management

### Authentication (Context API)
- User info
- JWT token
- Login/logout functions
- Persisted in localStorage

### Server State (React Query)
- Notes list
- Single note
- Search results
- Automatic caching and invalidation

### UI State (Local Component State)
- Modal open/close
- Form inputs
- Loading states
- Error messages

## Animations

### Framer Motion
- **Dashboard:** Staggered card entry
- **NoteEditor:** Block animations
- **Components:** Hover effects, smooth transitions
- **Sidebar:** Slide-in on mobile
- **Modals:** Scale and fade

## Performance Optimizations

- React Query caching (5 minutes stale time)
- Debounced search (300ms)
- Debounced auto-save (2 seconds)
- Code splitting via Vite
- CSS minification
- JS minification and tree-shaking

## Build & Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Vercel Deployment
- Automatic deployments from main branch
- Environment variables: `VITE_API_URL`
- SPA rewrite rules configured
- Build command: `npm run build`
- Output directory: `dist`

## Environment Variables

### Development (.env)
```
VITE_API_URL=http://localhost:5000
```

### Production (Vercel)
```
VITE_API_URL=https://your-backend-url.com
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Focus management
- Color contrast compliance
- Touch-friendly interactive elements

## Testing

### Manual Testing Checklist
- [ ] Dashboard loads and displays notes
- [ ] Search works with debounce
- [ ] Create new note
- [ ] Edit note title
- [ ] Add/edit/delete blocks
- [ ] Keyboard shortcuts work
- [ ] Command menu works
- [ ] Drag-and-drop works
- [ ] Color picker works
- [ ] Tags input works
- [ ] Share modal works
- [ ] Delete confirmation works
- [ ] Mobile responsive
- [ ] Animations smooth
- [ ] Error states display
- [ ] Loading states display

## Common Issues & Solutions

### Issue: Notes not loading
**Solution:** Check API URL in environment variables, verify backend is running

### Issue: Auto-save not working
**Solution:** Check network tab, verify PUT endpoint is working

### Issue: Search not debouncing
**Solution:** Verify useSearch hook is being used correctly

### Issue: Animations stuttering
**Solution:** Check browser performance, reduce animation complexity

### Issue: Mobile layout broken
**Solution:** Verify Tailwind responsive classes are applied correctly

## Future Enhancements

- [ ] Offline support with service workers
- [ ] Rich text editor (Slate.js or similar)
- [ ] Collaborative editing
- [ ] Note templates
- [ ] Advanced search filters
- [ ] Note history/versioning
- [ ] Dark/light theme toggle
- [ ] Custom keyboard shortcuts
- [ ] Note encryption
- [ ] Export to PDF/Markdown
