# Hackathon Feature: Backend Integration Status

## Overview
The Hackathon module currently operates on **Mock Data** (`HACKATHONS_MOCK_DATA` and local constants `MOCK_TEAMS`, `MOCK_TEAMMATES`). The UI logic for Tabs, Timeline, and Team Formation is fully implemented but isolated from the database.

## Current "Team Formation" Logic
The "Find your Squad" section allows users to:
1.  **Toggle Mode:** Switch between finding existing **Teams** and finding individual **Teammates**.
2.  **Search:** Filter results by name, tags, or skills using a local search bar.
3.  **View Cards:** Display team details (members, roles needed) or user profiles (skills, bio).

## Required Backend Integration

To make this functional with real users who have **registered** for the hackathon:

### 1. Database Schema Extensions
We need tables to track hackathon participation and team structures.
*   **`HackathonParticipants`**: Links `UserId` to `HackathonId`.
    *   *Constraint:* Only users in this table should appear in "Find Teammates".
*   **`Teams`**: Groups participants.
    *   Columns: `id`, `name`, `hackathon_id`, `leader_id`, `tags`, `looking_for_roles`, `is_open`.
*   **`TeamMembers`**: Links `UserId` to `TeamId`.

### 2. API Endpoints Needed

#### A. Registration
*   `POST /api/hackathons/:id/register`
    *   **Action:** Adds user to `HackathonParticipants`.
    *   **Logic:** Check if already registered.

#### B. Team Discovery (The "Find Teams" Tab)
*   `GET /api/hackathons/:id/teams`
    *   **Query Params:** `search` (name/tags), `limit`, `offset`.
    *   **Response:** List of teams with `member_count` and `looking_for` arrays.

#### C. Teammate Discovery (The "Find Teammates" Tab)
*   `GET /api/hackathons/:id/participants`
    *   **Query Params:** `search` (name/skills), `filter_looking_for_team=true`.
    *   **Logic:** **CRITICAL** - Only return users who are:
        1.  Registered for *this* specific hackathon.
        2.  NOT already in a full team (or explicitly marked as "Looking for team").

#### D. Actions
*   `POST /api/teams` (Create Team)
*   `POST /api/teams/:id/join_request` (Request to join)
*   `POST /api/teams/requests/:id/accept` (Leader accepts member)

## Next Steps
1.  Create the backend module `Hackathon` (NestJS).
2.  Implement the Schema in Prisma/Postgres.
3.  Replace `MOCK_TEAMS` map in `page.tsx` with `useQuery` or `useEffect` fetch calls to the new endpoints.
