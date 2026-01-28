# Hackathon Management System

## Overview

A comprehensive platform for organizing, managing, and participating in Solana hackathons. Supports multi-round competitions, team formation, submission tracking, and automated scoring.

---

## Architecture

### System Components

```
┌──────────────────────────────────────────────┐
│           Hackathon Platform                  │
├──────────────────────────────────────────────┤
│  Organizer        │  Participant              │
│  Dashboard        │  Interface                │
├──────────────────────────────────────────────┤
│  - Create Event   │  - Browse Hackathons      │
│  - Manage Rounds  │  - Form Teams             │
│  - Score Projects │  - Submit Projects        │
│  - Announce       │  - Track Status           │
│    Winners        │                          │
└──────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
┌──────────────────────────────────────────────┐
│         Backend Services                      │
├──────────────────────────────────────────────┤
│  Hackathons  │  Teams  │  Submissions         │
│  Service     │ Service │  Service             │
└──────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│            Database (PostgreSQL)              │
├──────────────────────────────────────────────┤
│  hackathons │ teams │ submissions │ scores   │
└──────────────────────────────────────────────┘
```

---

## Database Schema

### Core Tables

#### 1. hackathons Table

```sql
CREATE TABLE hackathons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  cover_image TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'upcoming' CHECK (
    status IN ('upcoming', 'registration', 'active', 'judging', 'completed', 'cancelled')
  ),
  
  -- Dates
  registration_start TIMESTAMP WITH TIME ZONE,
  registration_end TIMESTAMP WITH TIME ZONE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Details
  theme TEXT,
  rules TEXT,
  requirements TEXT,
  prizes_info JSONB, -- { "1st": "5000 USDC", "2nd": "3000 USDC", ... }
  
  -- Participation
  max_team_size INTEGER DEFAULT 5,
  min_team_size INTEGER DEFAULT 1,
  max_participants INTEGER,
  
  -- Metadata
  organizer_id UUID REFERENCES users(id),
  tags TEXT[],
  website TEXT,
  discord TEXT,
  twitter TEXT,
  
  -- Stats
  total_submissions INTEGER DEFAULT 0,
  total_teams INTEGER DEFAULT 0,
  total_participants INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_hackathons_status ON hackathons(status);
CREATE INDEX idx_hackathons_dates ON hackathons(start_date, end_date);
CREATE INDEX idx_hackathons_organizer ON hackathons(organizer_id);
```

#### 2. hackathon_rounds Table

```sql
CREATE TABLE hackathon_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  name VARCHAR(100) NOT NULL, -- "Qualifier", "Semi-finals", "Finals"
  description TEXT,
  
  -- Dates
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  
  -- Judging
  judging_criteria JSONB, -- [{ "name": "Innovation", "weight": 30 }, ...]
  max_score INTEGER DEFAULT 100,
  
  -- Advancement
  advancement_count INTEGER, -- Top N teams advance
  
  status VARCHAR(50) DEFAULT 'upcoming' CHECK (
    status IN ('upcoming', 'active', 'judging', 'completed')
  ),
  
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(hackathon_id, round_number)
);

CREATE INDEX idx_rounds_hackathon ON hackathon_rounds(hackathon_id);
```

#### 3. teams Table

```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  avatar TEXT,
  
  -- Leadership
  leader_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'forming' CHECK (
    status IN ('forming', 'registered', 'active', 'eliminated', 'withdrawn')
  ),
  
  -- Stats
  member_count INTEGER DEFAULT 1,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_teams_hackathon ON teams(hackathon_id);
CREATE INDEX idx_teams_leader ON teams(leader_id);
```

#### 4. team_members Table

```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- 'leader', 'member'
  
  -- Invitation
  status VARCHAR(50) DEFAULT 'pending' CHECK (
    status IN ('pending', 'accepted', 'declined', 'removed')
  ),
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP,
  
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
```

#### 5. hackathon_submissions Table

```sql
CREATE TABLE hackathon_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  round_id UUID REFERENCES hackathon_rounds(id),
  
  -- Project Info
  project_title VARCHAR(255) NOT NULL,
  project_description TEXT NOT NULL,
  tagline VARCHAR(255),
  category VARCHAR(100),
  
  -- Links
  demo_url TEXT,
  repository_url TEXT,
  video_url TEXT,
  presentation_url TEXT,
  
  -- Technical
  tech_stack TEXT[],
  solana_features TEXT[], -- ["SPL Tokens", "Anchor", "Metaplex", ...]
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (
    status IN ('pending', 'approved', 'rejected', 'winner', 'finalist')
  ),
  
  -- Scoring
  total_score NUMERIC(5, 2) DEFAULT 0,
  scores JSONB, -- { "innovation": 85, "technical": 90, ... }
  feedback TEXT,
  
  -- Ranking
  rank INTEGER,
  is_winner BOOLEAN DEFAULT FALSE,
  prize_amount NUMERIC(18, 9),
  
  submitted_at TIMESTAMP DEFAULT NOW(),
  judged_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_submissions_hackathon ON hackathon_submissions(hackathon_id);
CREATE INDEX idx_submissions_team ON hackathon_submissions(team_id);
CREATE INDEX idx_submissions_status ON hackathon_submissions(status);
CREATE INDEX idx_submissions_score ON hackathon_submissions(total_score DESC);
```

#### 6. submission_scores Table

```sql
CREATE TABLE submission_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES hackathon_submissions(id) ON DELETE CASCADE,
  judge_id UUID REFERENCES users(id),
  
  -- Scores by criteria
  criteria_scores JSONB NOT NULL, -- { "innovation": 85, "technical": 90, ... }
  total_score NUMERIC(5, 2) NOT NULL,
  
  -- Feedback
  comments TEXT,
  
  scored_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(submission_id, judge_id)
);

CREATE INDEX idx_scores_submission ON submission_scores(submission_id);
```

---

## Backend Implementation

### Hackathons Service

**Location**: `backend/src/hackathons/hackathons.service.ts` (53KB)

#### Key Methods

```typescript
class HackathonsService {
  // === HACKATHON MANAGEMENT ===
  
  async create(userId: string, dto: CreateHackathonDto): Promise<Hackathon> {
    // Verify user is admin
    const isAdmin = await this.adminService.isAdmin(userId);
    if (!isAdmin) throw new UnauthorizedException();
    
    // Create hackathon with default rounds
    const hackathon = await this.db.hackathons.create({
      data: {
        ...dto,
        organizer_id: userId,
        status: 'upcoming'
      }
    });
    
    // Create default rounds if specified
    if (dto.rounds) {
      await this.createRounds(hackathon.id, dto.rounds);
    }
    
    return hackathon;
  }
  
  async update(
    userId: string, 
    hackathonId: string, 
    updates: Partial<CreateHackathonDto>
  ): Promise<Hackathon> {
    // Check permission
    await this.verifyOrganizerOrAdmin(userId, hackathonId);
    
    return this.db.hackathons.update({
      where: { id: hackathonId },
      data: updates
    });
  }
  
  async delete(userId: string, hackathonId: string): Promise<void> {
    await this.verifyOrganizerOrAdmin(userId, hackathonId);
    await this.db.hackathons.delete({ where: { id: hackathonId }});
  }
  
  // === TEAM MANAGEMENT ===
  
  async createTeam(
    userId: string,
    hackathonId: string,
    dto: CreateTeamDto
  ): Promise<Team> {
    // Verify hackathon is accepting registrations
    const hackathon = await this.getHackathon(hackathonId);
    if (hackathon.status !== 'registration') {
      throw new BadRequestException('Registration not open');
    }
    
    // Check if user already in a team for this hackathon
    const existingTeam = await this.getUserTeam(userId, hackathonId);
    if (existingTeam) {
      throw new BadRequestException('Already in a team');
    }
    
    // Create team
    const team = await this.db.teams.create({
      data: {
        ...dto,
        hackathon_id: hackathonId,
        leader_id: userId,
        status: 'forming'
      }
    });
    
    // Add leader as first member
    await this.db.team_members.create({
      data: {
        team_id: team.id,
        user_id: userId,
        role: 'leader',
        status: 'accepted'
      }
    });
    
    return team;
  }
  
  async inviteToTeam(
    userId: string,
    teamId: string,
    inviteeId: string
  ): Promise<TeamInvite> {
    // Verify user is team leader
    const team = await this.getTeam(teamId);
    if (team.leader_id !== userId) {
      throw new UnauthorizedException('Only team leader can invite');
    }
    
    // Check team size limit
    const hackathon = await this.getHackathon(team.hackathon_id);
    if (team.member_count >= hackathon.max_team_size) {
      throw new BadRequestException('Team is full');
    }
    
    // Create invitation
    const invite = await this.db.team_members.create({
      data: {
        team_id: teamId,
        user_id: inviteeId,
        role: 'member',
        status: 'pending',
        invited_by: userId
      }
    });
    
    // Send notification
    await this.notificationsService.create({
      user_id: inviteeId,
      type: 'team_invite',
      message: `You've been invited to join ${team.name}`
    });
    
    return invite;
  }
  
  async respondToInvite(
    userId: string,
    inviteId: string,
    accept: boolean
  ): Promise<void> {
    const invite = await this.db.team_members.findUnique({
      where: { id: inviteId }
    });
    
    if (invite.user_id !== userId) {
      throw new UnauthorizedException();
    }
    
    if (accept) {
      await this.db.team_members.update({
        where: { id: inviteId },
        data: { 
          status: 'accepted',
          responded_at: new Date()
        }
      });
      
      // Update team member count
      await this.db.teams.update({
        where: { id: invite.team_id },
        data: { member_count: { increment: 1 } }
      });
    } else {
      await this.db.team_members.update({
        where: { id: inviteId },
        data: { 
          status: 'declined',
          responded_at: new Date()
        }
      });
    }
  }
  
  // === SUBMISSION MANAGEMENT ===
  
  async submitProject(
    userId: string,
    teamId: string,
    dto: SubmitProjectDto
  ): Promise<Submission> {
    // Verify user is team member
    const isMember = await this.isTeamMember(userId, teamId);
    if (!isMember) {
      throw new UnauthorizedException('Not a team member');
    }
    
    const team = await this.getTeam(teamId);
    const hackathon = await this.getHackathon(team.hackathon_id);
    
    // Check if within submission period
    if (!this.isSubmissionOpen(hackathon)) {
      throw new BadRequestException('Submissions not open');
    }
    
    // Check for existing submission
    const existing = await this.getTeamSubmission(teamId, hackathon.id);
    if (existing) {
      // Update existing
      return this.updateSubmission(userId, existing.id, dto);
    }
    
    // Create new submission
    const submission = await this.db.hackathon_submissions.create({
      data: {
        ...dto,
        hackathon_id: hackathon.id,
        team_id: teamId,
        status: 'pending'
      }
    });
    
    // Update hackathon stats
    await this.db.hackathons.update({
      where: { id: hackathon.id },
      data: { total_submissions: { increment: 1 } }
    });
    
    return submission;
  }
  
  async scoreSubmission(
    judgeId: string,
    submissionId: string,
    scores: ScoreDto
  ): Promise<SubmissionScore> {
    // Verify judge is admin
    const isAdmin = await this.adminService.isAdmin(judgeId);
    if (!isAdmin) throw new UnauthorizedException();
    
    // Calculate total score
    const totalScore = this.calculateTotalScore(scores);
    
    // Save score
    const score = await this.db.submission_scores.create({
      data: {
        submission_id: submissionId,
        judge_id: judgeId,
        criteria_scores: scores.criteriaScores,
        total_score: totalScore,
        comments: scores.comments
      }
    });
    
    // Update submission total score (average of all judges)
    await this.updateSubmissionAverageScore(submissionId);
    
    return score;
  }
  
  async announceWinners(
    userId: string,
    hackathonId: string,
    winners: WinnerDto[]
  ): Promise<void> {
    await this.verifyOrganizerOrAdmin(userId, hackathonId);
    
    for (const winner of winners) {
      await this.db.hackathon_submissions.update({
        where: { id: winner.submissionId },
        data: {
          status: winner.rank === 1 ? 'winner' : 'finalist',
          rank: winner.rank,
          is_winner: winner.rank <= 3,
          prize_amount: winner.prizeAmount
        }
      });
      
      // Notify team members
      await this.notifyTeamWin(winner.submissionId, winner.rank);
    }
    
    // Update hackathon status
    await this.db.hackathons.update({
      where: { id: hackathonId },
      data: { status: 'completed' }
    });
  }
}
```

### API Endpoints

```typescript
@Controller('hackathons')
export class HackathonsController {
  
  // === PUBLIC ENDPOINTS ===
  
  @Get()
  async listHackathons(
    @Query() filters: HackathonFilters
  ) {
    return this.hackathonsService.findAll(filters);
  }
  
  @Get(':id')
  async getHackathon(@Param('id') id: string) {
    return this.hackathonsService.findOne(id);
  }
  
  @Get(':id/submissions')
  async getSubmissions(
    @Param('id') hackathonId: string,
    @Query('page') page: number,
    @Query('limit') limit: number
  ) {
    return this.hackathonsService.getSubmissions(hackathonId, page, limit);
  }
  
  @Get(':id/leaderboard')
  async getLeaderboard(@Param('id') hackathonId: string) {
    return this.hackathonsService.getLeaderboard(hackathonId);
  }
  
  // === TEAM MANAGEMENT ===
  
  @Post(':id/teams')
  @UseGuards(AuthGuard)
  async createTeam(
    @CurrentUser('userId') userId: string,
    @Param('id') hackathonId: string,
    @Body() dto: CreateTeamDto
  ) {
    return this.hackathonsService.createTeam(userId, hackathonId, dto);
  }
  
  @Post('teams/:teamId/invite')
  @UseGuards(AuthGuard)
  async inviteToTeam(
    @CurrentUser('userId') userId: string,
    @Param('teamId') teamId: string,
    @Body('userId') inviteeId: string
  ) {
    return this.hackathonsService.inviteToTeam(userId, teamId, inviteeId);
  }
  
  @Post('invites/:inviteId/respond')
  @UseGuards(AuthGuard)
  async respondToInvite(
    @CurrentUser('userId') userId: string,
    @Param('inviteId') inviteId: string,
    @Body('accept') accept: boolean
  ) {
    return this.hackathonsService.respondToInvite(userId, inviteId, accept);
  }
  
  // === SUBMISSION MANAGEMENT ===
  
  @Post('teams/:teamId/submit')
  @UseGuards(AuthGuard)
  async submitProject(
    @CurrentUser('userId') userId: string,
    @Param('teamId') teamId: string,
    @Body() dto: SubmitProjectDto
  ) {
    return this.hackathonsService.submitProject(userId, teamId, dto);
  }
  
  @Get('teams/:teamId/submission')
  @UseGuards(AuthGuard)
  async getTeamSubmission(
    @Param('teamId') teamId: string
  ) {
    return this.hackathonsService.getTeamSubmission(teamId);
  }
}
```

---

## Frontend Implementation

### Key Components

#### 1. Hackathon Browse Page
**Location**: `frontend/app/hackathons/page.tsx`

**Features**:
- List all hackathons
- Filter by status (upcoming, active, completed)
- Search by title/description
- Display key info (dates, prizes, participants)
- Registration CTA

#### 2. Hackathon Detail Page
**Location**: `frontend/app/hackathons/[id]/page.tsx`

**Sections**:
- Hero with cover image
- Overview (description, theme, prizes)
- Timeline (dates, rounds, deadlines)
- Rules & Requirements
- Team Formation
- Submissions Gallery
- Leaderboard (during/after event)

#### 3. Team Formation Modal
**Component**: `InviteMemberModal.tsx`

**Features**:
- Create new team
- Invite members by username/wallet
- Display pending invites
- Accept/decline invitations
- View team roster

#### 4. Submission Form
**Features**:
- Project details form
- Link inputs (demo, repo, video)
- Tech stack selection
- Solana features checklist
- Preview before submit
- Edit capability

---

## Progress & Status

### ✅ Completed

1. ✅ Complete database schema
2. ✅ Admin hackathon creation
3. ✅ Multi-round system
4. ✅ Team formation
5. ✅ Team invitations
6. ✅ Submission system
7. ✅ Scoring system
8. ✅ Leaderboard
9. ✅ Frontend pages
10. ✅ Notifications integration

### 🚧 In Progress

1. 🚧 Judging dashboard UI
2. 🚧 Team chat feature
3. 🚧 Automated ranking algorithm
4. 🚧 Prize distribution automation

### 📋 Planned

1. 📋 Live streaming integration
2. 📋 Mentorship matching
3. 📋 Sponsor showcase
4. 📋 Post-hackathon resources
5. 📋 Certificate generation
6. 📋 Alumni network
7. 📋 Recurring hackathons
8. 📋 Custom branding per hackathon

---

## Future Enhancements

- **On-chain Verification**: Store winners on Solana
- **NFT Certificates**: Mint achievement NFTs
- **Token Prizes**: Automated SPL token distribution
- **DAO Voting**: Community judge votes
- **Metaverse Integration**: VR hackathon demos

---

## Documentation

- [API Reference](./api/hackathons.md)
- [Team Management Guide](./guides/teams.md)
- [Scoring Guidelines](./guides/scoring.md)
