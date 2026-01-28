# Admin System & Platform Management

## Overview

Comprehensive administrative dashboard and moderation tools for managing the Gimme Idea platform, including user management, content moderation, hackathon administration, analytics, and system monitoring.

---

## Architecture

```
┌──────────────────────────────────────────┐
│         Admin Dashboard UI               │
│  (Protected Route - Admin Only)          │
└─────────────────┬────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────┐
│       Admin API Endpoints                │
│    (AuthGuard + AdminGuard)              │
└─────────────────┬────────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌──────────────┐  ┌──────────────────┐
│  Admin       │  │  Activity        │
│  Service     │  │  Logger          │
└──────────────┘  └──────────────────┘
```

---

## Database Schema

### Admin Tables

#### admin_roles

```sql
CREATE TABLE admin_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL, -- 'super_admin', 'moderator', 'support'
  permissions JSONB NOT NULL, -- { "can_delete_users": true, ... }
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed default roles
INSERT INTO admin_roles (name, permissions) VALUES
('super_admin', '{"can_delete_users": true, "can_manage_admins": true, "can_manage_hackathons": true, "can_delete_projects": true, "can_verify_projects": true, "can_ban_users": true, "can_view_analytics": true}'::jsonb),
('moderator', '{"can_delete_projects": true, "can_verify_projects": true, "can_ban_users": false, "can_view_analytics": true}'::jsonb),
('support', '{"can_view_analytics": true, "can_verify_projects": false}'::jsonb);
```

#### admin_users

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES admin_roles(id),
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admin_users_user ON admin_users(user_id);
```

#### admin_activity_log

```sql
CREATE TABLE admin_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL, -- 'delete_project', 'ban_user', 'create_hackathon'
  target_type VARCHAR(50), -- 'user', 'project', 'hackathon'
  target_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admin_activity_admin ON admin_activity_log(admin_id);
CREATE INDEX idx_admin_activity_created ON admin_activity_log(created_at DESC);
CREATE INDEX idx_admin_activity_action ON admin_activity_log(action);
```

#### system_settings

```sql
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Example settings
INSERT INTO system_settings (key, value, description) VALUES
('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
('max_file_size_mb', '10', 'Maximum file upload size in MB'),
('rate_limit_per_minute', '60', 'API rate limit per user'),
('ai_credits_per_signup', '100', 'AI credits given to new users');
```

---

## Admin Features

### 1. User Management

#### Ban/Unban Users

```typescript
// backend/src/admin/admin.service.ts
async banUser(
  adminId: string,
  targetUserId: string,
  reason?: string
): Promise<ApiResponse<void>> {
  // Verify admin permissions
  await this.verifyAdminPermission(adminId, 'can_ban_users');
  
  // Ban user
  await this.usersService.update(targetUserId, {
    is_banned: true,
    ban_reason: reason
  });
  
  // Log action
  await this.logActivity(adminId, {
    action: 'ban_user',
    target_type: 'user',
    target_id: targetUserId,
    details: { reason }
  });
  
  // Notify user
  await this.notificationsService.create({
    user_id: targetUserId,
    type: 'account_action',
    title: 'Account Suspended',
    message: reason || 'Your account has been suspended.'
  });
  
  return { success: true };
}

async unbanUser(
  adminId: string,
  targetUserId: string
): Promise<ApiResponse<void>> {
  await this.verifyAdminPermission(adminId, 'can_ban_users');
  
  await this.usersService.update(targetUserId, {
    is_banned: false,
    ban_reason: null
  });
  
  await this.logActivity(adminId, {
    action: 'unban_user',
    target_type: 'user',
    target_id: targetUserId
  });
  
  return { success: true };
}
```

#### Manage Admin Roles

```typescript
async setUserAdmin(
  adminId: string,
  targetUserId: string,
  isAdmin: boolean,
  roleId?: string
): Promise<ApiResponse<void>> {
  // Only super_admin can manage admins
  await this.verifyAdminPermission(adminId, 'can_manage_admins');
  
  if (isAdmin) {
    // Grant admin role
    await this.db.admin_users.create({
      data: {
        user_id: targetUserId,
        role_id: roleId || DEFAULT_MODERATOR_ROLE_ID,
        granted_by: adminId
      }
    });
    
    // Update users table
    await this.usersService.update(targetUserId, {
      is_admin: true
    });
  } else {
    // Revoke admin role
    await this.db.admin_users.delete({
      where: { user_id: targetUserId }
    });
    
    await this.usersService.update(targetUserId, {
      is_admin: false
    });
  }
  
  await this.logActivity(adminId, {
    action: isAdmin ? 'grant_admin' : 'revoke_admin',
    target_type: 'user',
    target_id: targetUserId
  });
  
  return { success: true };
}
```

#### Get All Users

```typescript
async getAllUsers(
  adminId: string,
  filters?: UserFilters
): Promise<ApiResponse<PaginatedUsers>> {
  await this.verifyAdmin(adminId);
  
  const { page = 1, limit = 50, search, sortBy = 'created_at' } = filters;
  
  const users = await this.db.users.findMany({
    where: search ? {
      OR: [
        { username: { contains: search, mode: 'insensitive' }},
        { email: { contains: search, mode: 'insensitive' }},
        { wallet: { contains: search }}
      ]
    } : undefined,
    orderBy: { [sortBy]: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true,
      username: true,
      email: true,
      wallet: true,
      reputation_score: true,
      is_verified: true,
      is_admin: true,
      is_banned: true,
      created_at: true,
      last_login_at: true
    }
  });
  
  const total = await this.db.users.count();
  
  return {
    success: true,
    data: {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  };
}
```

### 2. Content Moderation

#### Delete Projects/Ideas

```typescript
async adminDeleteProject(
  adminId: string,
  projectId: string
): Promise<ApiResponse<void>> {
  await this.verifyAdminPermission(adminId, 'can_delete_projects');
  
  // Get project details for logging
  const project = await this.projectsService.findOne(projectId);
  
  // Delete project
  await this.projectsService.delete(projectId);
  
  // Log action
  await this.logActivity(adminId, {
    action: 'delete_project',
    target_type: 'project',
    target_id: projectId,
    details: {
      title: project.title,
      author_id: project.author_id
    }
  });
  
  // Notify author
  await this.notificationsService.create({
    user_id: project.author_id,
    type: 'content_moderation',
    title: 'Project Removed',
    message: `Your project "${project.title}" was removed by moderation.`
  });
  
  return { success: true };
}
```

#### Verify Projects

```typescript
async verifyProject(
  adminId: string,
  projectId: string,
  verified: boolean = true
): Promise<ApiResponse<void>> {
  await this.verifyAdminPermission(adminId, 'can_verify_projects');
  
  await this.projectsService.update(projectId, {
    verified
  });
  
  await this.logActivity(adminId, {
    action: verified ? 'verify_project' : 'unverify_project',
    target_type: 'project',
    target_id: projectId
  });
  
  const project = await this.projectsService.findOne(projectId);
  
  if (verified) {
    await this.notificationsService.create({
      user_id: project.author_id,
      type: 'project_verified',
      title: 'Project Verified! ✓',
      message: `Your project "${project.title}" has been verified.`
    });
  }
  
  return { success: true };
}
```

### 3. Hackathon Administration

**Location**: `backend/src/admin/admin.service.ts`

Key methods already documented in [Hackathon Management](./03-hackathon-management.md)

### 4. System Analytics

```typescript
async getSystemStats(adminId: string): Promise<ApiResponse<SystemStats>> {
  await this.verifyAdmin(adminId);
  
  const stats = await Promise.all([
    // User stats
    this.db.users.count(),
    this.db.users.count({ where: { created_at: { gte: last7Days }}}),
    this.db.users.count({ where: { is_banned: true }}),
    
    // Content stats
    this.db.projects.count(),
    this.db.projects.count({ where: { type: 'project' }}),
    this.db.projects.count({ where: { type: 'idea' }}),
    this.db.comments.count(),
    
    // Engagement stats
    this.db.project_votes.count(),
    this.db.follows.count(),
    
    // Financial stats
    this.db.transactions.aggregate({
      _sum: { amount: true },
      where: { status: 'confirmed' }
    }),
    
    // Hackathon stats
    this.db.hackathons.count(),
    this.db.hackathon_submissions.count()
  ]);
  
  return {
    success: true,
    data: {
      users: {
        total: stats[0],
        newLast7Days: stats[1],
        banned: stats[2]
      },
      content: {
        totalProjects: stats[3],
        projects: stats[4],
        ideas: stats[5],
        comments: stats[6]
      },
      engagement: {
        votes: stats[7],
        follows: stats[8]
      },
      financial: {
        totalVolume: stats[9]._sum.amount || 0
      },
      hackathons: {
        total: stats[10],
        submissions: stats[11]
      }
    }
  };
}
```

### 5. Announcements System

```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info' CHECK (
    type IN ('info', 'warning', 'success', 'error', 'maintenance')
  ),
  
  -- Targeting
  target_audience VARCHAR(50) DEFAULT 'all' CHECK (
    target_audience IN ('all', 'admins', 'verified_users', 'new_users')
  ),
  
  -- Display
  is_banner BOOLEAN DEFAULT FALSE,
  is_dismissible BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0,
  
  -- Scheduling
  starts_at TIMESTAMP,
  ends_at TIMESTAMP,
  
  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

```typescript
async createAnnouncement(
  adminId: string,
  dto: CreateAnnouncementDto
): Promise<Announcement> {
  await this.verifyAdmin(adminId);
  
  const announcement = await this.db.announcements.create({
    data: {
      ...dto,
      created_by: adminId
    }
  });
  
  // If banner, trigger realtime update to all users
  if (announcement.is_banner) {
    await this.pushBannerToClients(announcement);
  }
  
  await this.logActivity(adminId, {
    action: 'create_announcement',
    details: { title: dto.title }
  });
  
  return announcement;
}
```

---

## Admin Dashboard UI

### Protected Route

```typescript
// frontend/app/admin-gmi-zah-thodium-24c1b-ctrl/page.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && (!user || !user.is_admin)) {
      router.push('/');
    }
  }, [user, isLoading]);
  
  if (!user?.is_admin) {
    return <div>Access Denied</div>;
  }
  
  return <AdminDashboardContent />;
}
```

### Dashboard Sections

#### 1. Overview Cards

```typescript
const DashboardOverview = () => {
  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard
        title="Total Users"
        value={stats.users.total}
        change={`+${stats.users.newLast7Days} this week`}
        icon={<Users />}
      />
      <StatCard
        title="Total Projects"
        value={stats.content.totalProjects}
        change={`${stats.content.ideas} ideas`}
        icon={<Lightbulb />}
      />
      <StatCard
        title="Total Volume"
        value={`${stats.financial.totalVolume} SOL`}
        icon={<DollarSign />}
      />
      <StatCard
        title="Active Hackathons"
        value={stats.hackathons.active}
        icon={<Trophy />}
      />
    </div>
  );
};
```

#### 2. User Management Table

```typescript
const UserManagementTable = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  
  return (
    <div className="admin-table">
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Reputation</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.reputation_score}</td>
              <td>
                {user.is_banned ? (
                  <Badge color="red">Banned</Badge>
                ) : user.is_verified ? (
                  <Badge color="green">Verified</Badge>
                ) : (
                  <Badge>Active</Badge>
                )}
              </td>
              <td>{formatDate(user.created_at)}</td>
              <td>
                <ActionMenu user={user} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

#### 3. Activity Log

```typescript
const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  
  return (
    <div className="activity-log">
      <h3>Recent Admin Activity</h3>
      <ul>
        {activities.map(activity => (
          <li key={activity.id}>
            <div className="activity-item">
              <strong>{activity.admin.username}</strong>
              <span className="action">{formatAction(activity.action)}</span>
              <span className="target">{activity.target_type} {activity.target_id}</span>
              <span className="time">{formatTimeAgo(activity.created_at)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

#### 4. System Settings

```typescript
const SystemSettings = () => {
  const [settings, setSettings] = useState({});
  
  const handleUpdateSetting = async (key: string, value: any) => {
    await api.put('/api/admin/settings', { key, value });
    toast.success('Setting updated');
  };
  
  return (
    <div className="system-settings">
      <SettingToggle
        label="Maintenance Mode"
        value={settings.maintenance_mode}
        onChange={(v) => handleUpdateSetting('maintenance_mode', v)}
      />
      <SettingInput
        label="Max File Size (MB)"
        type="number"
        value={settings.max_file_size_mb}
        onChange={(v) => handleUpdateSetting('max_file_size_mb', v)}
      />
      <SettingInput
        label="AI Credits per Signup"
        type="number"
        value={settings.ai_credits_per_signup}
        onChange={(v) => handleUpdateSetting('ai_credits_per_signup', v)}
      />
    </div>
  );
};
```

---

## Security & Permissions

### Admin Guard

```typescript
// backend/src/common/guards/admin.guard.ts
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private adminService: AdminService) {}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.userId;
    
    const isAdmin = await this.adminService.isAdmin(userId);
    
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    
    return true;
  }
}

// Usage
@UseGuards(AuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  // ...
}
```

### Permission Checking

```typescript
async verifyAdminPermission(
  adminId: string,
  permission: string
): Promise<void> {
  const adminUser = await this.db.admin_users.findUnique({
    where: { user_id: adminId },
    include: { role: true }
  });
  
  if (!adminUser) {
    throw new ForbiddenException('Not an admin');
  }
  
  const hasPermission = adminUser.role.permissions[permission] === true;
  
  if (!hasPermission) {
    throw new ForbiddenException(`Missing permission: ${permission}`);
  }
}
```

---

## Progress & Status

### ✅ Completed

1. ✅ Admin role system
2. ✅ User management (ban/unban)
3. ✅ Admin role assignment
4. ✅ Content moderation (delete projects)
5. ✅ Project verification
6. ✅ Hackathon creation/management
7. ✅ System statistics
8. ✅ Activity logging
9. ✅ Admin dashboard UI
10. ✅ Permission-based access

### 🚧 In Progress

1. 🚧 Advanced analytics dashboard
2. 🚧 Automated moderation (AI)
3. 🚧 Bulk actions
4. 🚧 Report management system

### 📋 Planned

1. 📋 Admin chat/support system
2. 📋 Scheduled tasks management
3. 📋 Email campaign tools
4. 📋 A/B testing framework
5. 📋 Feature flags system
6. 📋 Database backup management
7. 📋 CDN cache purging
8. 📋 API rate limit management
9. 📋 Webhook management
10. 📋 Audit trail exports

---

## Monitoring & Alerts

### System Health Checks

```typescript
async performHealthCheck(): Promise<HealthCheckResult> {
  return {
    database: await this.checkDatabase(),
    storage: await this.checkStorage(),
    solana_rpc: await this.checkSolanaRPC(),
    openai_api: await this.checkOpenAI(),
    redis: await this.checkRedis()
  };
}
```

### Alerts Configuration

```typescript
const ALERT_THRESHOLDS = {
  error_rate: 0.05, // 5% error rate
  response_time_ms: 2000,
  disk_usage_percent: 80,
  memory_usage_percent: 85,
  failed_transactions_per_hour: 10
};
```

---

## Documentation

- [Admin API Reference](./api/admin.md)
- [Permission System Guide](./guides/permissions.md)
- [Moderation Guidelines](./guides/moderation.md)
