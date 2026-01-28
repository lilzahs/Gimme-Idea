# User Authentication & Profile Management

## Overview

A comprehensive user management system featuring Solana wallet-based authentication, email authentication, profile customization, reputation scoring, and multi-wallet support.

---

## Architecture

```
┌──────────────────────────────────────┐
│     Authentication Methods           │
├──────────────────────────────────────┤
│  Wallet Auth  │  Email Auth          │
│  (Signature)  │  (Supabase)          │
└────────┬──────┴─────────┬────────────┘
         │                │
         ▼                ▼
┌──────────────────────────────────────┐
│        JWT Token Generation           │
│        (Backend Auth Service)         │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│          User Session                 │
│    (Stored in Zustand + Local)        │
└──────────────────────────────────────┘
```

---

## Database Schema

### users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identity
  wallet VARCHAR(255) UNIQUE,  -- Primary Solana wallet
  email VARCHAR(255) UNIQUE,   -- Optional email
  username VARCHAR(100) UNIQUE NOT NULL,
  
  -- Profile
  bio TEXT,
  avatar TEXT,
  cover_image TEXT,
  
  -- Social Links
  social_links JSONB DEFAULT '{}', -- { twitter, github, telegram, ... }
  website TEXT,
  location VARCHAR(255),
  
  -- Reputation & Gamification
  reputation_score INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  
  -- Financial
  balance NUMERIC(18, 9) DEFAULT 0,  -- Tips received
  total_donated NUMERIC(18, 9) DEFAULT 0,
  total_received NUMERIC(18, 9) DEFAULT 0,
  
  -- AI Credits
  ai_credits INTEGER DEFAULT 100,
  
  -- Activity Stats
  projects_count INTEGER DEFAULT 0,
  ideas_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  
  -- Login Tracking
  last_login_at TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  
  -- Account Status
  is_verified BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  
  -- Preferences
  preferences JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_wallet ON users(wallet);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_reputation ON users(reputation_score DESC);
CREATE INDEX idx_users_created ON users(created_at DESC);
```

### user_wallets Table (Multi-Wallet Support)

```sql
CREATE TABLE user_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(255) UNIQUE NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  label VARCHAR(100), -- "Main Wallet", "Trading Wallet", etc.
  added_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP,
  
  UNIQUE(user_id, wallet_address)
);

CREATE INDEX idx_user_wallets_user ON user_wallets(user_id);
CREATE INDEX idx_user_wallets_address ON user_wallets(wallet_address);
```

### user_sessions Table

```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token_hash);
```

---

## Authentication Flows

### 1. Wallet-Based Authentication (Primary)

#### Sign-In Flow

```
1. User clicks "Connect Wallet"
2. Wallet adapter prompts for wallet selection
3. User approves connection
4. Frontend generates sign message
5. User signs message with private key
6. Frontend sends { wallet, signature } to backend
7. Backend verifies signature
8. Backend finds or creates user
9. Backend issues JWT token
10. Frontend stores token + user data
```

#### Implementation

**Frontend**:
```typescript
// components/ConnectWalletPopup.tsx
const handleWalletSignIn = async () => {
  if (!publicKey) {
    throw new Error('Wallet not connected');
  }
  
  // 1. Generate message
  const message = new TextEncoder().encode(
    `Sign this message to authenticate with Gimme Idea.\n\nWallet: ${publicKey.toString()}\nNonce: ${Date.now()}`
  );
  
  // 2. Request signature
  const signature = await signMessage(message);
  
  // 3. Send to backend
  const response = await fetch('/api/auth/wallet-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      publicKey: publicKey.toString(),
      signature: bs58.encode(signature),
      message: new TextDecoder().decode(message)
    })
  });
  
  const { token, user } = await response.json();
  
  // 4. Store token
  localStorage.setItem('auth_token', token);
  setUser(user);
};
```

**Backend**:
```typescript
// backend/src/auth/auth.service.ts
async walletLogin(dto: WalletLoginDto): Promise<AuthResponse> {
  const { publicKey, signature, message } = dto;
  
  // 1. Verify signature
  const isValid = nacl.sign.detached.verify(
    new TextEncoder().encode(message),
    bs58.decode(signature),
    bs58.decode(publicKey)
  );
  
  if (!isValid) {
    throw new UnauthorizedException('Invalid signature');
  }
  
  // 2. Find or create user
  let user = await this.usersService.findByWallet(publicKey);
  
  if (!user) {
    user = await this.usersService.create({
      wallet: publicKey,
      username: await this.generateUsername(publicKey)
    });
  }
  
  // 3. Update login stats
  await this.usersService.update(user.id, {
    last_login_at: new Date(),
    login_count: user.login_count + 1
  });
  
  // 4. Generate JWT
  const token = this.jwtService.sign({
    userId: user.id,
    wallet: publicKey
  });
  
  return { token, user };
}
```

### 2. Email Authentication (Optional)

**Flow**: Traditional email/password via Supabase Auth

```typescript
// Email signup
const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: email.split('@')[0] // default username
      }
    }
  });
  
  if (error) throw error;
  
  // Create user in custom users table
  await createUser({
    email: data.user.email,
    username: data.user.user_metadata.username
  });
};

// Email login
const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data.session;
};
```

### 3. Wallet Merge (Multiple Wallets → One Account)

**Scenario**: User connects with different wallet but already has account

```typescript
async mergeWallets(userId: string, newWallet: string): Promise<void> {
  // Check if new wallet already belongs to another user
  const existingUser = await this.usersService.findByWallet(newWallet);
  
  if (existingUser && existingUser.id !== userId) {
    // Merge accounts
    await this.mergeUserAccounts(userId, existingUser.id);
  }
  
  // Add wallet to user_wallets
  await this.db.user_wallets.create({
    data: {
      user_id: userId,
      wallet_address: newWallet,
      is_primary: false
    }
  });
}
```

---

## Profile Management

### Profile Update

```typescript
// Backend: users.service.ts
async updateProfile(
  userId: string,
  dto: UpdateProfileDto
): Promise<User> {
  const { username, bio, avatar, socialLinks, website } = dto;
  
  // Validate username uniqueness
  if (username) {
    const existing = await this.db.users.findUnique({ 
      where: { username } 
    });
    if (existing && existing.id !== userId) {
      throw new ConflictException('Username already taken');
    }
  }
  
  // Update user
  return this.db.users.update({
    where: { id: userId },
    data: {
      username,
      bio,
      avatar,
      social_links: socialLinks,
      website,
      updated_at: new Date()
    }
  });
}
```

### Avatar Upload

```typescript
// Frontend
const uploadAvatar = async (file: File) => {
  // 1. Crop/resize image
  const croppedBlob = await cropImage(file, {
    width: 400,
    height: 400,
    type: 'circle'
  });
  
  // 2. Upload to Supabase Storage
  const fileName = `avatars/${user.id}/${Date.now()}.jpg`;
  const { data, error } = await supabase.storage
    .from('user-content')
    .upload(fileName, croppedBlob);
  
  if (error) throw error;
  
  // 3. Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('user-content')
    .getPublicUrl(fileName);
  
  // 4. Update profile
  await updateProfile({ avatar: publicUrl });
};
```

---

## Reputation System

### Reputation Scoring Algorithm

```typescript
// Calculate reputation based on activity
const calculateReputation = (user: User): number => {
  let score = 0;
  
  // Projects and ideas
  score += user.projects_count * 10;
  score += user.ideas_count * 5;
  
  // Engagement
  score += user.comments_count * 2;
  score += user.followers_count * 3;
  
  // Quality metrics
  const avgProjectVotes = user.total_project_votes / user.projects_count || 0;
  score += avgProjectVotes * 0.5;
  
  // Contributions
  score += user.total_donated > 0 ? 20 : 0;
  score += user.ai_feedback_count * 5;
  
  // Penalties
  if (user.is_banned) score = 0;
  
  return Math.max(0, Math.floor(score));
};
```

### Level System

```typescript
const getLevelFromXP = (xp: number): number => {
  // Level formula: level = floor(sqrt(xp / 100))
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

const getXPForLevel = (level: number): number => {
  // XP needed for level
  return (level - 1) ** 2 * 100;
};

// Award XP for actions
const awardXP = async (userId: string, action: string) => {
  const xpMap = {
    'create_project': 50,
    'create_idea': 25,
    'comment': 5,
    'vote': 2,
    'receive_vote': 3,
    'donate': 10,
    'receive_donation': 15
  };
  
  const xp = xpMap[action] || 0;
  
  await db.users.update({
    where: { id: userId },
    data: {
      experience_points: { increment: xp }
    }
  });
  
  // Check for level up
  const user = await db.users.findUnique({ where: { id: userId }});
  const newLevel = getLevelFromXP(user.experience_points);
  
  if (newLevel > user.level) {
    await db.users.update({
      where: { id: userId },
      data: { level: newLevel }
    });
    
    // Trigger level up notification
    await notificationsService.create({
      user_id: userId,
      type: 'level_up',
      title: `Level Up! You're now level ${newLevel}`
    });
  }
};
```

---

## Social Features

### Follow System

```sql
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
```

**API**:
```typescript
// Follow user
@Post('users/:id/follow')
@UseGuards(AuthGuard)
async followUser(
  @CurrentUser('userId') userId: string,
  @Param('id') targetUserId: string
) {
  return this.usersService.follow(userId, targetUserId);
}

// Unfollow user
@Delete('users/:id/follow')
@UseGuards(AuthGuard)
async unfollowUser(
  @CurrentUser('userId') userId: string,
  @Param('id') targetUserId: string
) {
  return this.usersService.unfollow(userId, targetUserId);
}

// Get followers
@Get('users/:id/followers')
async getFollowers(
  @Param('id') userId: string,
  @Query('page') page: number = 1
) {
  return this.usersService.getFollowers(userId, page);
}

// Get following
@Get('users/:id/following')
async getFollowing(
  @Param('id') userId: string,
  @Query('page') page: number = 1
) {
  return this.usersService.getFollowing(userId, page);
}
```

---

## Frontend Components

### Profile Component

**Location**: `frontend/components/Profile.tsx` (49KB)

**Sections**:
- **Header**: Avatar, cover image, username, bio
- **Stats**: Projects, ideas, followers, reputation
- **Social Links**: Twitter, GitHub, Telegram, etc.
- **Activity Feed**: Recent projects, comments, votes
- **Projects Tab**: User's projects and ideas
- **Edit Button**: For own profile

**Key Features**:
```typescript
const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'ideas' | 'activity'>('projects');
  
  const isOwnProfile = currentUser?.id === userId;
  
  // Fetch profile data
  useEffect(() => {
    fetchProfile(userId);
    checkIfFollowing(userId);
  }, [userId]);
  
  const handleFollow = async () => {
    if (isFollowing) {
      await unfollowUser(userId);
    } else {
      await followUser(userId);
    }
    setIsFollowing(!isFollowing);
  };
  
  return (
    <div className="profile-container">
      {/* Cover Image */}
      {/* Avatar */}
      {/* Username & Bio */}
      {/* Stats */}
      {/* Follow/Edit Button */}
      {/* Tabs */}
      {/* Content */}
    </div>
  );
};
```

### Edit Profile Modal

**Features**:
- Username input
- Bio textarea (max 500 chars)
- Avatar upload with cropping
- Cover image upload
- Social links inputs
- Website URL
- Save/Cancel buttons

---

## Security

### JWT Token Structure

```typescript
interface JWTPayload {
  userId: string;
  wallet?: string;
  email?: string;
  role: 'user' | 'admin';
  iat: number; // Issued at
  exp: number; // Expires at (7 days)
}
```

### Password Requirements (Email Auth)

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Rate Limiting

```typescript
@Throttle({
  default: {
    limit: 5, // requests
    ttl: 60000 // per minute
  }
})
@Post('login')
async login(@Body() dto: LoginDto) {
  // ...
}
```

---

## Progress & Status

### ✅ Completed

1. ✅ Wallet-based authentication
2. ✅ Email authentication
3. ✅ JWT token system
4. ✅ Profile management
5. ✅ Avatar/cover upload
6. ✅ Social links
7. ✅ Follow system
8. ✅ Reputation scoring
9. ✅ Multi-wallet support
10. ✅ Login tracking

### 🚧 In Progress

1. 🚧 Level/XP system UI
2. 🚧 Achievement badges
3. 🚧 Profile verification (KYC)
4. 🚧 2FA authentication

### 📋 Planned

1. 📋 OAuth (Google, GitHub, Twitter)
2. 📋 NFT avatar support
3. 📋 Custom profile themes
4. 📋 Profile analytics
5. 📋 Activity heatmap
6. 📋 Skill tags and endorsements
7. 📋 Portfolio showcase
8. 📋 Export profile data

---

## API Reference

See [Auth API Documentation](./api/auth.md) for complete endpoint details.

## Testing

See [Auth Testing Guide](./testing/auth.md) for test cases and strategies.
