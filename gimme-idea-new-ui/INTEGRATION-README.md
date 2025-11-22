# Gimme Idea New UI - Backend & Database Integration

## ✅ Đã Hoàn Thành

### 1. Environment Variables (.env.local)
- ✅ Backend API URL (local: `http://localhost:3001`)
- ✅ Supabase URL và Anon Key
- ✅ Solana RPC URL (Devnet)
- ✅ Access Code: `GMI2025`

### 2. Dependencies Installed
- ✅ `@supabase/supabase-js` - Supabase client
- ✅ `@solana/wallet-adapter-react` - Solana wallet adapter
- ✅ `@solana/wallet-adapter-react-ui` - Wallet UI components
- ✅ `@solana/wallet-adapter-wallets` - Wallet implementations
- ✅ `@solana/web3.js` - Solana Web3 library
- ✅ `bs58` - Base58 encoding for signatures

### 3. Created Files

#### lib/api-client.ts
API client để giao tiếp với backend:
- `getPosts()` - Lấy danh sách posts
- `getPost(id)` - Lấy chi tiết post
- `createPost()` - Tạo post mới
- `updatePost()` - Cập nhật post
- `deletePost()` - Xóa post
- `getComments()` - Lấy comments
- `createComment()` - Tạo comment
- `uploadImage()` - Upload ảnh
- `getWalletInfo()` - Lấy thông tin wallet
- `getRankings()` - Lấy bảng xếp hạng
- `healthCheck()` - Kiểm tra backend

#### lib/supabase.ts
Supabase client configuration:
- `supabase` - Supabase client instance
- `uploadImageToSupabase()` - Upload ảnh lên Supabase Storage
- `deleteImageFromSupabase()` - Xóa ảnh từ Supabase

#### lib/solana-utils.ts
Solana utilities:
- `connection` - Solana connection instance
- `generateSignatureMessage()` - Tạo message để sign
- `signMessage()` - Sign message với wallet
- `isValidSolanaAddress()` - Validate Solana address
- `getSolBalance()` - Lấy SOL balance
- `shortenAddress()` - Rút gọn address để hiển thị

#### lib/wallet-context.tsx
Solana Wallet Context Provider:
- Wrap app với WalletContextProvider
- Hỗ trợ Phantom, Solflare, Torus, Ledger wallets
- Auto-connect functionality

### 4. Cấu Hình

#### vite.config.ts
- ✅ Port đã đổi sang `3002` (tránh conflict với UI cũ)
- ✅ Expose tất cả environment variables

## 🚀 Cách Sử Dụng

### 1. Chạy Backend (nếu chưa chạy)
```bash
cd GMI-BE
npm run dev
```
Backend sẽ chạy trên `http://localhost:3001`

### 2. Chạy UI Mới
```bash
cd gimme-idea-new-ui
npm run dev
```
UI mới sẽ chạy trên `http://localhost:3002`

### 3. Tích Hợp Wallet Adapter vào App.tsx

Để sử dụng Solana wallet, wrap App component với WalletContextProvider:

```tsx
// index.tsx hoặc main.tsx
import { WalletContextProvider } from './lib/wallet-context';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletContextProvider>
      <App />
    </WalletContextProvider>
  </React.StrictMode>
);
```

### 4. Sử Dụng API Client

```tsx
import apiClient from './lib/api-client';
import { useWallet } from '@solana/wallet-adapter-react';
import { signMessage, generateSignatureMessage } from './lib/solana-utils';

// Example: Fetch posts
const { data } = await apiClient.getPosts({ category: 'DeFi' });

// Example: Create post với wallet signature
const wallet = useWallet();
const message = generateSignatureMessage('create_post');
const { signature } = await signMessage(message, wallet.signMessage);

const result = await apiClient.createPost(
  postData,
  wallet.publicKey.toString(),
  signature,
  message
);
```

### 5. Sử Dụng Supabase

```tsx
import { uploadImageToSupabase } from './lib/supabase';

// Upload image
const result = await uploadImageToSupabase(file, 'post-images');
if (result.success) {
  console.log('Image URL:', result.url);
}
```

## 📝 Lưu Ý

1. **Backend phải chạy trước** khi test UI mới
2. **Access Code** đã được tự động thêm vào mọi API request
3. **Wallet signature** cần thiết cho các operations: create, update, delete
4. **UI cũ** (GMI-FE test) vẫn chạy trên port `3000`
5. **UI mới** chạy trên port `3002`

## 🔧 Environment Variables

Tất cả environment variables có prefix `VITE_` để Vite có thể access:
- `VITE_API_URL` - Backend API URL
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key
- `VITE_SOLANA_NETWORK` - Solana network (devnet/mainnet)
- `VITE_SOLANA_RPC_URL` - Solana RPC endpoint
- `VITE_ACCESS_CODE` - Access code cho backend

## 🎯 Next Steps

1. ✅ Tích hợp WalletContextProvider vào App
2. ✅ Replace mock data với real API calls
3. ✅ Implement wallet signature cho create/update operations
4. ✅ Test upload functionality
5. ✅ Test authentication flow
