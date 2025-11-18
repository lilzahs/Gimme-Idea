# 🎨 Gimme Idea Frontend (GMI-FE)

Modern Web3 feedback platform frontend built with Next.js 16, React 19, and Solana wallet integration.

## 🏗️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **React:** 19.2.0
- **Styling:** Tailwind CSS + shadcn/ui components
- **Blockchain:** Solana (@solana/web3.js + wallet adapters)
- **Backend:** Supabase (PostgreSQL + Realtime + Storage)
- **State:** Zustand
- **Forms:** React Hook Form + Zod validation
- **UI Components:** Radix UI primitives

## 📁 Project Structure

```
GMI-FE/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Home page (posts feed)
│   ├── create/            # Create post page
│   ├── post/[id]/         # Post detail page
│   ├── dashboard/         # User dashboard
│   ├── my-projects/       # User's posts
│   ├── profile/           # User profile
│   └── connect/           # Wallet connect page
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── navbar.tsx         # Navigation bar
│   ├── post-card.tsx      # Post preview card
│   ├── wallet-button.tsx  # Wallet connect button
│   └── logo.tsx           # App logo
├── lib/
│   ├── actions/           # Server Actions (будет replaced by API calls)
│   ├── solana/            # Solana config & utilities
│   │   ├── config.ts
│   │   ├── transactions.ts
│   │   └── wallet-context.tsx
│   ├── supabase/          # Supabase clients
│   │   ├── client.ts
│   │   └── server.ts
│   ├── stores/            # Zustand stores
│   │   └── app-store.ts
│   └── utils.ts           # Utility functions
└── public/                # Static assets
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd GMI-FE
npm install
```

### 2. Setup Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Backend API
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_ACCESS_CODE="GMI2025"

# Solana
NEXT_PUBLIC_SOLANA_NETWORK="devnet"
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.devnet.solana.com"
NEXT_PUBLIC_PROGRAM_ID="your-program-id-after-deployment"

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ENABLED="false"
```

### 3. Start Development Server

```bash
npm run dev
```

App will run on http://localhost:3000

## 🔌 Integration with Backend

### Current Status (v0 Code)
- ❌ Uses Supabase Server Actions directly
- ❌ No proper authentication flow
- ❌ Missing tipping & prize distribution features

### New Architecture (In Progress)
- ✅ Connect to GMI-BE API (Express + Prisma)
- ✅ Wallet signature-based authentication
- ✅ Full prize pool & tipping functionality
- ✅ Smart contract integration for on-chain operations
- ✅ Realtime subscriptions via Supabase

### API Integration

The frontend will call GMI-BE endpoints:

```typescript
// Example: Create post with prize pool
const response = await fetch(`${API_URL}/api/posts`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-access-code': ACCESS_CODE,
    'x-wallet-address': walletAddress,
    'x-wallet-signature': signature
  },
  body: JSON.stringify({
    title,
    description,
    category,
    imageUrl,
    prizePool: {
      totalAmount: 100,
      winnersCount: 3,
      distribution: [50, 30, 20],
      endsAt: endDate
    }
  })
})
```

## 💰 Wallet Integration

Supports multiple Solana wallets:
- Phantom
- Solflare
- Backpack
- Lazorkit

### Connect Wallet Flow

```typescript
import { useWallet } from '@solana/wallet-adapter-react'

const { publicKey, signMessage } = useWallet()

// 1. User clicks "Connect"
// 2. Select wallet from modal
// 3. Approve connection
// 4. Sign authentication message
// 5. Backend verifies signature
// 6. Session created
```

## 🎯 Key Features

### For Post Owners
- ✅ Create posts with optional prize pools
- ✅ Upload images (Supabase Storage)
- ✅ View comments and rank winners
- ✅ Distribute prizes via smart contract

### For Community
- ✅ Browse posts by category
- ✅ Comment on posts (nested replies)
- ✅ Tip valuable comments (on-chain USDC)
- ✅ Compete for prizes
- ✅ Claim prizes if ranked

### Realtime Features (Coming)
- 🔄 Live comment updates
- 🔄 Live tip notifications
- 🔄 Prize distribution events

## 📦 Available Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🎨 UI Components

Using **shadcn/ui** - a collection of re-usable components built with Radix UI and Tailwind CSS.

Key components:
- `Button` - Primary actions
- `Card` - Post cards, comment cards
- `Avatar` - User avatars (wallet-based)
- `Badge` - Categories, status labels
- `Alert` - Success/error messages
- `Sheet` - Mobile navigation
- `DropdownMenu` - User actions

## 🔐 Authentication

**Wallet-based authentication:**

1. User connects wallet
2. Frontend requests signature for auth message
3. Backend verifies signature using `tweetnacl`
4. If valid, session created in database
5. Future requests include wallet address + signature headers

**No passwords, no email - just your wallet!**

## 🌐 Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy!

Vercel auto-detects Next.js and handles build/deploy.

**Production URL:** `https://gimmeidea.vercel.app` (or custom domain)

## 📝 Next Steps

- [x] Remove v0 branding
- [ ] Replace Server Actions with API calls to GMI-BE
- [ ] Implement wallet signature authentication
- [ ] Add Realtime subscriptions
- [ ] Integrate smart contract calls
- [ ] Add tip & prize features to UI
- [ ] Add loading states & error handling
- [ ] Optimize images & performance
- [ ] Add unit tests

## 🤝 Related Projects

- **GMI-BE** - Express.js backend API
- **GMI-SC** - Solana smart contract (Anchor)

## 📄 License

MIT
