# Gimme Idea - Deployment Guide

## Backend Deployment (Render)

### Prerequisites
- Render account (https://render.com)
- Supabase project setup with database tables
- GitHub repository connected

### Step-by-Step Deployment

#### 1. Push Code to GitHub
```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

#### 2. Create New Web Service on Render
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the `Gimme-Idea` repository

#### 3. Configure Build Settings
Render will auto-detect the `render.yaml` file, but verify these settings:

- **Name**: `gimme-idea-backend`
- **Region**: Oregon (or closest to you)
- **Branch**: `main`
- **Root Directory**: Leave empty (render.yaml handles paths)
- **Runtime**: Node
- **Build Command**: `cd backend && npm install && npm run build`
- **Start Command**: `cd backend && npm run start:prod`

#### 4. Set Environment Variables

**CRITICAL**: You must add these environment variables in Render dashboard:

Navigate to: Environment → Environment Variables

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Auto-set by render.yaml |
| `PORT` | `10000` | Auto-set by Render |
| `NODE_VERSION` | `20.11.0` | Specified in render.yaml |
| `SUPABASE_URL` | `https://xxx.supabase.co` | ⚠️ **REQUIRED** - Get from Supabase dashboard |
| `SUPABASE_ANON_KEY` | `eyJxxx...` | ⚠️ **REQUIRED** - Get from Supabase dashboard |
| `SUPABASE_SERVICE_KEY` | `eyJxxx...` | ⚠️ **REQUIRED** - Get from Supabase dashboard |
| `JWT_SECRET` | Auto-generated | Render will generate this |
| `JWT_EXPIRES_IN` | `7d` | Auto-set by render.yaml |
| `SOLANA_NETWORK` | `mainnet-beta` | Or `devnet` for testing |
| `SOLANA_RPC_URL` | `https://api.mainnet-beta.solana.com` | Or devnet URL |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | ⚠️ **REQUIRED** - Add after frontend deployment |

#### 5. Deploy
1. Click "Create Web Service"
2. Render will:
   - Install dependencies
   - Build your NestJS application
   - Start the server
3. Wait 5-10 minutes for first deployment

#### 6. Verify Deployment
Once deployed, your backend will be available at:
```
https://gimme-idea-backend.onrender.com
```

Test the health endpoint:
```bash
curl https://gimme-idea-backend.onrender.com/api
```

### Common Deployment Issues & Fixes

#### Issue 1: "Module not found" errors
**Cause**: Missing dependencies in package.json
**Fix**: Ensure all imports are listed in `dependencies` (not `devDependencies`)

#### Issue 2: Build timeout
**Cause**: Slow npm install on Render's free tier
**Fix**: Use `npm ci` instead of `npm install` (faster, uses package-lock.json)

Update `render.yaml`:
```yaml
buildCommand: cd backend && npm ci && npm run build
```

#### Issue 3: TypeScript errors during build
**Cause**: Type checking is stricter in production
**Fix**: Run `npm run build` locally first to catch errors

#### Issue 4: "Cannot connect to database"
**Cause**: Missing or incorrect Supabase environment variables
**Fix**: Double-check SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_KEY

#### Issue 5: CORS errors from frontend
**Cause**: FRONTEND_URL not set correctly
**Fix**: Update FRONTEND_URL to match your deployed frontend (e.g., Vercel URL)

---

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account (https://vercel.com)
- Backend deployed and URL available

### Step-by-Step Deployment

#### 1. Update Frontend API URL
Before deploying, update the API base URL in your frontend:

Edit `frontend/lib/api.ts` (or wherever API calls are made):
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
```

#### 2. Deploy to Vercel

##### Option A: Vercel CLI (Recommended)
```bash
cd frontend
npm install -g vercel
vercel login
vercel
```

##### Option B: Vercel Dashboard
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select the `frontend` directory as root
4. Click Deploy

#### 3. Configure Environment Variables in Vercel

Navigate to: Project Settings → Environment Variables

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_API_URL` | `https://gimme-idea-backend.onrender.com/api` | ⚠️ **REQUIRED** |

#### 4. Redeploy
After adding environment variables, trigger a new deployment:
```bash
vercel --prod
```

#### 5. Update Backend FRONTEND_URL
Go back to Render and update the `FRONTEND_URL` environment variable:
```
FRONTEND_URL=https://your-app.vercel.app
```

This enables CORS for your production frontend.

---

## Post-Deployment Checklist

- [ ] Backend is accessible at Render URL
- [ ] Frontend is accessible at Vercel URL
- [ ] Wallet connection works (Phantom/Solflare)
- [ ] User registration and login work
- [ ] Projects can be created and viewed
- [ ] Comments and tips work
- [ ] Image uploads work (avatar + project images)
- [ ] Supabase database is receiving data
- [ ] No CORS errors in browser console

---

## Monitoring & Logs

### Backend Logs (Render)
- Go to Render dashboard
- Click on your web service
- Click "Logs" tab
- View real-time logs

### Frontend Logs (Vercel)
- Go to Vercel dashboard
- Click on your project
- Click "Deployments" → Select deployment → "View Function Logs"

---

## Rollback (If Needed)

### Render
1. Go to Events tab
2. Click on previous successful deployment
3. Click "Rollback to this version"

### Vercel
1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

---

## Production Tips

1. **Use Custom Domains** (Optional but recommended)
   - Render: Settings → Custom Domain
   - Vercel: Settings → Domains

2. **Enable HTTPS** (Automatic on both platforms)

3. **Monitor Performance**
   - Render: Built-in metrics in dashboard
   - Vercel: Analytics tab

4. **Database Backups**
   - Supabase: Automatic backups on paid plans
   - Free tier: Manual exports via Supabase dashboard

5. **Cost Management**
   - Render Free Tier: Spins down after inactivity (cold starts ~30s)
   - Consider upgrading to paid plan for always-on service

---

## Support

If you encounter issues:
1. Check logs first (Render + Vercel)
2. Verify all environment variables are set
3. Test backend API directly with curl/Postman
4. Check Render community forums
5. Check Vercel documentation
