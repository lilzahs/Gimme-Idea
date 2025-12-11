import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { AuthGuard } from "../common/guards/auth.guard";
import { CurrentUser } from "../common/decorators/user.decorator";
import { GetNotificationsDto } from "./dto/notification.dto";

@Controller("notifications")
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  /**
   * GET /api/notifications - Get current user's notifications
   */
  @Get()
  async getNotifications(
    @CurrentUser("id") userId: string,
    @Query() query: GetNotificationsDto
  ) {
    const notifications = await this.notificationService.getNotifications(
      userId,
      query.limit || 20,
      query.offset || 0,
      query.unreadOnly || false
    );

    return {
      success: true,
      notifications,
    };
  }

  /**
   * GET /api/notifications/unread-count - Get unread count
   */
  @Get("unread-count")
  async getUnreadCount(@CurrentUser("id") userId: string) {
    const unreadCount = await this.notificationService.getUnreadCount(userId);

    return {
      success: true,
      unreadCount,
    };
  }

  /**
   * POST /api/notifications/:id/read - Mark a notification as read
   */
  @Post(":id/read")
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @CurrentUser("id") userId: string,
    @Param("id") notificationId: string
  ) {
    const success = await this.notificationService.markAsRead(
      notificationId,
      userId
    );

    return {
      success,
    };
  }

  /**
   * POST /api/notifications/read-all - Mark all notifications as read
   */
  @Post("read-all")
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@CurrentUser("id") userId: string) {
    const count = await this.notificationService.markAllAsRead(userId);

    return {
      success: true,
      markedCount: count,
    };
  }

  /**
   * DELETE /api/notifications/:id - Delete a notification
   */
  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  async deleteNotification(
    @CurrentUser("id") userId: string,
    @Param("id") notificationId: string
  ) {
    await this.notificationService.deleteNotification(notificationId, userId);

    return {
      success: true,
    };
  }

  /**
   * DELETE /api/notifications - Clear all notifications
   */
  @Delete()
  @HttpCode(HttpStatus.OK)
  async clearAllNotifications(@CurrentUser("id") userId: string) {
    await this.notificationService.clearAllNotifications(userId);

    return {
      success: true,
    };
  }
}
