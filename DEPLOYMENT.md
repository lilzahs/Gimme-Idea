# Gimme Idea - Production Deployment Guide

## 🚀 Deployment Overview

- **Frontend**: Vercel (https://gimmeidea.com)
- **Backend**: Railway (Asia Southeast 1)
- **Database**: Supabase PostgreSQL
- **Blockchain**: Solana Devnet

---

## 📦 Backend Deployment (Railway)

### 1. Project Setup

Deploy from the `GMI-BE` directory:

```bash
# Connect to Railway
railway link

# Or create new project
railway init
```

### 2. Environment Variables

Add these in Railway Dashboard → Settings → Variables:

```bash
# Database
DATABASE_URL=postgresql://postgres.negjhshfqvgmpuonfpdc:gimmimvp1212@aws-1-us-east-1.pooler.supabase.com:6543/postgres

# Supabase
SUPABASE_URL=https://negjhshfqvgmpuonfpdc.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lZ2poc2hmcXZnbXB1b25mcGRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNTQ5MTAsImV4cCI6MjA3NzYzMDkxMH0.HfXVSDYySwmG5LRle9m1KG0JNL_g0EQousn-euZRxk4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lZ2poc2hmcXZnbXB1b25mcGRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjA1NDkxMCwiZXhwIjoyMDc3NjMwOTEwfQ.7Lt3OfXjhOE9-CxHnUp-IV2O_dV5e7-BPPe1Y4vZVKA

# Solana
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
PROGRAM_ID=11111111111111111111111111111111

# Server
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://gimmeidea.com,https://www.gimmeidea.com

# Security
ACCESS_CODE=GMI2025
JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30
```

### 3. Generate Public Domain

Railway Dashboard → Settings → Networking:
1. Click **"Generate Domain"**
2. Copy the generated URL (e.g., `gimme-idea-backend.up.railway.app`)
3. Use this URL for frontend `NEXT_PUBLIC_API_URL`

### 4. Deploy

Railway auto-deploys on git push. Build process:
- Install dependencies: `npm install`
- Generate Prisma Client: `npx prisma generate`
- Build TypeScript: `npm run build`
- Start: `npm start`

Configuration files:
- `railway.json` - Railway deployment config
- `nixpacks.toml` - Nixpacks build config
- `.railwayignore` - Files to exclude from deployment

### 5. Verify Deployment

Check health endpoint:
```bash
curl https://your-railway-domain.up.railway.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-04T...",
  "environment": "production"
}
```

---

## 🎨 Frontend Deployment (Vercel)

### 1. Project Setup

Deploy from the `GMI-FE` directory:

```bash
# Link to Vercel project
vercel link

# Or deploy new
vercel
```

### 2. Environment Variables

Add in Vercel Dashboard → Settings → Environment Variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://negjhshfqvgmpuonfpdc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lZ2poc2hmcXZnbXB1b25mcGRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNTQ5MTAsImV4cCI6MjA3NzYzMDkxMH0.HfXVSDYySwmG5LRle9m1KG0JNL_g0EQousn-euZRxk4

# Solana
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Backend API (⚠️ Use Railway public domain, NOT registry URL)
NEXT_PUBLIC_API_URL=https://gimme-idea-backend.up.railway.app

# Access Code
NEXT_PUBLIC_ACCESS_CODE=GMI2025
```

### 3. Custom Domains

Vercel Dashboard → Settings → Domains:
1. Add `gimmeidea.com`
2. Add `www.gimmeidea.com`
3. Configure DNS according to Vercel instructions

### 4. Deploy

```bash
vercel --prod
```

Or push to main branch for auto-deployment.

---

## 🗄️ Database Setup (Supabase)

### Connection Details

- **Host**: `aws-1-us-east-1.pooler.supabase.com`
- **Port**: `6543` (Transaction pooler)
- **Database**: `postgres`
- **Username**: `postgres.negjhshfqvgmpuonfpdc`
- **Password**: `gimmimvp1212`

### Schema Setup

The database schema is already created. To recreate:

```bash
cd GMI-BE
psql $DATABASE_URL -f setup-database.sql
```

Or use Prisma:

```bash
npx prisma db push
```

### Row Level Security (RLS)

All tables have RLS policies enabled. Check `setup-database.sql` for details.

---

## 🔄 Local Development

### Start All Services

```bash
# Use the local start script
./start-local.sh
```

Or manually:

```bash
# Terminal 1 - Backend
cd GMI-BE
npm run dev

# Terminal 2 - Frontend
cd GMI-FE
npm run dev
```

### Local URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:3001/api/health
- Access Code: `GMI2025`

---

## 🔧 Troubleshooting

### Railway Build Fails

1. Check environment variables are set correctly
2. Verify `DATABASE_URL` is accessible from Railway
3. Check Railway logs: `railway logs`

### CORS Errors

1. Verify `CORS_ORIGIN` includes both domains with https://
2. No trailing slashes in domains
3. Separated by commas, no spaces

### Database Connection Issues

1. Use **Transaction pooler** (port 6543), not direct connection (port 5432)
2. Verify password doesn't have special characters or is URL-encoded
3. Test connection: `psql $DATABASE_URL -c "SELECT 1"`

### Prisma Issues

```bash
# Regenerate Prisma Client
npx prisma generate

# Reset database (⚠️ Deletes data)
npx prisma migrate reset

# Push schema without migration
npx prisma db push
```

---

## 📝 Deploy Checklist

Before going to production:

- [ ] Backend deployed to Railway with all env vars
- [ ] Railway public domain generated
- [ ] Frontend deployed to Vercel with correct API URL
- [ ] Custom domains configured (gimmeidea.com)
- [ ] Database schema created in Supabase
- [ ] RLS policies enabled
- [ ] Test wallet connection on production
- [ ] Test post creation on production
- [ ] Verify CORS working from both domains

---

## 🔐 Security Notes

1. **Never commit** `.env` files to git
2. **Rotate secrets** periodically (JWT_SECRET, ACCESS_CODE)
3. **Use RLS policies** for all Supabase tables
4. **Enable rate limiting** in production
5. **Monitor logs** for suspicious activity

---

## 📚 Additional Resources

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Solana Devnet](https://docs.solana.com/clusters#devnet)
