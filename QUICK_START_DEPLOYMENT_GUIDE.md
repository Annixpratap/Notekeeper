# 🚀 Quick Start Deployment Guide - Render.com

Deploy your Notion-style Notes App to Render.com with PostgreSQL database in 30 minutes.

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ GitHub account (for code hosting)
- ✅ Render.com account (free tier available)
- ✅ Node.js 18+ installed locally
- ✅ Git installed locally
- ✅ Code editor (VS Code recommended)

---

## 🔧 Step 1: Prepare Your Codebase

### 1.1 Update Environment Files

#### Backend `.env.example` → `.env`
**File**: `backend/.env`

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/notes_app

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173

# API
API_URL=http://localhost:5000
```

#### Frontend `.env.example` → `.env`
**File**: `frontend/.env`

```env
VITE_API_URL=http://localhost:5000
```

### 1.2 Verify Backend Configuration

**File**: `backend/src/app.js`

Ensure CORS is properly configured:
```javascript
import cors from 'cors';

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
```

### 1.3 Verify Prisma Configuration

**File**: `backend/prisma/schema.prisma`

Ensure it's set to PostgreSQL:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 📦 Step 2: Push Code to GitHub

### 2.1 Initialize Git Repository (if not already done)

```bash
cd c:\Users\main\Documents\Blocknote Editor
git init
git add .
git commit -m "Initial commit: Notes app with block editor"
```

### 2.2 Create GitHub Repository

1. Go to https://github.com/new
2. Create repository named `notes-app` (or your preferred name)
3. **Do NOT initialize with README** (you already have code)

### 2.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/notes-app.git
git branch -M main
git push -u origin main
```

---

## 🗄️ Step 3: Create PostgreSQL Database on Render

### 3.1 Create PostgreSQL Database

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Fill in details:
   - **Name**: `notes-app-db`
   - **Database**: `notes_app`
   - **User**: `notes_app_user`
   - **Region**: Choose closest to you
   - **Plan**: Free tier (sufficient for testing)

4. Click **"Create Database"**

### 3.2 Copy Database Connection String

After creation, you'll see:
```
postgresql://notes_app_user:PASSWORD@HOST:5432/notes_app
```

**Save this** - you'll need it for the backend service.

---

## 🔌 Step 4: Deploy Backend to Render

### 4.1 Create Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Select **"Connect a repository"**
4. Search for and select your `notes-app` repository
5. Fill in details:

   - **Name**: `notes-app-backend`
   - **Environment**: `Node`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Build Command**: 
     ```
     npm install && npx prisma migrate deploy && npx prisma generate
     ```
   - **Start Command**: 
     ```
     node src/server.js
     ```

### 4.2 Add Environment Variables

In the **Environment** section, add:

```
DATABASE_URL=postgresql://notes_app_user:PASSWORD@HOST:5432/notes_app
JWT_SECRET=generate-a-random-secret-key-here
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://your-frontend-url.onrender.com
API_URL=https://notes-app-backend.onrender.com
```

**To generate JWT_SECRET**, run in terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4.3 Deploy

Click **"Create Web Service"** and wait for deployment (5-10 minutes).

Once deployed, you'll get a URL like:
```
https://notes-app-backend.onrender.com
```

**Save this URL** - you'll need it for the frontend.

### 4.4 Verify Backend is Running

Visit: `https://notes-app-backend.onrender.com/health`

You should see:
```json
{ "status": "ok" }
```

---

## 🎨 Step 5: Deploy Frontend to Render

### 5.1 Create Static Site

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Static Site"**
3. Select your `notes-app` repository
4. Fill in details:

   - **Name**: `notes-app-frontend`
   - **Environment**: `Node`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Build Command**: 
     ```
     cd frontend && npm install && npm run build
     ```
   - **Publish Directory**: 
     ```
     frontend/dist
     ```

### 5.2 Add Environment Variables

In the **Environment** section, add:

```
VITE_API_URL=https://notes-app-backend.onrender.com
```

### 5.3 Deploy

Click **"Create Static Site"** and wait for deployment (3-5 minutes).

Once deployed, you'll get a URL like:
```
https://notes-app-frontend.onrender.com
```

---

## ✅ Step 6: Verify Everything Works

### 6.1 Test Backend API

```bash
# Test health endpoint
curl https://notes-app-backend.onrender.com/health

# Test registration
curl -X POST https://notes-app-backend.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test login
curl -X POST https://notes-app-backend.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 6.2 Test Frontend

1. Visit: `https://notes-app-frontend.onrender.com`
2. Register a new account
3. Create a note with blocks
4. Test auto-save
5. Test sharing
6. Test search

### 6.3 Check Logs

If something doesn't work:

**Backend logs**:
1. Go to Render dashboard
2. Click on `notes-app-backend` service
3. Click **"Logs"** tab
4. Look for errors

**Frontend logs**:
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for API calls

---

## 🔄 Step 7: Update Backend URL in Frontend (if needed)

If your backend URL changes, update the frontend:

**File**: `frontend/.env`

```env
VITE_API_URL=https://your-new-backend-url.onrender.com
```

Then redeploy frontend:
```bash
git add frontend/.env
git commit -m "Update backend URL"
git push origin main
```

Render will automatically redeploy.

---

## 🗄️ Step 8: Run Database Migrations

### 8.1 Automatic Migration (Recommended)

The build command already includes:
```
npx prisma migrate deploy
```

This runs automatically during deployment.

### 8.2 Manual Migration (if needed)

If migrations don't run automatically:

1. Go to Render backend service
2. Click **"Shell"** tab
3. Run:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

---

## 📝 Step 9: Update CORS Configuration

### 9.1 Update Backend CORS

**File**: `backend/src/app.js`

Update CORS to allow your frontend URL:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:5173',  // Local development
    'http://localhost:3000',  // Alternative local
    'https://notes-app-frontend.onrender.com',  // Production
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
```

### 9.2 Commit and Push

```bash
git add backend/src/app.js
git commit -m "Update CORS for production"
git push origin main
```

Render will automatically redeploy.

---

## 🔐 Step 10: Security Checklist

### 10.1 Environment Variables

- ✅ JWT_SECRET is random and strong (32+ characters)
- ✅ DATABASE_URL is kept secret (not in code)
- ✅ NODE_ENV is set to `production`
- ✅ CORS_ORIGIN is set to your frontend URL

### 10.2 Database Security

- ✅ Database user has limited permissions
- ✅ Password is strong (Render generates this)
- ✅ Database is not publicly accessible

### 10.3 API Security

- ✅ All endpoints require authentication (except /auth/register, /auth/login, /about, /health)
- ✅ JWT tokens are validated
- ✅ Rate limiting is enabled
- ✅ Input validation is in place

### 10.4 HTTPS

- ✅ Render provides free HTTPS
- ✅ All traffic is encrypted
- ✅ No need to configure SSL manually

---

## 🐛 Troubleshooting

### Issue: "Cannot find module" errors

**Solution**: 
```bash
# In backend directory
npm install
npx prisma generate
```

Then commit and push:
```bash
git add package-lock.json
git commit -m "Update dependencies"
git push origin main
```

### Issue: Database connection fails

**Solution**:
1. Verify DATABASE_URL is correct
2. Check database is running on Render
3. Verify credentials are correct
4. Check firewall/network settings

### Issue: Frontend can't connect to backend

**Solution**:
1. Verify VITE_API_URL is correct
2. Check CORS configuration
3. Verify backend is running
4. Check browser console for errors

### Issue: Auto-save not working

**Solution**:
1. Check browser console for errors
2. Verify API_URL in backend
3. Check network tab in DevTools
4. Verify JWT token is being sent

### Issue: Migrations fail

**Solution**:
1. Check database connection
2. Verify DATABASE_URL is correct
3. Run migrations manually in Shell
4. Check Prisma schema is valid

---

## 📊 Monitoring & Maintenance

### 10.1 Monitor Backend

1. Go to Render dashboard
2. Click `notes-app-backend`
3. Check:
   - **Logs**: Look for errors
   - **Metrics**: CPU, memory usage
   - **Events**: Deployment history

### 10.2 Monitor Database

1. Go to Render dashboard
2. Click `notes-app-db`
3. Check:
   - **Logs**: Database errors
   - **Metrics**: Connections, queries
   - **Backups**: Automatic backups

### 10.3 Monitor Frontend

1. Check browser console for errors
2. Monitor network requests
3. Check Render deployment logs

---

## 🔄 Continuous Deployment

### Automatic Redeployment

Every time you push to `main` branch:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Render automatically:
1. Pulls latest code
2. Installs dependencies
3. Runs build command
4. Deploys new version

---

## 📱 Local Development Setup

### Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Setup local PostgreSQL (or use Render database)
# Update DATABASE_URL in .env

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npm run prisma:seed

# Start development server
npm run dev
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update VITE_API_URL to http://localhost:5000

# Start development server
npm run dev
```

---

## 🎯 Final Checklist

Before going live:

- ✅ Backend deployed to Render
- ✅ Frontend deployed to Render
- ✅ PostgreSQL database created
- ✅ Environment variables set
- ✅ Database migrations run
- ✅ CORS configured
- ✅ Backend health check passes
- ✅ Frontend loads without errors
- ✅ Can register new account
- ✅ Can login
- ✅ Can create notes with blocks
- ✅ Auto-save works
- ✅ Can share notes
- ✅ Can search notes
- ✅ API documentation accessible at /docs
- ✅ About endpoint works at /about

---

## 🚀 You're Live!

Your Notes App is now deployed and accessible at:

- **Frontend**: `https://notes-app-frontend.onrender.com`
- **Backend API**: `https://notes-app-backend.onrender.com`
- **API Docs**: `https://notes-app-backend.onrender.com/docs`
- **About**: `https://notes-app-backend.onrender.com/about`

---

## 📞 Support & Resources

### Render Documentation
- https://render.com/docs
- https://render.com/docs/deploy-node-express-app
- https://render.com/docs/databases

### Prisma Documentation
- https://www.prisma.io/docs/
- https://www.prisma.io/docs/orm/prisma-migrate/workflows/add-to-existing-project

### Common Issues
- Check Render logs for errors
- Verify environment variables
- Test API endpoints with curl or Postman
- Check browser console for frontend errors

---

## 🎓 Next Steps

### Optimization
- [ ] Enable caching
- [ ] Optimize database queries
- [ ] Compress assets
- [ ] Enable CDN

### Features
- [ ] Add email verification
- [ ] Add password reset
- [ ] Add user profiles
- [ ] Add note templates
- [ ] Add collaborative editing

### Monitoring
- [ ] Setup error tracking (Sentry)
- [ ] Setup analytics
- [ ] Setup uptime monitoring
- [ ] Setup performance monitoring

---

## 📝 Notes

- Free tier on Render has limitations (spins down after 15 minutes of inactivity)
- For production, upgrade to paid plan
- Database backups are automatic
- SSL/HTTPS is free and automatic
- Deployments are automatic on git push

---

**Last Updated**: January 2024
**Status**: Ready for Production
**Estimated Setup Time**: 30 minutes
