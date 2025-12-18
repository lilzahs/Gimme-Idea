# Gimme Idea - Site Demo

A simplified demo version of Gimme Idea platform with core functionalities.

## Features

### ✅ Core Features
1. **Connect Wallet** (via Lazorkit passkey)
2. **Create/Submit Ideas**
3. **View Ideas List**
4. **Tip Ideas** (SOL transactions)
5. **Vote on Ideas**
6. **Comment on Ideas**

### 🏗️ Tech Stack
- **Frontend**: Next.js 14, React, TailwindCSS
- **Wallet**: Lazorkit (Passkey-based wallet)
- **Blockchain**: Solana (Devnet)
- **Backend**: NestJS (shared with main project)

## Getting Started

```bash
cd sitedemo/frontend
npm install
npm run dev
```

## Project Structure

```
sitedemo/
├── frontend/
│   ├── app/
│   │   ├── page.tsx         # Home page with ideas list
│   │   ├── layout.tsx       # Root layout
│   │   └── idea/[id]/       # Idea detail page
│   ├── components/
│   │   ├── Navbar.tsx       # Navigation with wallet connect
│   │   ├── IdeaCard.tsx     # Idea card component
│   │   ├── CreateIdeaModal.tsx
│   │   ├── TipModal.tsx     # SOL tip modal
│   │   └── WalletButton.tsx
│   ├── contexts/
│   │   └── WalletContext.tsx
│   └── lib/
│       └── api.ts           # API client
└── README.md
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```
