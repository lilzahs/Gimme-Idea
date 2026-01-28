# AI Related Projects Detection Feature

This feature automatically detects and displays related projects from the internet when viewing an idea. Users can also pin their own projects to ideas.

## Overview

When a user views an idea, they can click the "Related" button to see:
1. **AI-Detected Projects**: Projects found on the internet using Tavily API
2. **Community Pinned Projects**: Projects pinned by other users

## Features

### 1. AI Project Detection (Tavily API)
- Searches the internet for related projects during idea viewing
- Uses Tavily API in basic mode with max 8 results
- Extracts relevant information: title, URL, snippet, source domain
- Calculates relevance scores for ranking

### 2. User Project Pinning
- Users can pin their own projects to any idea
- One project per user per idea limit
- Includes title, URL, and optional description

### 3. Daily Search Quota
- 5 idea searches per user per day
- Quota resets at midnight
- Prevents API abuse

## Setup

### 1. Environment Variables

Add to your backend `.env` file:

```env
# Tavily API Configuration
# Get your API key at: https://tavily.com
TAVILY_API_KEY=your_tavily_api_key
```

### 2. Database Migration

Run the migration in Supabase SQL Editor:

```bash
# The migration file is located at:
# backend/database/migration_add_related_projects.sql
```

This creates:
- `related_projects` table - Stores AI-detected results
- `idea_search_quota` table - Tracks daily search limits
- `user_pinned_projects` table - Stores user-pinned projects
- Helper functions: `can_user_search_projects`, `increment_search_usage`, `get_related_projects`

## API Endpoints

### Search Related Projects
```
POST /api/ai/search-related-projects
Body: { ideaId, title, problem, solution }
Auth: Required
```

### Get Related Projects
```
GET /api/ai/related-projects/:ideaId
Auth: Not required
```

### Pin User Project
```
POST /api/ai/pin-project
Body: { ideaId, projectTitle, projectUrl, projectDescription? }
Auth: Required
```

### Unpin User Project
```
POST /api/ai/unpin-project
Body: { ideaId }
Auth: Required
```

### Get Search Quota
```
GET /api/ai/search-quota
Auth: Required
```

## Frontend Components

### RelatedProjectsModal
Located at: `frontend/components/RelatedProjectsModal.tsx`

A modal component that displays:
- AI-detected related projects with relevance scores
- Community-pinned projects
- Form to pin your own project

### IdeaDetail Integration
The "Related" button is added to the idea action bar, next to Like, Share, and Save buttons.

## Usage Flow

1. User views an idea detail page
2. Clicks the "Related" button
3. Modal opens showing related projects
4. AI-detected results are displayed with match scores
5. User can view external project links
6. User can pin their own related project

## Rate Limiting

- **5 searches per user per day**: Prevents API abuse
- Quota displays in modal when limit is reached
- Resets at midnight UTC

## Technical Details

### Tavily API Configuration
- Mode: Basic (fastest, lowest cost)
- Max results: 8
- Query: Combines idea title and problem for relevance

### Database Schema

```sql
-- AI-detected projects
related_projects (
  id, idea_id, title, url, snippet, source, score,
  is_pinned, pinned_by, pinned_at, search_query, created_at
)

-- User quota tracking
idea_search_quota (
  id, user_id, search_date, searches_used, max_searches,
  created_at, updated_at
)

-- User-pinned projects
user_pinned_projects (
  id, idea_id, pinned_by, project_title, project_url,
  project_description, created_at
)
```

## Cost Considerations

- Tavily API basic mode: ~$0.01 per search
- 5 searches/user/day limit controls costs
- Caching results prevents repeat API calls
