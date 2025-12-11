import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { SupabaseService } from "../shared/supabase.service";
import { NotificationResponseDto } from "./dto/notification.dto";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private supabaseService: SupabaseService) {}

  /**
   * Get notifications for a user
   */
  async getNotifications(
    userId: string,
    limit: number = 20,
    offset: number = 0,
    unreadOnly: boolean = false
  ): Promise<NotificationResponseDto[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.rpc("get_user_notifications", {
      p_user_id: userId,
      p_limit: limit,
      p_offset: offset,
      p_unread_only: unreadOnly,
    });

    if (error) {
      this.logger.error(
        `Failed to get notifications for user ${userId}:`,
        error
      );
      throw error;
    }

    return (data || []).map((n: any) => ({
      id: n.id,
      actorId: n.actor_id,
      actorUsername: n.actor_username,
      actorAvatar: n.actor_avatar,
      type: n.type,
      title: n.title,
      message: n.message,
      targetType: n.target_type,
      targetId: n.target_id,
      read: n.read,
      createdAt: n.created_at,
    }));
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.rpc(
      "get_unread_notification_count",
      {
        p_user_id: userId,
      }
    );

    if (error) {
      this.logger.error(
        `Failed to get unread count for user ${userId}:`,
        error
      );
      return 0;
    }

    return data || 0;
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.rpc("mark_notification_read", {
      p_notification_id: notificationId,
      p_user_id: userId,
    });

    if (error) {
      this.logger.error(
        `Failed to mark notification ${notificationId} as read:`,
        error
      );
      throw error;
    }

    return data;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<number> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.rpc("mark_all_notifications_read", {
      p_user_id: userId,
    });

    if (error) {
      this.logger.error(
        `Failed to mark all notifications as read for user ${userId}:`,
        error
      );
      throw error;
    }

    return data || 0;
  }

  /**
   * Delete a notification
   */
  async deleteNotification(
    notificationId: string,
    userId: string
  ): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId)
      .eq("user_id", userId);

    if (error) {
      this.logger.error(
        `Failed to delete notification ${notificationId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Clear all notifications for a user
   */
  async clearAllNotifications(userId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", userId);

    if (error) {
      this.logger.error(
        `Failed to clear notifications for user ${userId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Create a notification manually (for API use)
   */
  async createNotification(
    userId: string,
    actorId: string | null,
    type: string,
    title: string,
    message: string,
    targetType?: string,
    targetId?: string
  ): Promise<string | null> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.rpc("create_notification", {
      p_user_id: userId,
      p_actor_id: actorId,
      p_type: type,
      p_title: title,
      p_message: message,
      p_target_type: targetType || null,
      p_target_id: targetId || null,
    });

    if (error) {
      this.logger.error(`Failed to create notification:`, error);
      throw error;
    }

    return data;
  }
}
