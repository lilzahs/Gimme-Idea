# Real-time Notification System

## Overview

A comprehensive, real-time notification system that keeps users informed of all platform activities including follows, comments, votes, donations, and more.

---

## Architecture

### System Design

```
┌─────────────────────────────────────────────┐
│           User Actions                       │
│  (Follow, Comment, Vote, Donate, etc.)       │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│        Database Triggers                     │
│  (PostgreSQL Trigger Functions)              │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│      Notifications Table                     │
│  (Insert new notification record)            │
└──────────────────┬──────────────────────────┘
                   │
                   ├─────────┐
                   ▼         ▼
        ┌──────────────┐  ┌──────────────┐
        │  Supabase    │  │   Backend    │
        │  Realtime    │  │   Polling    │
        └──────┬───────┘  └──────┬───────┘
               │                 │
               └────────┬────────┘
                        ▼
              ┌──────────────────┐
              │   Frontend UI    │
              │  (Notification   │
              │     Bell Icon)   │
              └──────────────────┘
```

---

## Database Schema

### notifications Table

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Recipient
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Actor (who triggered the notification)
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Type
  type TEXT NOT NULL CHECK (type IN (
    'follow',
    'new_post',
    'comment',
    'comment_reply',
    'like',
    'comment_like',
    'donation',
    'mention',
    'team_invite',
    'hackathon_update'
  )),
  
  -- Content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Target
  target_type TEXT, -- 'project', 'comment', 'user', 'team', 'hackathon'
  target_id UUID,
  
  -- Metadata
  metadata JSONB DEFAULT '{}', -- Extra data (e.g., donation amount)
  
  -- Status
  read BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_actor_id ON notifications(actor_id);
CREATE INDEX idx_notifications_type ON notifications(type);
```

---

## Notification Types

### 1. Follow Notification
**Trigger**: When someone follows you

**Data**:
```json
{
  "type": "follow",
  "title": "New Follower",
  "message": "john_doe started following you",
  "target_type": "user",
  "target_id": "follower_user_id"
}
```

### 2. New Post Notification
**Trigger**: When someone you follow posts a new project/idea

**Data**:
```json
{
  "type": "new_post",
  "title": "New Idea",
  "message": "alice_builder posted: \"DeFi Lending Protocol\"",
  "target_type": "project",
  "target_id": "project_id"
}
```

### 3. Comment Notification
**Trigger**: When someone comments on your project

**Data**:
```json
{
  "type": "comment",
  "title": "New Comment",
  "message": "bob_reviewer commented on your idea",
  "target_type": "project",
  "target_id": "project_id"
}
```

### 4. Comment Reply Notification
**Trigger**: When someone replies to your comment

**Data**:
```json
{
  "type": "comment_reply",
  "title": "Reply to Your Comment",
  "message": "charlie replied to your comment",
  "target_type": "project",
  "target_id": "project_id"
}
```

### 5. Vote Notification
**Trigger**: When someone votes for your project

**Data**:
```json
{
  "type": "like",
  "title": "New Vote",
  "message": "dana_crypto voted for your idea: \"NFT Marketplace\"",
  "target_type": "project",
  "target_id": "project_id"
}
```

### 6. Comment Like Notification
**Trigger**: When someone likes your comment

**Data**:
```json
{
  "type": "comment_like",
  "title": "Comment Liked",
  "message": "eve_sol liked your comment: \"Great insight!\"",
  "target_type": "project",
  "target_id": "project_id"
}
```

### 7. Donation Notification
**Trigger**: When someone donates to your project

**Data**:
```json
{
  "type": "donation",
  "title": "New Donation! 🎉",
  "message": "frank donated 5.0 SOL to your idea",
  "target_type": "project",
  "target_id": "project_id",
  "metadata": {
    "amount": 5.0,
    "tx_hash": "5xK7..."
  }
}
```

### 8. Team Invite Notification
**Trigger**: When someone invites you to a hackathon team

**Data**:
```json
{
  "type": "team_invite",
  "title": "Team Invitation",
  "message": "You've been invited to join 'Solar Builders'",
  "target_type": "team",
  "target_id": "team_id"
}
```

---

## Database Triggers

### 1. Follow Trigger

```sql
CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER AS $$
DECLARE
  v_follower_username TEXT;
BEGIN
  -- Get follower username
  SELECT username INTO v_follower_username 
  FROM users WHERE id = NEW.follower_id;
  
  -- Create notification
  PERFORM create_notification(
    NEW.following_id,                                -- user to notify
    NEW.follower_id,                                 -- actor
    'follow',                                        -- type
    'New Follower',                                  -- title
    v_follower_username || ' started following you', -- message
    'user',                                          -- target_type
    NEW.follower_id                                  -- target_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_on_follow
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_follow();
```

### 2. New Post Trigger

```sql
CREATE OR REPLACE FUNCTION notify_followers_on_new_post()
RETURNS TRIGGER AS $$
DECLARE
  v_author_username TEXT;
  v_follower RECORD;
BEGIN
  -- Get author username
  SELECT username INTO v_author_username 
  FROM users WHERE id = NEW.author_id;
  
  -- Notify all followers
  FOR v_follower IN 
    SELECT follower_id FROM follows WHERE following_id = NEW.author_id
  LOOP
    PERFORM create_notification(
      v_follower.follower_id,
      NEW.author_id,
      'new_post',
      'New Idea',
      v_author_username || ' posted: "' || LEFT(NEW.title, 50) || '"',
      'project',
      NEW.id
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_followers_on_new_post
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION notify_followers_on_new_post();
```

### 3. Comment Trigger

```sql
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  v_commenter_username TEXT;
  v_project_title TEXT;
  v_project_author_id UUID;
  v_parent_comment_author_id UUID;
BEGIN
  SELECT username INTO v_commenter_username 
  FROM users WHERE id = NEW.author_id;
  
  SELECT title, author_id INTO v_project_title, v_project_author_id 
  FROM projects WHERE id = NEW.project_id;
  
  -- 1. Notify project author
  IF v_project_author_id != NEW.author_id THEN
    PERFORM create_notification(
      v_project_author_id,
      NEW.author_id,
      'comment',
      'New Comment',
      v_commenter_username || ' commented on your idea',
      'project',
      NEW.project_id
    );
  END IF;
  
  -- 2. Notify parent comment author if this is a reply
  IF NEW.parent_id IS NOT NULL THEN
    SELECT author_id INTO v_parent_comment_author_id 
    FROM comments WHERE id = NEW.parent_id;
    
    IF v_parent_comment_author_id IS NOT NULL 
       AND v_parent_comment_author_id != NEW.author_id THEN
      PERFORM create_notification(
        v_parent_comment_author_id,
        NEW.author_id,
        'comment_reply',
        'Reply to Your Comment',
        v_commenter_username || ' replied to your comment',
        'project',
        NEW.project_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_on_comment
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_comment();
```

### 4. Vote Trigger

```sql
CREATE OR REPLACE FUNCTION notify_on_project_vote()
RETURNS TRIGGER AS $$
DECLARE
  v_voter_username TEXT;
  v_project_title TEXT;
  v_project_author_id UUID;
BEGIN
  SELECT username INTO v_voter_username 
  FROM users WHERE id = NEW.user_id;
  
  SELECT title, author_id INTO v_project_title, v_project_author_id 
  FROM projects WHERE id = NEW.project_id;
  
  IF v_project_author_id != NEW.user_id THEN
    PERFORM create_notification(
      v_project_author_id,
      NEW.user_id,
      'like',
      'New Vote',
      v_voter_username || ' voted for your idea',
      'project',
      NEW.project_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_on_project_vote
  AFTER INSERT ON project_votes
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_project_vote();
```

### 5. Donation Trigger

```sql
CREATE OR REPLACE FUNCTION notify_on_donation()
RETURNS TRIGGER AS $$
DECLARE
  v_donor_username TEXT;
  v_project_title TEXT;
  v_project_author_id UUID;
BEGIN
  -- Only for confirmed tip transactions
  IF NEW.type != 'tip' OR NEW.status != 'confirmed' THEN
    RETURN NEW;
  END IF;
  
  SELECT username INTO v_donor_username 
  FROM users WHERE id = NEW.user_id;
  
  IF NEW.project_id IS NOT NULL THEN
    SELECT title, author_id INTO v_project_title, v_project_author_id 
    FROM projects WHERE id = NEW.project_id;
    
    IF v_project_author_id != NEW.user_id THEN
      INSERT INTO notifications (
        user_id, actor_id, type, title, message, 
        target_type, target_id, metadata
      ) VALUES (
        v_project_author_id,
        NEW.user_id,
        'donation',
        'New Donation! 🎉',
        v_donor_username || ' donated ' || NEW.amount || ' SOL',
        'project',
        NEW.project_id,
        jsonb_build_object('amount', NEW.amount, 'tx_hash', NEW.tx_hash)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_on_donation
  AFTER INSERT OR UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_donation();
```

---

## Helper Functions

### create_notification()

```sql
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_actor_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_target_type TEXT DEFAULT NULL,
  p_target_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  -- Don't notify yourself
  IF p_user_id = p_actor_id THEN
    RETURN NULL;
  END IF;
  
  INSERT INTO notifications (
    user_id, actor_id, type, title, message, target_type, target_id
  ) VALUES (
    p_user_id, p_actor_id, p_type, p_title, p_message, p_target_type, p_target_id
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### get_user_notifications()

```sql
CREATE OR REPLACE FUNCTION get_user_notifications(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_unread_only BOOLEAN DEFAULT FALSE
) RETURNS TABLE (
  id UUID,
  actor_id UUID,
  actor_username TEXT,
  actor_avatar TEXT,
  type TEXT,
  title TEXT,
  message TEXT,
  target_type TEXT,
  target_id UUID,
  metadata JSONB,
  read BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.actor_id,
    u.username AS actor_username,
    u.avatar AS actor_avatar,
    n.type,
    n.title,
    n.message,
    n.target_type,
    n.target_id,
    n.metadata,
    n.read,
    n.created_at
  FROM notifications n
  LEFT JOIN users u ON n.actor_id = u.id
  WHERE n.user_id = p_user_id
    AND (NOT p_unread_only OR n.read = FALSE)
  ORDER BY n.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### mark_notification_read()

```sql
CREATE OR REPLACE FUNCTION mark_notification_read(
  p_notification_id UUID,
  p_user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications 
  SET read = TRUE 
  WHERE id = p_notification_id AND user_id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### mark_all_notifications_read()

```sql
CREATE OR REPLACE FUNCTION mark_all_notifications_read(
  p_user_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications 
  SET read = TRUE 
  WHERE user_id = p_user_id AND read = FALSE;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### get_unread_notification_count()

```sql
CREATE OR REPLACE FUNCTION get_unread_notification_count(
  p_user_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM notifications
  WHERE user_id = p_user_id AND read = FALSE;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Frontend Implementation

### Notification Bell Component

**Location**: `frontend/components/Navbar.tsx` (has notification UI)

**Features**:
- Real-time unread count badge
- Dropdown notification list
- Mark as read on click
- "Mark all as read" button
- Navigate to target on click
- Time ago display
- Actor avatar and username
- Notification icons by type

**State Management**:
```typescript
const [notifications, setNotifications] = useState<Notification[]>([]);
const [unreadCount, setUnreadCount] = useState(0);
const [isOpen, setIsOpen] = useState(false);

// Fetch notifications
useEffect(() => {
  if (user) {
    fetchNotifications();
    subscribeToRealtime();
  }
}, [user]);

// Realtime subscription
const subscribeToRealtime = () => {
  const channel = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      },
      (payload) => {
        addNotification(payload.new);
        incrementUnreadCount();
      }
    )
    .subscribe();
    
  return () => {
    supabase.removeChannel(channel);
  };
};
```

### Notification Item Component

```typescript
interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRead
}) => {
  const handleClick = () => {
    // Mark as read
    if (!notification.read) {
      onRead(notification.id);
    }
    
    // Navigate to target
    if (notification.target_type === 'project') {
      router.push(`/projects/${notification.target_id}`);
    } else if (notification.target_type === 'user') {
      router.push(`/profile/${notification.target_id}`);
    }
  };
  
  return (
    <div
      onClick={handleClick}
      className={`notification-item ${!notification.read ? 'unread' : ''}`}
    >
      <NotificationIcon type={notification.type} />
      <div className="content">
        <div className="title">{notification.title}</div>
        <div className="message">{notification.message}</div>
        <div className="time">{formatTimeAgo(notification.created_at)}</div>
      </div>
      {!notification.read && <div className="unread-dot" />}
    </div>
  );
};
```

---

## Backend API

### Endpoints

```typescript
@Controller('notifications')
export class NotificationsController {
  
  @Get()
  @UseGuards(AuthGuard)
  async getNotifications(
    @CurrentUser('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('unreadOnly') unreadOnly: boolean = false
  ) {
    return this.notificationsService.getUserNotifications(
      userId,
      limit,
      (page - 1) * limit,
      unreadOnly
    );
  }
  
  @Get('count')
  @UseGuards(AuthGuard)
  async getUnreadCount(@CurrentUser('userId') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }
  
  @Patch(':id/read')
  @UseGuards(AuthGuard)
  async markAsRead(
    @CurrentUser('userId') userId: string,
    @Param('id') notificationId: string
  ) {
    return this.notificationsService.markAsRead(userId, notificationId);
  }
  
  @Post('mark-all-read')
  @UseGuards(AuthGuard)
  async markAllAsRead(@CurrentUser('userId') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }
  
  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteNotification(
    @CurrentUser('userId') userId: string,
    @Param('id') notificationId: string
  ) {
    return this.notificationsService.delete(userId, notificationId);
  }
}
```

---

## Progress & Status

### ✅ Completed

1. ✅ Database schema and triggers
2. ✅ All 8 notification types
3. ✅ Real-time Supabase integration
4. ✅ Frontend notification UI
5. ✅ Unread count badge
6. ✅ Mark as read functionality
7. ✅ Navigation to targets
8. ✅ Time ago formatting
9. ✅ Actor info display
10. ✅ Mobile responsive design

### 🚧 In Progress

1. 🚧 Push notifications (browser)
2. 🚧 Email digest notifications
3. 🚧 Notification preferences

### 📋 Planned

1. 📋 Mobile push notifications
2. 📋 Notification grouping
3. 📋 Notification sound effects
4. 📋 Telegram/Discord webhooks
5. 📋 Notification analytics
6. 📋 Custom notification rules
7. 📋 Snooze notifications
8. 📋 Priority notifications

---

## Performance Optimization

### Database

- **Partial Index**: Index on unread notifications only
- **Cleanup Function**: Auto-delete read notifications older than 30 days

```sql
CREATE INDEX idx_notifications_user_unread 
ON notifications(user_id, read) 
WHERE read = FALSE;

-- Cleanup old notifications
CREATE FUNCTION cleanup_old_notifications() RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM notifications 
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND read = TRUE;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;
```

### Frontend

- **Pagination**: Load notifications in batches
- **Realtime Batching**: Batch multiple incoming notifications
- **Local Caching**: Cache recent notifications

---

## Testing

### Unit Tests
- Trigger function logic
- Notification creation
- Mark as read functionality

### Integration Tests
- End-to-end notification flow
- Realtime updates
- Multiple notification types

---

## Monitoring

### Metrics
- Notifications sent per day
- Average read time
- Unread accumulation
- Most common notification types
- Realtime connection stability

---

## Future Enhancements

- **AI-Powered Summaries**: Daily digest with AI summary
- **Smart Filtering**: Learn user preferences
- **Cross-Platform**: Mobile app notifications
- **Integration**: Slack, Discord, Telegram bots
