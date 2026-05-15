# 🚀 Frontend Deployment - Step by Step Fix

## ✅ What I Fixed

1. **Updated frontend/.env** - Changed API URL from localhost to production backend
   ```
   VITE_API_URL=https://notekeeper-7bn4.onrender.com
   ```

2. **Identified build issue** - Render needs proper build command for subdirectory

## 📋 Steps to Deploy Frontend Successfully

### Step 1: Commit Changes
```bash
git add frontend/.env
git commit -m "Update API URL for production"
git push origin main
```

### Step 2: Update Render Frontend Service

1. Go to https://dashboard.render.com
2. Click on your **notes-app-frontend** service
3. Click **Settings** tab
4. Scroll to **Build & Deploy** section

### Step 3: Update Build Command

Find the **Build Command** field and change it to:
```
cd frontend && npm install && npm run build
```

### Step 4: Update Publish Directory

Find the **Publish Directory** field and change it to:
```
frontend/dist
```

### Step 5: Add Environment Variable

1. Scroll to **Environment** section
2. Add this variable:
   ```
   VITE_API_URL=https://notekeeper-7bn4.onrender.com
   ```

3. Click **Save**

### Step 6: Trigger New Deploy

1. Click **Manual Deploy** button
2. Select **Deploy latest commit**
3. Wait for build to complete (2-5 minutes)

### Step 7: Check Logs

1. Click **Logs** tab
2. Look for success message: "✓ built in X.XXs"
3. If error, scroll up to see error details

### Step 8: Test Frontend

1. Visit your frontend URL (e.g., https://notes-app-frontend.onrender.com)
2. Try to register a new account
3. Try to login
4. Create a note
5. Verify it saves

---

## 🔍 If Build Still Fails

### Check These Things:

1. **Build Command is correct:**
   ```
   cd frontend && npm install && npm run build
   ```

2. **Publish Directory is correct:**
   ```
   frontend/dist
   ```

3. **Environment variable is set:**
   ```
   VITE_API_URL=https://notekeeper-7bn4.onrender.com
   ```

4. **Check logs for specific error:**
   - Go to Logs tab
   - Look for error message
   - Common errors:
     - "Cannot find module" → npm install failed
     - "VITE_API_URL undefined" → env var not set
     - "dist not found" → build failed

### Debug Locally First:

```bash
cd frontend
npm install
npm run build
npm run preview
```

Visit http://localhost:4173 to test production build locally.

---

## ✅ Verification Checklist

After deployment:

- [ ] Frontend URL loads without errors
- [ ] Can register new account
- [ ] Can login with credentials
- [ ] Can create a note
- [ ] Can add blocks to note
- [ ] Auto-save works (shows "Saving..." then "Saved ✓")
- [ ] Can search notes
- [ ] Can share note with another user
- [ ] Can view shared notes
- [ ] Shared notes are read-only

---

## 🎯 Expected Result

After successful deployment:

- **Frontend URL:** https://notes-app-frontend.onrender.com (or your custom domain)
- **Backend URL:** https://notekeeper-7bn4.onrender.com
- **Status:** Both running and connected

---

## 📞 If Still Having Issues

1. Check Render logs for specific error
2. Verify build command: `cd frontend && npm install && npm run build`
3. Verify publish directory: `frontend/dist`
4. Verify environment variable: `VITE_API_URL=https://notekeeper-7bn4.onrender.com`
5. Try manual deploy again

---

**Last Updated:** May 15, 2026
**Status:** Ready to Deploy
