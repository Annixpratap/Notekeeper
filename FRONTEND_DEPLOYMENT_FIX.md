# 🔧 Frontend Deployment Fix for Render

## Problem
Frontend build is failing on Render with "Exited with status 1"

## Root Cause
Render is trying to build from the root directory, but the frontend is in a subdirectory.

## Solution

### Option 1: Update Build Command in Render Dashboard (RECOMMENDED)

1. Go to Render Dashboard
2. Click on your frontend service
3. Go to **Settings** tab
4. Find **Build Command** field
5. Change it to:
   ```
   cd frontend && npm install && npm run build
   ```

6. Find **Publish Directory** field
7. Change it to:
   ```
   frontend/dist
   ```

8. Click **Save**
9. Trigger a new deploy

### Option 2: Create render.yaml for Frontend

Create a file: `render.yaml` in the root directory with:

```yaml
services:
  - type: web
    name: notes-app-frontend
    env: static
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: frontend/dist
    routes:
      - path: /*
        destination: /index.html
```

Then push to GitHub and redeploy.

### Option 3: Separate Frontend Repository

If you want to keep frontend and backend separate:

1. Create a new GitHub repository for frontend only
2. Copy frontend folder contents to new repo
3. Deploy new repo to Render as Static Site
4. Update backend CORS to allow new frontend URL

---

## Environment Variables for Frontend

Make sure these are set in Render:

```
VITE_API_URL=https://notekeeper-7bn4.onrender.com
```

---

## Verification After Fix

1. Trigger a new deploy on Render
2. Wait for build to complete
3. Check the deployment logs
4. Visit your frontend URL
5. Test login/register
6. Test creating a note
7. Verify it connects to backend

---

## Common Build Errors & Fixes

### Error: "Cannot find module"
**Fix:** Make sure `npm install` runs in the build command

### Error: "VITE_API_URL is undefined"
**Fix:** Add environment variable in Render dashboard

### Error: "dist folder not found"
**Fix:** Make sure Publish Directory is set to `frontend/dist`

### Error: "Port already in use"
**Fix:** This shouldn't happen for static sites, but if it does, check the build command

---

## Testing Locally Before Deploying

```bash
cd frontend
npm install
npm run build
npm run preview
```

Then visit http://localhost:4173 to test the production build locally.

---

## If Still Failing

Check Render deployment logs:
1. Go to Render Dashboard
2. Click on frontend service
3. Click **Logs** tab
4. Look for error messages
5. Share the error message for debugging

---

**Status:** Ready to fix
**Next Step:** Update build command in Render dashboard
