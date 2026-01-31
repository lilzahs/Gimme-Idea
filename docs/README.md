# Gimme Idea - Solana Feedback Platform 💡

> **Product of DUT Superteam University Club**

A comprehensive decentralized platform built on Solana where developers showcase projects and ideas, receive community feedback, collaborate on hackathons, and earn rewards through an integrated bounty system.

---

## 🌟 Overview

**Gimme Idea** is a Web3-powered platform that bridges the gap between idea creators and builders in the Solana ecosystem. Whether you're an entrepreneur with a groundbreaking idea or a developer looking to showcase your project, Gimme Idea provides the tools and community to validate, refine, and grow your concepts.

---

## ✨ Core Features

### 🎨 Project & Idea Management

#### Dual-Mode Submission
- **Project Mode**: Showcase completed or in-progress Solana projects
- **Idea Mode**: Share and validate early-stage concepts with the community
- Support for 15+ categories including DeFi, NFT, Gaming, Infrastructure, DAO, DePIN, Social, Mobile, Security, and more
- Four development stages: Idea, Prototype, Devnet, Mainnet

#### Rich Content Support
- Detailed project descriptions with Markdown rendering
- Custom cover images and project galleries
- Tags and categorization for better discoverability
- Problem-Solution-Opportunity framework for ideas
- Team information and go-to-market strategy sections
- Anonymous submission option for sensitive ideas

#### Project Verification System
- Admin-verified badge for legitimate projects
- AI-powered quality scoring system
- Community voting and engagement metrics
- SEO-optimized project pages with unique slugs

### 🤖 AI-Powered Features

#### Gimme Sensei - AI Assistant
- **Intelligent Feedback**: AI-generated feedback on projects and ideas
- **Market Assessment**: Automated analysis of market opportunities
- **Strategic Recommendations**: Actionable suggestions for improvement
- **Technical Review**: Code review and architecture analysis capabilities
- Real-time AI chat interface with streaming responses
- Credit-based system to manage AI usage

#### AI Analysis Tools
- Automated idea validation
- Competitive landscape analysis
- Risk assessment and mitigation strategies
- Growth opportunity identification

### 🏆 Hackathon Management System

#### Comprehensive Hackathon Platform
- **Multi-Round Competitions**: Support for qualifiers, semi-finals, and finals
- **Team Formation**: Built-in team creation and member invitation system
- **Submission Tracking**: Detailed submission management with status tracking
- **Admin Dashboard**: Complete hackathon oversight and management tools

#### Scoring & Judging
- Multi-criteria scoring system
- Admin scoring interface with detailed feedback
- Winner and finalist selection mechanism
- Status management (pending, approved, rejected, winner, finalist)
- Activity logging for transparency

#### Participant Features
- Browse active hackathons
- Join existing teams or create new ones
- Submit projects with comprehensive details
- Track submission status in real-time
- View results and leaderboards

### 💬 Social & Community Features

#### Engagement System
- **Comments & Replies**: Threaded discussions on projects and ideas
- **Voting System**: Upvote projects and ideas you believe in
- **Like System**: React to individual comments
- Comment likes counter with user tracking
- Anonymous commenting option

#### Follow System
- Follow innovative creators and developers
- Get notified when people you follow post new content
- View follower/following lists
- Discover trending creators

#### Custom Feeds
- Create personalized content feeds
- Filter by categories, tags, and stages
- Follow specific topics or technologies
- Community-curated content collections
- Home feed with personalized recommendations

### 🔔 Real-time Notification System

#### Comprehensive Notifications
- **Follow Notifications**: When someone follows you
- **Post Notifications**: When people you follow publish new content
- **Comment Notifications**: When someone comments on your project
- **Reply Notifications**: When someone replies to your comment
- **Vote Notifications**: When your project receives upvotes
- **Like Notifications**: When your comments get liked
- **Donation Notifications**: When someone sponsors your project
- Unread notification counter with real-time updates
- Mark as read/unread functionality
- Notification filtering (all/unread)
**Status**: ✅ Production Ready | 📋 Push notifications planned

---

## ⚠️ FEATURE IMPLEMENTATION STATUS

### ✅ FULLY IMPLEMENTED & PRODUCTION READY

#### 1. **Project & Idea Management** ✅
- ✅ Project submission (fully working)
- ✅ Idea submission (fully working)
- ✅ Markdown editor with preview
- ✅ Image upload and cropping
- ✅ Category/stage selection (15+ categories)
- ✅ Voting system
- ✅ Comment system with threading
- ✅ Edit/delete functionality
- ✅ Search and filtering
- ✅ Anonymous submissions
- **Status**: 100% Complete - All features working in production

#### 2. **AI Features (Gimme Sensei)** ✅
- ✅ AI feedback generation
- ✅ Chat interface with streaming
- ✅ Market assessment
- ✅ Credit system
- ✅ OpenAI GPT-4/3.5 integration
- **Status**: 100% Complete - Fully functional

#### 3. **Authentication & User Profiles** ✅
- ✅ Wallet-based authentication (Solana)
- ✅ Email authentication (Supabase)
- ✅ Profile editing (avatar, bio, social links)
- ✅ Multi-wallet support
- ✅ Follow system
- ✅ Reputation scoring
- **Status**: 100% Complete - All auth methods working

#### 4. **Real-time Notifications** ✅
- ✅ All 8 notification types (follow, comment, vote, donation, etc.)
- ✅ Database triggers
- ✅ Supabase Realtime integration
- ✅ Unread count badge
- ✅ Mark as read functionality
- **Status**: 100% Complete - Real-time notifications working

#### 5. **Blockchain Payments (SOL)** ✅
- ✅ Wallet adapter integration
- ✅ SOL donation system
- ✅ SOL tip system
- ✅ Transaction verification
- ✅ Payment history
- ✅ Smart contract (basic escrow) deployed
- **Status**: 90% Complete - SOL payments fully working, USDC in progress

#### 6. **Social Features** ✅
- ✅ Follow/unfollow users
- ✅ Follower/following lists
- ✅ Activity feeds
- ✅ Custom feeds
- ✅ Bookmarking (via modal)
- **Status**: 100% Complete

#### 7. **Admin System** ✅
- ✅ Admin dashboard UI
- ✅ User management (ban/unban)
- ✅ Admin role assignment
- ✅ Project verification
- ✅ Activity logging
- ✅ System statistics
- **Status**: 85% Complete - Core features working

---

### 🚧 PARTIALLY IMPLEMENTED (Backend Ready, Frontend Incomplete)

#### 8. **Hackathon System** 🚧
**Backend**: ✅ 100% Complete (53KB service file with full implementation)
- ✅ Database schema complete (6 tables)
- ✅ All API endpoints implemented
- ✅ Team management logic
- ✅ Submission system
- ✅ Scoring system
- ✅ Admin hackathon CRUD

**Frontend**: ⚠️ 60% Complete
- ✅ Hackathon browse page exists
- ✅ Hackathon detail page exists  
- ✅ Team invitation modal (`InviteMemberModal.tsx`)
- ❌ Submission form UI incomplete
- ❌ Judging dashboard UI not built
- ❌ Team management UI incomplete
- ❌ Leaderboard display needs work

**Current Status**: Backend is production-ready, but frontend needs significant work to match backend capabilities.

**What Works**:
- Can view hackathons
- Can create teams (via API)
- Can invite members

**What Doesn't Work**:
- Cannot submit projects via UI (API works)
- Cannot judge submissions via UI (API works)
- Limited team management UI

---

### ❌ NOT IMPLEMENTED YET

#### 9. **Advanced Search** ❌
- ❌ Full-text search across projects
- ❌ Advanced filtering combinations
- ❌ Search suggestions/autocomplete
- **Status**: 0% - Planned for future

#### 10. **USDC Token Payments** ❌
- ✅ Backend verification logic exists
- ❌ Frontend UI not integrated
- ❌ Not tested in production
- **Status**: 20% - Partially coded

#### 11. **Email Digest Notifications** ❌
- ❌ Email templates not created
- ❌ Scheduled email service not implemented
- ❌ User preferences for email frequency not built
- **Status**: 0% - Planned for future

#### 12. **Mobile App** ❌
- ❌ No React Native implementation
- ❌ Mobile-optimized views only (web responsive)
- **Status**: 0% - Long-term roadmap

#### 13. **NFT Integration** ❌
- ❌ NFT avatar support
- ❌ NFT certificates for hackathon winners
- ❌ Project NFT minting
- **Status**: 0% - Planned for future

#### 14. **DAO Governance** ❌
- ❌ Community voting mechanisms
- ❌ Governance token
- ❌ Proposal system
- **Status**: 0% - Long-term roadmap

---

## 📊 OVERALL PLATFORM COMPLETION

| Category | Status | Percentage |
|----------|--------|------------|
| **Core Features (Projects/Ideas)** | ✅ Complete | 100% |
| **AI Features** | ✅ Complete | 100% |
| **Authentication & Profiles** | ✅ Complete | 100% |
| **Social Features** | ✅ Complete | 100% |
| **Notifications** | ✅ Complete | 100% |
| **Payments (SOL)** | ✅ Complete | 90% |
| **Admin System** | ✅ Mostly Complete | 85% |
| **Hackathons** | 🚧 Partial | 60% |
| **Advanced Features** | ❌ Not Started | 10% |
| **Overall Platform** | 🚧 Production Ready* | **85%** |

\* Core features are production-ready. Hackathon frontend needs completion.

---

## 🎯 WHAT YOU CAN DO RIGHT NOW (January 2026)

### ✅ Fully Functional Features:
1. ✅ Create and submit projects (with images, markdown, tags)
2. ✅ Create and submit ideas (with problem-solution framework)
3. ✅ Vote on projects and ideas
4. ✅ Comment and reply to comments
5. ✅ Get AI feedback from Gimme Sensei
6. ✅ Chat with AI assistant
7. ✅ Connect Solana wallet and authenticate
8. ✅ Edit your profile (avatar, bio, social links)
9. ✅ Follow other users
10. ✅ Receive real-time notifications
11. ✅ Donate SOL to projects
12. ✅ Tip SOL to helpful comments
13. ✅ Browse and search projects by category
14. ✅ View user profiles and activity
15. ✅ Admin: Manage users, ban/unban, verify projects

### 🚧 Limited Functionality:
1. 🚧 Browse hackathons (viewing works)
2. 🚧 Create hackathon teams (API works, UI basic)
3. 🚧 Invite team members (modal exists)

### ❌ Cannot Do Yet:
1. ❌ Submit projects to hackathons via UI
2. ❌ Judge hackathon submissions via UI
3. ❌ Pay with USDC tokens
4. ❌ Receive email notifications
5. ❌ Use NFT avatars
6. ❌ Full-text search

---

### 💰 Payments & Rewards

#### Blockchain-Integrated Payments
- **USDC/SOL Support**: Native Solana token transactions
- **Bounty System**: Set rewards for quality feedback
- **Tip System**: Reward helpful community members
- **Project Donations**: Support promising projects directly
- **Transaction Verification**: On-chain verification of all payments
- Transaction history tracking

#### Escrow Smart Contract
- Secure bounty escrow using Anchor framework
- Lock bounties for quality feedback
- Release funds to reviewers
- Cancel and refund mechanism
- Built with Rust on Solana

### 👤 User Profiles & Authentication

#### Wallet-Based Authentication
- Solana wallet integration via Wallet Adapter
- Email authentication support (via Supabase)
- Signature-based login (no passwords needed)
- JWT token authentication
- Wallet merge functionality for multi-wallet users

#### Rich User Profiles
- Customizable avatars
- Bio and social links (Twitter, GitHub, Telegram, Facebook)
- Reputation scoring system
- Activity history
- Project portfolio
- Follower/following statistics
- Login tracking and analytics

### 📊 Analytics & Insights

#### Platform Statistics
- Total projects and ideas counter
- User engagement metrics
- Total donations and tips tracking
- Active users statistics
- Category distribution analytics
- Growth trends visualization

#### Leaderboard System
- Top contributors ranking
- Most active projects
- Trending ideas
- Community champions
- Reputation-based rankings

### 🛡️ Admin & Moderation

#### Admin Control Panel
- **User Management**: Ban/unban users, manage admin roles
- **Content Moderation**: Delete inappropriate projects/comments
- **Hackathon Management**: Create, update, and manage hackathons
- **Verification System**: Verify legitimate projects
- **Analytics Dashboard**: System-wide statistics and insights
- **Activity Logging**: Complete audit trail of admin actions

#### Announcements System
- Platform-wide announcements
- Targeted announcements by user segments
- Rich text formatting support
- Schedule announcements
- Track announcement engagement

### 🎨 Premium UI/UX

#### Modern Design
- **Dark Mode**: Sleek space-themed dark interface
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Smooth Animations**: Framer Motion powered interactions
- **Premium Components**: Glassmorphism effects and gradients
- **Dynamic Backgrounds**: Animated orbs and constellation effects
- **Loading States**: Custom lightbulb loading animations

#### User Experience
- Intuitive navigation
- Context-aware tooltips
- Real-time status indicators
- Progress tracking
- Error boundaries for stability
- Markdown preview and editing
- Image cropping and optimization

### 🔒 Security Features

#### Data Protection
- Row-Level Security (RLS) with Supabase
- Secure authentication flows
- Transaction verification
- Input validation and sanitization
- XSS protection
- CORS configuration
- Rate limiting via NestJS Throttler

#### Privacy Features
- Anonymous submissions
- Anonymous commenting
- Wallet privacy options
- Data encryption
- Secure file uploads

### 📱 Additional Features

#### Contact & Support
- Contact modal with president profile
- Social media integration
- Support ticket system ready
- Documentation pages
- Terms of Service and Privacy Policy pages

#### Developer Tools
- Comprehensive API documentation
- TypeScript support throughout
- GraphQL-ready infrastructure
- Webhook support for integrations
- SDK for third-party integrations

#### Content Discovery
- Advanced search functionality
- Category filtering
- Tag-based discovery
- Trending algorithm
- Recommended projects based on interests
- Recent activity feed

---

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand
- **Blockchain**: @solana/web3.js, Solana Wallet Adapter
- **UI Components**: Custom component library with Framer Motion
- **Forms**: React Hook Form + Zod validation
- **API Calls**: Axios with React Query
- **Markdown**: React Markdown with syntax highlighting
- **Charts**: Recharts for analytics visualization

### Backend Stack
- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma Client
- **Authentication**: Passport JWT
- **AI Integration**: OpenAI GPT API
- **Blockchain**: @solana/web3.js for transaction verification
- **Security**: Helmet, Rate Limiting, CORS
- **Validation**: class-validator, class-transformer

### Smart Contract
- **Framework**: Anchor 0.29.0
- **Language**: Rust
- **Network**: Solana (Devnet/Mainnet ready)
- **Features**: Escrow, Bounty Management

### Database Schema
- **Users Table**: Profiles, wallets, reputation
- **Projects Table**: Both projects and ideas with polymorphic support
- **Comments Table**: Threaded discussions
- **Transactions Table**: On-chain transaction records
- **Notifications Table**: Real-time notification system
- **Follows Table**: Social graph
- **Hackathons Table**: Competition management
- **Feeds Table**: Custom content curation
- **Admin Tables**: Roles, permissions, activity logs

### Infrastructure
- **Hosting**: Vercel (Frontend), Railway/Render (Backend)
- **Database**: Supabase (PostgreSQL + Realtime)
- **Storage**: Supabase Storage for images
- **CDN**: Cloudflare for static assets
- **Blockchain**: Solana RPC (Alchemy/QuickNode)
- **Analytics**: Google Analytics

---

## 🚀 Key Workflows

### For Idea Creators
1. Connect Solana wallet
2. Submit idea with problem-solution framework
3. Receive AI-powered initial feedback
4. Get community votes and comments
5. Iterate based on feedback
6. Import idea into project when ready to build

### For Developers
1. Showcase project with rich media
2. Set bounties for quality feedback
3. Engage with community comments
4. Receive donations from supporters
5. Track project analytics
6. Participate in hackathons

### For Community Members
1. Browse projects and ideas by category
2. Vote on promising concepts
3. Provide constructive feedback
4. Earn tips for valuable insights
5. Follow interesting creators
6. Join hackathon teams

### For Hackathon Organizers
1. Create hackathon via admin panel
2. Set rounds, criteria, and prizes
3. Monitor submissions
4. Score and judge projects
5. Announce winners
6. Distribute rewards

---

## 📦 Project Structure

```
Gimme-Idea/
├── frontend/               # Next.js frontend application
│   ├── app/               # Next.js app router pages
│   ├── components/        # React components (50+ components)
│   ├── contexts/          # React contexts (Auth, etc.)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and helpers
│   └── public/            # Static assets
├── backend/               # NestJS backend API
│   ├── src/
│   │   ├── admin/        # Admin management module
│   │   ├── ai/           # AI service integration
│   │   ├── auth/         # Authentication module
│   │   ├── comments/     # Comments module
│   │   ├── feeds/        # Custom feeds module
│   │   ├── hackathons/   # Hackathon management
│   │   ├── payments/     # Payment verification
│   │   ├── projects/     # Projects/Ideas module
│   │   ├── settings/     # User settings
│   │   └── users/        # User management
│   ├── database/         # SQL migrations and schemas
│   └── prisma/           # Prisma schema
├── programs/             # Solana smart contract
│   └── gimme-idea/       # Anchor program
└── scripts/              # Deployment and utility scripts
```

---

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` - Wallet sign-in
- `POST /api/auth/signup` - Create account
- `POST /api/auth/verify` - Verify signature

### Projects & Ideas
- `GET /api/projects` - List projects/ideas
- `POST /api/projects` - Create project/idea
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/vote` - Vote on project

### Comments
- `GET /api/comments` - Get comments for project
- `POST /api/comments` - Create comment
- `POST /api/comments/:id/like` - Like comment

### AI Features
- `POST /api/ai/feedback` - Generate AI feedback
- `POST /api/ai/analyze` - Analyze idea
- `POST /api/ai/chat` - AI chat (streaming)

### Hackathons
- `GET /api/hackathons` - List hackathons
- `POST /api/hackathons/:id/join` - Join hackathon
- `POST /api/hackathons/:id/submit` - Submit project
- `GET /api/hackathons/:id/submissions` - Get submissions

### Social
- `POST /api/users/:id/follow` - Follow user
- `GET /api/users/:id/followers` - Get followers
- `GET /api/notifications` - Get notifications
- `PATCH /api/notifications/:id/read` - Mark as read

### Payments
- `POST /api/payments/verify` - Verify transaction
- `GET /api/payments/history` - Transaction history

### Admin
- `GET /api/admin/stats` - System statistics
- `DELETE /api/admin/projects/:id` - Delete any project
- `POST /api/admin/users/:id/ban` - Ban user
- `POST /api/admin/hackathons` - Create hackathon

---

## 🌐 Deployment

### Frontend (Vercel)
- Zero-config deployment
- Automatic HTTPS
- Environment variables configured
- Edge functions ready

### Backend (Railway/Render)
- PostgreSQL database included
- Auto-scaling
- Health checks
- Logging and monitoring

### Smart Contract (Solana)
- Deployed on Devnet/Mainnet
- Anchor verified
- Program upgrade authority managed

---

## 🔐 Environment Variables

### Frontend
```env
NEXT_PUBLIC_API_URL=https://api.gimmeidea.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_PROGRAM_ID=your_program_id
```

### Backend
```env
DATABASE_URL=postgresql://...
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
PLATFORM_WALLET_ADDRESS=your_wallet
```

---

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Environment Variables Checklist](./ENV_VARS_CHECKLIST.md)
- [Required Environment Variables](./REQUIRED_ENV_VARS.md)
- [Frontend README](./frontend/README.md)
- [Smart Contract README](./programs/README.md)

---

## 🤝 Contributing

This is a product of **DUT Superteam University Club**. For contributions and collaborations, please contact the team.

---

## 📄 License

© 2025 Gimme Idea Protocol. Product of DUT Superteam University Club

---

## 🔗 Links

- **Platform**: [gimmeidea.com](https://gimmeidea.com)
- **Documentation**: [docs.gimmeidea.com](https://docs.gimmeidea.com)
- **GitHub**: This repository

---

## 🙌 Acknowledgments

Built with ❤️ by the DUT Superteam University Club for the Solana ecosystem.

**Core Technologies:**
- Solana Blockchain
- Next.js / React
- NestJS
- Supabase
- OpenAI
- Anchor Framework

---

**Made with 💡 on Solana**
