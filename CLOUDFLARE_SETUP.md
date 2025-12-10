# Cloudflare CDN Setup Guide

## Kiến trúc tối ưu

```
Frontend (Vercel) → Cloudflare CDN → Backend (Render) + Supabase
```

### Mục đích:
- **Supabase**: Database, Auth (Google OAuth), Realtime
- **Cloudflare**: CDN, Edge Cache, DDoS Protection
- **Giảm egress** bằng cách cache public API responses

---

## 1. Cấu hình Cloudflare

### Bước 1: Thêm domain vào Cloudflare
1. Đăng nhập Cloudflare Dashboard
2. Add Site → Nhập domain của bạn
3. Chọn plan Free
4. Cập nhật Nameservers tại nhà đăng ký domain

### Bước 2: Cấu hình DNS
```
Type    Name              Content                         Proxy
A       @                 76.76.21.21 (Vercel)           ✅ Proxied
CNAME   www               cname.vercel-dns.com           ✅ Proxied
CNAME   api               your-backend.onrender.com      ✅ Proxied
```

### Bước 3: Cấu hình Page Rules (Caching)

#### Rule 1: Cache static assets
```
URL: gimmeidea.com/_next/static/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 1 year
```

#### Rule 2: Cache public API (Read-only endpoints)
```
URL: api.gimmeidea.com/api/projects*
Settings:
  - Cache Level: Cache Everything  
  - Edge Cache TTL: 5 minutes
  - Origin Cache Control: On
```

#### Rule 3: Bypass cache for auth
```
URL: api.gimmeidea.com/api/auth/*
Settings:
  - Cache Level: Bypass
```

---

## 2. Cấu hình Backend cho Cloudflare Cache

### Thêm Cache Headers trong NestJS

```typescript
// backend/src/common/interceptors/cache-control.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CacheControlInterceptor implements NestInterceptor {
  constructor(private readonly maxAge: number = 300) {} // 5 minutes default

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        response.setHeader('Cache-Control', `public, max-age=${this.maxAge}, s-maxage=${this.maxAge}`);
        response.setHeader('CDN-Cache-Control', `max-age=${this.maxAge}`);
        response.setHeader('Cloudflare-CDN-Cache-Control', `max-age=${this.maxAge}`);
      }),
    );
  }
}
```

### Áp dụng cho Public Endpoints

```typescript
// backend/src/projects/projects.controller.ts
import { CacheControlInterceptor } from '../common/interceptors/cache-control.interceptor';

@Controller('projects')
export class ProjectsController {
  
  @Get()
  @UseInterceptors(new CacheControlInterceptor(300)) // Cache 5 minutes
  async getProjects() {
    // ...
  }

  @Get('recommended')
  @UseInterceptors(new CacheControlInterceptor(600)) // Cache 10 minutes
  async getRecommended() {
    // ...
  }
}
```

---

## 3. Frontend: Tối ưu API Calls

### Sử dụng SWR/React Query với Stale-While-Revalidate

```typescript
// frontend/lib/api-client.ts
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add cache hints for Cloudflare
  if (options.method === 'GET' || !options.method) {
    headers['CF-Cache-Status'] = 'dynamic';
  }

  // ... rest of function
}
```

---

## 4. Supabase Tối ưu Realtime

### Giới hạn Realtime Connections

```typescript
// frontend/lib/supabase.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 5, // Giảm từ 10 xuống 5
    },
  },
  global: {
    headers: {
      'x-client-info': 'gimme-idea-web',
    },
  },
});
```

### Chỉ Subscribe khi cần thiết

```typescript
// Chỉ subscribe realtime khi user đang xem detail page
// Không subscribe ở Dashboard/listing pages
```

---

## 5. Environment Variables

### Vercel (.env.production)
```env
NEXT_PUBLIC_API_URL=https://api.gimmeidea.com/api
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### Render (Backend)
```env
CORS_ORIGINS=https://gimmeidea.com,https://www.gimmeidea.com
```

---

## 6. Monitoring Egress

### Supabase Dashboard
- Database → Usage → Egress
- Realtime → Connections

### Cloudflare Analytics
- Analytics → Traffic
- Cache → Hit Rate (mục tiêu > 80%)

---

## 7. Checklist triển khai

- [ ] Thêm domain vào Cloudflare
- [ ] Cấu hình DNS records
- [ ] Tạo Page Rules cho caching
- [ ] Thêm CacheControlInterceptor vào backend
- [ ] Test cache hit rate
- [ ] Monitor egress trong 24h

---

## Kết quả mong đợi

| Metric | Trước | Sau |
|--------|-------|-----|
| Egress/ngày | ~500MB | ~50MB |
| Cache Hit Rate | 0% | 80%+ |
| API Latency | 200ms | 50ms (edge) |
| Realtime connections | ∞ | Controlled |
