# Project & Idea Management System

## Overview

The Project & Idea Management System is the core feature of Gimme Idea, enabling users to submit, showcase, and manage both fully-developed projects and early-stage ideas on the Solana blockchain.

---

## Architecture

### Data Model

#### Projects Table (Polymorphic Design)
The system uses a unified `projects` table that supports both project and idea types:

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  type VARCHAR(20) CHECK (type IN ('project', 'idea')),
  author_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  stage VARCHAR(50) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  website TEXT,
  bounty NUMERIC(18, 9) DEFAULT 0,
  votes INTEGER DEFAULT 0,
  feedback_count INTEGER DEFAULT 0,
  image_url TEXT,
  cover_image_url TEXT,
  slug TEXT UNIQUE,
  verified BOOLEAN DEFAULT FALSE,
  ai_score NUMERIC(5, 2),
  
  -- Idea-specific fields
  problem TEXT,
  solution TEXT,
  opportunity TEXT,
  go_market TEXT,
  team_info TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Categories Supported

1. **DeFi** - Decentralized Finance
2. **NFT** - Non-Fungible Tokens
3. **Gaming** - GameFi and Play-to-Earn
4. **Infrastructure** - Core blockchain infrastructure
5. **DAO** - Decentralized Autonomous Organizations
6. **DePIN** - Decentralized Physical Infrastructure
7. **Social** - Social media and networking
8. **Mobile** - Mobile-first applications
9. **Security** - Security and auditing tools
10. **Payment** - Payment solutions
11. **Developer Tooling** - SDKs, frameworks, tools
12. **ReFi** - Regenerative Finance
13. **Content** - Content creation and distribution
14. **Dapp** - Decentralized applications
15. **Blinks** - Blockchain links and interactions

### Development Stages

1. **Idea** - Concept stage, not yet implemented
2. **Prototype** - Working prototype or MVP
3. **Devnet** - Deployed on Solana Devnet
4. **Mainnet** - Live on Solana Mainnet

---

## Frontend Implementation

### Components

#### 1. SubmissionModal.tsx
**Purpose**: Universal modal for submitting projects or ideas

**Key Features**:
- Dynamic form rendering based on type (project/idea)
- Markdown editor with live preview
- Image upload with cropping
- Tag management
- Category and stage selection
- Bounty setting
- Anonymous submission toggle
- Wallet connection requirement

**Technical Details**:
```typescript
Interface ISubmissionForm {
  type: 'project' | 'idea';
  title: string;
  description: string;
  category: string;
  stage: string;
  tags: string[];
  website?: string;
  bounty?: number;
  image?: File;
  
  // Idea-specific
  problem?: string;
  solution?: string;
  opportunity?: string;
  go_market?: string;
  team_info?: string;
  is_anonymous?: boolean;
}
```

#### 2. ProjectDetail.tsx
**Purpose**: Display full project details with engagement features

**Features**:
- Rich content display with Markdown rendering
- Vote button with real-time counter
- Comment section
- Donation button
- Edit capability for authors
- Share functionality
- Verified badge display
- AI score visualization

#### 3. IdeaDetail.tsx
**Purpose**: Display idea details with problem-solution framework

**Additional Features** (beyond ProjectDetail):
- Problem-Solution-Opportunity sections
- Go-to-market strategy display
- Team information
- Anonymous author handling
- "Import to Project" functionality
- AI feedback generation

#### 4. Dashboard.tsx
**Purpose**: Browse and filter projects/ideas

**Features**:
- Dual-mode view (project/idea)
- Category filtering
- Stage filtering
- Tag filtering
- Search functionality
- Sort options (trending, recent, top-voted)
- Pagination
- Grid/list view toggle

#### 5. EditProjectModal.tsx
**Purpose**: Edit existing projects/ideas

**Capabilities**:
- Pre-populated form with existing data
- All submission features
- Image replacement
- Status updates
- Save draft functionality

---

## Backend Implementation

### API Endpoints

#### Create Project/Idea
```
POST /api/projects
Headers: Authorization: Bearer <token>

Body: {
  type: "project" | "idea",
  title: string,
  description: string,
  category: string,
  stage: string,
  tags: string[],
  website?: string,
  bounty?: number,
  image?: base64,
  problem?: string,
  solution?: string,
  opportunity?: string,
  go_market?: string,
  team_info?: string,
  is_anonymous?: boolean
}

Response: {
  success: true,
  data: { id: UUID, slug: string, ... }
}
```

#### Get Projects/Ideas (List)
```
GET /api/projects?type=project&category=DeFi&stage=Mainnet&sort=trending&page=1&limit=20

Response: {
  success: true,
  data: {
    projects: [...],
    total: number,
    page: number,
    totalPages: number
  }
}
```

#### Get Single Project
```
GET /api/projects/:id  (or /api/projects/slug/:slug)

Response: {
  success: true,
  data: {
    id: UUID,
    type: string,
    title: string,
    description: string,
    author: { id, username, avatar, ... },
    votes: number,
    hasVoted: boolean,  // for current user
    comments: Comment[],
    ...
  }
}
```

#### Update Project
```
PUT /api/projects/:id
Headers: Authorization: Bearer <token>

Body: { ... same as create ... }

Response: { success: true, data: {...} }
```

#### Delete Project
```
DELETE /api/projects/:id
Headers: Authorization: Bearer <token>

Response: { success: true }
```

#### Vote on Project
```
POST /api/projects/:id/vote
Headers: Authorization: Bearer <token>

Response: {
  success: true,
  data: { votes: number, hasVoted: true }
}
```

#### Import Idea to Project
```
POST /api/projects/:ideaId/import
Headers: Authorization: Bearer <token>

Body: {
  newStage: "Prototype" | "Devnet" | "Mainnet",
  website?: string,
  additionalInfo?: string
}

Response: { success: true, data: { newProjectId: UUID } }
```

### Service Layer (NestJS)

#### ProjectsService
Located: `backend/src/projects/projects.service.ts`

**Key Methods**:
- `create(userId: string, dto: CreateProjectDto): Promise<Project>`
- `findAll(filters: ProjectFilters): Promise<PaginatedProjects>`
- `findOne(id: string, userId?: string): Promise<ProjectDetail>`
- `findBySlug(slug: string, userId?: string): Promise<ProjectDetail>`
- `update(userId: string, id: string, dto: UpdateProjectDto): Promise<Project>`
- `delete(userId: string, id: string): Promise<void>`
- `vote(userId: string, projectId: string): Promise<VoteResult>`
- `unvote(userId: string, projectId: string): Promise<VoteResult>`
- `importIdeaToProject(userId: string, ideaId: string, dto: ImportDto): Promise<Project>`

**Business Logic**:
1. **Slug Generation**: Auto-generate unique slugs from titles
2. **Anonymous Handling**: Hide author info for anonymous submissions
3. **Voting Logic**: Prevent duplicate votes via `project_votes` table
4. **Permission Checks**: Ensure only authors can edit/delete
5. **AI Score Calculation**: Trigger AI analysis on creation
6. **Notification Triggers**: Notify followers on new posts

---

## Database Schema Details

### Tables

#### projects
Primary table for both projects and ideas

**Indexes**:
- `idx_projects_type` - Fast filtering by type
- `idx_projects_author` - Author's projects lookup
- `idx_projects_category` - Category filtering
- `idx_projects_stage` - Stage filtering
- `idx_projects_votes` - Sort by popularity
- `idx_projects_created` - Sort by recency
- `idx_projects_slug` - Unique slug lookup

#### project_votes
Tracks user votes on projects

```sql
CREATE TABLE project_votes (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP,
  UNIQUE(project_id, user_id)
);
```

**Purpose**: Prevent duplicate voting

### Database Functions

#### generate_slug(title TEXT)
Generates URL-friendly slugs from titles

```sql
CREATE FUNCTION generate_slug(title TEXT) RETURNS TEXT AS $$
  SELECT regexp_replace(
    lower(
      regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g')
    ), 
    '\s+', '-', 'g'
  ) || '-' || substr(md5(random()::text), 1, 6);
$$ LANGUAGE sql;
```

#### update_project_stats()
Trigger function to maintain vote counts

```sql
CREATE FUNCTION update_project_stats() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE projects SET votes = votes + 1 WHERE id = NEW.project_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE projects SET votes = votes - 1 WHERE id = OLD.project_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

---

## Progress & Status

### ✅ Completed Features

1. ✅ Polymorphic project/idea table design
2. ✅ Submission modal with dual modes
3. ✅ Rich markdown editor
4. ✅ Image upload and cropping
5. ✅ Category and stage management
6. ✅ Tag system
7. ✅ Voting mechanism
8. ✅ Anonymous submissions
9. ✅ Project detail pages
10. ✅ Edit functionality
11. ✅ Delete functionality (with confirmation)
12. ✅ Search and filtering
13. ✅ Pagination
14. ✅ Slug-based URLs
15. ✅ Verified badge system
16. ✅ AI scoring integration
17. ✅ Cover image support
18. ✅ Import idea to project

### 🚧 In Progress

1. 🚧 Advanced search with full-text
2. 🚧 Project analytics dashboard
3. 🚧 Version history tracking
4. 🚧 Collaborative editing

### 📋 Planned Features

1. 📋 Project milestones and roadmap
2. 📋 Multi-image gallery support
3. 📋 Video embed support
4. 📋 Project collections/portfolios
5. 📋 Duplicate project detection
6. 📋 Project templates
7. 📋 Export to PDF/Pitch deck
8. 📋 Integration with GitHub repos
9. 📋 Automated testing integration
10. 📋 Project dependencies graph

---

## Security Considerations

### Authentication & Authorization

1. **Wallet Verification**: All create/edit/delete operations require valid JWT from wallet signature
2. **Author Permissions**: Only project authors can edit/delete their projects
3. **Admin Override**: Admins can moderate any content
4. **Rate Limiting**: Prevent spam submissions (max 5 projects/hour per user)

### Data Validation

1. **Input Sanitization**: All text fields sanitized to prevent XSS
2. **Markdown Safety**: User-provided markdown is sanitized (no script tags)
3. **Image Validation**: File type, size, dimensions checked
4. **URL Validation**: External links validated
5. **SQL Injection Prevention**: Parameterized queries via Prisma

### Privacy

1. **Anonymous Mode**: Author identity hidden in UI and API responses
2. **RLS Policies**: Row-level security ensures users can only edit their own content
3. **Soft Deletes**: Projects marked as deleted, not immediately removed

---

## Performance Optimizations

### Database

1. **Strategic Indexes**: Indexes on frequently queried columns
2. **Partial Indexes**: Index on `is_anonymous=false` for public listings
3. **Materialized View**: Cached aggregations for trending algorithms
4. **Connection Pooling**: Efficient database connection management

### API

1. **Pagination**: Default limit of 20, max 100 per request
2. **Field Selection**: GraphQL-style field selection to reduce payload
3. **Caching**: Redis cache for popular projects (TTL: 5 minutes)
4. **CDN**: Static images served via CDN

### Frontend

1. **Lazy Loading**: Images and components loaded on demand
2. **Virtual Scrolling**: For long project lists
3. **Debounced Search**: Reduce API calls during typing
4. **Optimistic Updates**: Immediate UI feedback for votes
5. **Code Splitting**: Route-based code splitting with Next.js

---

## Testing Strategy

### Unit Tests
- Service layer methods
- Utility functions (slug generation, validation)
- Business logic (voting, permissions)

### Integration Tests
- API endpoint testing
- Database transactions
- File upload workflows

### E2E Tests
- Complete submission flow
- Edit and delete workflows
- Voting and engagement
- Anonymous submission handling

---

## Migration Notes

### Version 1.0 → 2.0
- Added `cover_image_url` field
- Added `verified` boolean flag
- Added `ai_score` field
- Added unique `slug` field

### Version 2.0 → 3.0 (Planned)
- Add `version_history` JSONB field
- Add `collaborators` many-to-many table
- Add `project_milestones` related table

---

## Monitoring & Analytics

### Metrics Tracked

1. **Submission Metrics**:
   - Projects created per day/week/month
   - Ideas created per day/week/month
   - Category distribution
   - Stage distribution

2. **Engagement Metrics**:
   - Total votes
   - Average votes per project
   - Comment count
   - View count (if implemented)

3. **Performance Metrics**:
   - API response times
   - Image upload success rate
   - Database query performance

### Alerts

- Spike in failed submissions
- Unusual voting patterns (potential bot activity)
- Slow query performance (>2 seconds)

---

## Future Enhancements

### Short Term (Next 3 Months)

1. **Rich Media Support**: Video embeds, multi-image galleries
2. **Project Updates**: Allow authors to post updates/progress
3. **Save Drafts**: Auto-save and draft management
4. **Project Forks**: Fork and iterate on existing ideas

### Long Term (6+ Months)

1. **Decentralized Storage**: IPFS integration for permanent storage
2. **NFT Integration**: Mint projects as NFTs
3. **DAO Governance**: Community voting on featured projects
4. **On-chain Verification**: Store project hashes on Solana
5. **Cross-chain Support**: Multi-blockchain project tracking

---

## Documentation References

- [API Documentation](./api/projects.md)
- [Database Schema](./database/schema.md)
- [Component Library](./components/README.md)
- [Testing Guide](./testing/projects.md)
