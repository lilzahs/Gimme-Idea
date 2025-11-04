# Gimme Idea - Production Deployment Guide

## 🚀 Deployment Overview

- **Frontend**: Vercel (https://gimmeidea.com, https://www.gimmeidea.com)
- **Backend**: Railway (Asia Southeast 1)
- **Database**: Supabase PostgreSQL
- **Blockchain**: Solana Devnet

---

## 📦 Backend Deployment (Railway)

### 1. Project Setup

Railway đã được cấu hình với:
- Root Directory: `GMI-BE`
- Node.js: 20
- Build System: Nixpacks

### 2. Environment Variables

**Vào Railway Dashboard → Settings → Variables**, thêm tất cả các biến sau:

```bash
# Database - Supabase Transaction Pooler
DATABASE_URL=postgresql://postgres.negjhshfqvgmpuonfpdc:gimmimvp1212@aws-1-us-east-1.pooler.supabase.com:6543/postgres

# Supabase Configuration
SUPABASE_URL=https://negjhshfqvgmpuonfpdc.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lZ2poc2hmcXZnbXB1b25mcGRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNTQ5MTAsImV4cCI6MjA3NzYzMDkxMH0.HfXVSDYySwmG5LRle9m1KG0JNL_g0EQousn-euZRxk4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lZ2poc2hmcXZnbXB1b25mcGRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjA1NDkxMCwiZXhwIjoyMDc3NjMwOTEwfQ.7Lt3OfXjhOE9-CxHnUp-IV2O_dV5e7-BPPe1Y4vZVKA

# Solana Configuration
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
PROGRAM_ID=11111111111111111111111111111111

# Server Configuration
NODE_ENV=production
PORT=3001

# CORS - QUAN TRỌNG! Thêm cả 2 domains
CORS_ORIGIN=https://gimmeidea.com,https://www.gimmeidea.com

# Security
ACCESS_CODE=GMI2025
JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30
```

### 3. Generate Public Domain

**Bước này RẤT QUAN TRỌNG!**

1. Vào **Railway Dashboard** → project của bạn
2. Click tab **Settings**
3. Scroll xuống phần **Networking**
4. Click nút **"Generate Domain"**
5. Copy URL được tạo (dạng: `gimme-idea-backend.up.railway.app`)
6. **Lưu URL này lại** - bạn sẽ cần nó cho Vercel

### 4. Verify Deployment

Sau khi Railway deploy xong, test backend:

```bash
# Thay YOUR-RAILWAY-DOMAIN bằng domain vừa generate
curl https://YOUR-RAILWAY-DOMAIN.railway.app/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-01-04T...",
  "environment": "production"
}
```

### 5. Check Logs

Vào Railway Dashboard → **Deployments** → Click vào latest deployment → **View Logs**

Logs thành công sẽ hiển thị:
```
🚀 Gimme Idea Backend Server
📡 Server running on http://localhost:3001
🌍 Environment: production
🔐 Access code: GMI2025
⚡ Ready to accept connections!
```

---

## 🎨 Frontend Deployment (Vercel)

### 1. Project Setup

Vercel đã được deploy từ `GMI-FE/` directory.

### 2. Environment Variables

**Vào Vercel Dashboard → Settings → Environment Variables**

**⚠️ QUAN TRỌNG**: Phải update `NEXT_PUBLIC_API_URL` với Railway domain!

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://negjhshfqvgmpuonfpdc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lZ2poc2hmcXZnbXB1b25mcGRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNTQ5MTAsImV4cCI6MjA3NzYzMDkxMH0.HfXVSDYySwmG5LRle9m1KG0JNL_g0EQousn-euZRxk4

# Solana
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Backend API - THAY ĐỔI URL NÀY!
# Dùng Railway public domain đã generate ở bước trên
NEXT_PUBLIC_API_URL=https://YOUR-RAILWAY-DOMAIN.railway.app

# Access Code
NEXT_PUBLIC_ACCESS_CODE=GMI2025
```

### 3. Custom Domains

Vercel Dashboard → Settings → Domains:
1. Domain `gimmeidea.com` - đã configured ✅
2. Domain `www.gimmeidea.com` - đã configured ✅

### 4. Redeploy

Sau khi update environment variables:
1. Vào **Deployments** tab
2. Click vào latest deployment
3. Click **"Redeploy"**

---

## 🗄️ Database (Supabase)

### Connection Info

- **Project**: negjhshfqvgmpuonfpdc
- **Region**: AWS US East 1
- **Host**: aws-1-us-east-1.pooler.supabase.com
- **Port**: 6543 (Transaction Pooler)
- **Database**: postgres
- **Username**: postgres.negjhshfqvgmpuonfpdc
- **Password**: gimmimvp1212

### Schema Status

Database schema đã được tạo với các tables:
- ✅ Wallet
- ✅ Post
- ✅ PrizePool
- ✅ Comment
- ✅ Ranking
- ✅ Tip

Tất cả tables đã có Row Level Security (RLS) policies.

### Verify Database Connection

Test từ Railway logs hoặc local:

```bash
psql "postgresql://postgres.negjhshfqvgmpuonfpdc:gimmimvp1212@aws-1-us-east-1.pooler.supabase.com:6543/postgres" -c "SELECT COUNT(*) FROM \"Wallet\";"
```

---

## ✅ Deployment Checklist

### Backend (Railway)
- [x] Root Directory = `GMI-BE`
- [ ] Environment variables đã set đầy đủ
- [ ] Public domain đã generate
- [ ] Database connection test thành công
- [ ] Health endpoint trả về 200 OK
- [ ] Logs không có error

### Frontend (Vercel)
- [x] Deploy từ `GMI-FE/`
- [ ] Environment variables đã set
- [ ] `NEXT_PUBLIC_API_URL` đã update với Railway domain
- [ ] Custom domains (gimmeidea.com) hoạt động
- [ ] Test wallet connection trên production

### Integration Test
- [ ] Vào https://gimmeidea.com
- [ ] Click "Connect Wallet"
- [ ] Kết nối Phantom/Solflare wallet
- [ ] Verify không có CORS error
- [ ] Wallet connect thành công
- [ ] Test create post

---

## 🔧 Troubleshooting

### Lỗi CORS

**Triệu chứng**: `Access to fetch at 'https://...' from origin 'https://gimmeidea.com' has been blocked by CORS`

**Fix**:
1. Check Railway environment variable `CORS_ORIGIN`
2. Phải có: `https://gimmeidea.com,https://www.gimmeidea.com`
3. Không có dấu cách, không có trailing slash
4. Redeploy Railway

### Lỗi Database Connection

**Triệu chứng**: `Can't reach database server` hoặc timeout

**Fix**:
1. Verify `DATABASE_URL` đúng format
2. Dùng **Transaction Pooler** (port 6543), không phải Direct Connection (port 5432)
3. Check Supabase dashboard xem database có pause không

### Lỗi 500 từ Backend

**Triệu chứng**: `POST /api/wallet/connect 500`

**Debug**:
1. Check Railway logs: Dashboard → Deployments → View Logs
2. Look for error messages
3. Verify Prisma Client đã generate: `npx prisma generate`
4. Check DATABASE_URL accessible from Railway

### Build Failed trên Railway

**Triệu chứng**: TypeScript errors, missing packages

**Fix**:
1. Verify `nixpacks.toml` có `nodejs_20`
2. Check `tsconfig.json` có `strict: false`
3. Run `npm run build` locally để test
4. Push fixes và redeploy

---

## 📱 Local Development

### Start All Services

```bash
# Từ root directory
./start-local.sh
```

Hoặc manual:

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

## 🔐 Security Notes

1. **Không commit** `.env` files
2. **Rotate secrets** định kỳ (JWT_SECRET, ACCESS_CODE)
3. **Monitor logs** trên Railway & Vercel
4. **Enable RLS** trên tất cả Supabase tables
5. **Rate limiting** sẽ được thêm sau

---

## 📚 Useful Commands

```bash
# Check Railway deployment status
railway status

# View Railway logs
railway logs

# Redeploy Railway
railway up

# Check Vercel deployment
vercel --prod

# Test backend locally
curl http://localhost:3001/api/health

# Test production backend
curl https://YOUR-RAILWAY-DOMAIN.railway.app/api/health
```

---

## 🆘 Need Help?

1. **Railway Docs**: https://docs.railway.app
2. **Vercel Docs**: https://vercel.com/docs
3. **Supabase Docs**: https://supabase.com/docs
4. **Check logs** trên Railway & Vercel dashboard
5. **Verify environment variables** đã set đúng

---

## 📝 Next Steps After Deployment

1. ✅ Generate Railway public domain
2. ✅ Update Vercel `NEXT_PUBLIC_API_URL`
3. ✅ Test full flow: connect wallet → create post
4. Add monitoring & analytics
5. Setup error tracking (Sentry)
6. Configure CDN for images
7. Setup CI/CD pipeline
8. Add rate limiting
9. Implement caching strategy

---

**Last Updated**: 2025-01-04

Deployment hiện tại đang chạy trên:
- Frontend: Vercel (gimmeidea.com)
- Backend: Railway (pending domain generation)
- Database: Supabase (active)
