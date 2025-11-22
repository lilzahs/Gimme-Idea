# Deploy Gimme Idea New UI lên Vercel

## ⚠️ Lưu ý quan trọng

UI này được build với **Vite + React**, KHÔNG phải Next.js. File `vercel.json` đã được cấu hình đúng.

## 📋 Các bước deploy

### 1. Cấu hình Vercel Project Settings

Khi deploy, hãy đảm bảo các settings sau:

#### Build & Development Settings:
- **Framework Preset**: `Other` (hoặc `Vite`)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### Root Directory:
- Chọn folder `gimme-idea-new-ui` làm root directory

### 2. Environment Variables

Thêm các environment variables sau vào Vercel:

```bash
# Gemini AI (optional)
GEMINI_API_KEY=your_gemini_key_here

# Supabase Configuration
VITE_SUPABASE_URL=https://negjhshfqvgmpuonfpdc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lZ2poc2hmcXZnbXB1b25mcGRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNTQ5MTAsImV4cCI6MjA3NzYzMDkxMH0.HfXVSDYySwmG5LRle9m1KG0JNL_g0EQousn-euZRxk4

# Solana Configuration
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com

# Access Code
VITE_ACCESS_CODE=GMI2025

# Backend API - SỬ DỤNG PRODUCTION URL
VITE_API_URL=https://gimme-idea-production.up.railway.app
```

**QUAN TRỌNG**: Nhớ đổi `VITE_API_URL` sang production Railway URL!

### 3. Deploy

#### Option 1: Deploy qua Vercel CLI
```bash
cd gimme-idea-new-ui
npm install -g vercel
vercel
```

#### Option 2: Deploy qua Vercel Dashboard
1. Vào https://vercel.com/new
2. Import repository
3. Chọn root directory: `gimme-idea-new-ui`
4. Vercel sẽ tự động detect settings từ `vercel.json`
5. Thêm environment variables
6. Click Deploy

### 4. Sau khi Deploy

1. **Test ứng dụng**: Mở URL Vercel cung cấp
2. **Kiểm tra kết nối**:
   - Backend API có hoạt động không
   - Supabase có connect được không
   - Solana wallet có kết nối được không
3. **Update CORS**: Thêm Vercel URL vào CORS origin của backend

## 🔧 Troubleshooting

### Lỗi: "No Next.js version detected"
- ✅ Đã fix bằng `vercel.json`
- Đảm bảo Framework Preset = "Other" hoặc "Vite"

### Build failed
- Kiểm tra `npm run build` có chạy được local không
- Check node version (cần Node 18+)
- Xem build logs trong Vercel

### Environment variables không hoạt động
- Đảm bảo tất cả variables có prefix `VITE_`
- Redeploy sau khi thêm env vars
- Check trong build logs xem vars có được load không

### API calls fail
- Kiểm tra `VITE_API_URL` đã đúng chưa
- Đảm bảo Railway backend đang chạy
- Check CORS settings trong backend

## 📝 Checklist Deploy

- [ ] File `vercel.json` đã có
- [ ] Root Directory = `gimme-idea-new-ui`
- [ ] Framework = "Other" hoặc "Vite"
- [ ] Build Command = `npm run build`
- [ ] Output Directory = `dist`
- [ ] Environment variables đã thêm đầy đủ
- [ ] `VITE_API_URL` đã đổi sang production
- [ ] Backend Railway đang chạy
- [ ] Test build local: `npm run build && npm run preview`

## 🚀 Production URLs

Sau khi deploy xong:
- **Frontend (Vercel)**: https://your-project.vercel.app
- **Backend (Railway)**: https://gimme-idea-production.up.railway.app
- **Database (Supabase)**: https://negjhshfqvgmpuonfpdc.supabase.co
