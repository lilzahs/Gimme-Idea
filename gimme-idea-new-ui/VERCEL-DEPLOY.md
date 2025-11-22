# Deploy to Vercel - Quick Guide

## 📋 Prerequisites

- Vercel account (https://vercel.com)
- Code pushed to Git (GitHub/GitLab/Bitbucket)

## 🚀 Method 1: Deploy via Vercel Dashboard (Easiest)

### Step 1: Import Project
1. Go to https://vercel.com/new
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Select the repository

### Step 2: Configure Project
Vercel will auto-detect Vite. Verify these settings:

```
Framework Preset: Vite
Root Directory: gimme-idea-new-ui
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Step 3: Environment Variables (Optional)
If your UI uses Gemini AI, add:

```
GEMINI_API_KEY=your_gemini_api_key
```

Click **"Add"** then **"Deploy"**

### Step 4: Wait for Build
- Build takes ~30-60 seconds
- Check build logs for errors
- Vercel provides preview URL

## 🛠️ Method 2: Deploy via CLI

### Install Vercel CLI
```bash
npm install -g vercel
```

### Login
```bash
vercel login
```

### Deploy
```bash
cd gimme-idea-new-ui
vercel --prod
```

Follow prompts:
- Link to existing project? **No**
- Project name: **gimme-idea** (or your choice)
- Directory: **.** (current)
- Override settings? **No**

## ⚙️ Important Settings

### Root Directory
**Must set to**: `gimme-idea-new-ui`

This tells Vercel where to find `package.json` and build files.

### Node.js Version
Recommended: **20.x** or **18.x**

Set in: **Project Settings → General → Node.js Version**

### Build Settings (Auto-detected)
Vercel reads from `package.json`:

```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

Output goes to `dist/` folder.

## 🔍 Verify Deployment

### 1. Check Build Logs
Look for:
```
✓ 25 modules transformed
✓ built in ~1s
dist/index.html
dist/assets/index-*.js
```

### 2. Test Production Site
Open Vercel URL and verify:
- [ ] Site loads (no black screen)
- [ ] Browser Console (F12) - no errors
- [ ] Importmap loads from CDN
- [ ] UI displays correctly

### 3. Check Network Tab (F12)
Should see requests to:
```
https://aistudiocdn.com/react@^19.2.0
https://aistudiocdn.com/framer-motion@^12.23.24
...
```

## 🐛 Troubleshooting

### Build Fails
**Error**: "No package.json found"
**Solution**: Check Root Directory = `gimme-idea-new-ui`

**Error**: "Build command failed"
**Solution**: Test locally first:
```bash
npm run build
npm run preview
```

### Blank Screen
1. Open browser Console (F12)
2. Check for JavaScript errors
3. Verify importmap in deployed HTML
4. Check Network tab for failed CDN requests

### Importmap Not Loading
**Symptom**: React is undefined
**Solution**:
1. Check `dist/index.html` contains importmap
2. Verify CDN URLs are accessible
3. Check browser Network tab

## 📊 Expected Results

### Build Output
```
✓ Build Completed
Output: dist
Size: ~80 kB
Time: 30-60 seconds
```

### Performance
- First Load: ~500ms
- Cached Load: ~100ms
- Lighthouse Score: 90+

## 🔗 Useful Links

- Vercel Dashboard: https://vercel.com/dashboard
- Build Logs: Project → Deployments → Click deployment
- Domain Settings: Project → Settings → Domains
- Environment Variables: Project → Settings → Environment Variables

## ✅ Post-Deployment Checklist

- [ ] Build succeeded
- [ ] Site loads without errors
- [ ] Importmap loading from CDN
- [ ] All features working
- [ ] Performance acceptable
- [ ] Custom domain configured (optional)

## 🎯 Custom Domain (Optional)

1. Go to **Project Settings → Domains**
2. Click **"Add"**
3. Enter your domain
4. Follow DNS configuration steps
5. Wait for SSL certificate (automatic)

---

**Deploy Command Summary:**
```bash
# Quick deploy
vercel --prod

# Or via Git push (auto-deploy enabled)
git push origin main
```

**Status**: Ready for Production ✅
