# Vercel Environment Variables Setup

## 📋 Tất Cả Biến Môi Trường Cần Thiết

Vào **Vercel Dashboard → Project → Settings → Environment Variables**

### ✅ Add Các Biến Sau:

```bash
# Gemini AI (Optional - chỉ nếu UI dùng Gemini)
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://negjhshfqvgmpuonfpdc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lZ2poc2hmcXZnbXB1b25mcGRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNTQ5MTAsImV4cCI6MjA3NzYzMDkxMH0.HfXVSDYySwmG5LRle9m1KG0JNL_g0EQousn-euZRxk4

# Solana Configuration (Required)
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com

# Access Code (Required)
VITE_ACCESS_CODE=GMI2025

# Backend API (Required - Production URL)
VITE_API_URL=https://gimme-idea-production.up.railway.app
```

## 🎯 Lưu Ý Quan Trọng

### 1. VITE_API_URL
**QUAN TRỌNG**: Phải dùng **Production Railway URL**, không phải localhost!

```bash
✅ ĐÚNG: VITE_API_URL=https://gimme-idea-production.up.railway.app
❌ SAI: VITE_API_URL=http://localhost:3001
```

### 2. Environment Selection
Khi thêm mỗi biến, chọn:
```
Environment: Production, Preview, Development (Select All)
```

### 3. Prefix VITE_
Tất cả biến môi trường phải có prefix `VITE_` để Vite expose ra client-side.

```bash
✅ VITE_SUPABASE_URL
✅ VITE_API_URL
❌ SUPABASE_URL (sẽ không work)
❌ API_URL (sẽ không work)
```

## 📝 Cách Add Environment Variables

### Method 1: Vercel UI (Recommended)

1. Vào https://vercel.com/dashboard
2. Click vào project của bạn
3. Settings → Environment Variables
4. Click **"Add"**
5. Điền:
   - **Key**: Tên biến (vd: `VITE_SUPABASE_URL`)
   - **Value**: Giá trị (vd: `https://negjhshfqvgmpuonfpdc.supabase.co`)
   - **Environments**: Select all (Production, Preview, Development)
6. Click **"Save"**
7. Lặp lại cho tất cả biến

### Method 2: Vercel CLI

```bash
cd gimme-idea-new-ui

# Add từng biến
vercel env add VITE_SUPABASE_URL production
# Paste value khi prompted

vercel env add VITE_SUPABASE_ANON_KEY production
# Paste value

vercel env add VITE_SOLANA_NETWORK production
# Type: devnet

vercel env add VITE_SOLANA_RPC_URL production
# Type: https://api.devnet.solana.com

vercel env add VITE_ACCESS_CODE production
# Type: GMI2025

vercel env add VITE_API_URL production
# Type: https://gimme-idea-production.up.railway.app
```

## 🔄 Sau Khi Add Environment Variables

### Redeploy
Environment variables chỉ apply cho deployments mới!

**Option A: Via UI**
```
Deployments → Click "..." → Redeploy
```

**Option B: Via Git Push**
```bash
git commit --allow-empty -m "Trigger Vercel redeploy"
git push
```

**Option C: Via CLI**
```bash
vercel --prod
```

## ✅ Verify Environment Variables

### 1. Check Deployment Logs
Vercel Dashboard → Deployments → Latest → Build Logs

Tìm:
```
✓ Environment variables loaded
```

### 2. Check Production Site
Mở Vercel URL → F12 Console → Type:

```javascript
// Check if env vars are loaded (will be undefined in production for security)
console.log(import.meta.env.VITE_API_URL) // Should NOT show in production
```

**Note**: VITE_ vars are replaced at build time, không accessible lúc runtime!

### 3. Test API Connection
Nếu site loads nhưng không connect được backend:
1. Check CORS settings trong Railway backend
2. Verify VITE_API_URL đúng URL
3. Check Network tab (F12) → API requests

## 🐛 Troubleshooting

### Lỗi: "Failed to fetch" / CORS Error

**Nguyên nhân**: Backend không allow Vercel domain

**Fix**: Update CORS trong Railway

```bash
# GMI-BE Railway Environment Variables
CORS_ORIGIN=http://localhost:3000,https://your-app.vercel.app
```

Thay `your-app.vercel.app` bằng Vercel URL thực tế của bạn.

### Lỗi: Environment variables undefined

**Check:**
1. ✅ Tất cả có prefix `VITE_`
2. ✅ Đã redeploy sau khi add vars
3. ✅ Build logs show "Environment variables loaded"

### Lỗi: Wallet không connect

**Check:**
```bash
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
```

Đảm bảo cả 2 biến đều có!

## 📊 Full Environment Variables Checklist

Copy-paste vào Vercel:

- [ ] `GEMINI_API_KEY` (optional)
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `VITE_SOLANA_NETWORK`
- [ ] `VITE_SOLANA_RPC_URL`
- [ ] `VITE_ACCESS_CODE`
- [ ] `VITE_API_URL` (Production Railway URL!)

## 🔗 Related

- [VERCEL-DEPLOY.md](VERCEL-DEPLOY.md) - Full deployment guide
- [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md) - General deployment info

---

**Total Variables**: 7 (6 required + 1 optional)
**Setup Time**: ~5 minutes
**Status**: Ready for Production ✅
