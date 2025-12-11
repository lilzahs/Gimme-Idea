import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { FollowController } from "./follow.controller";
import { FollowService } from "./follow.service";
import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";
import { SupabaseService } from "../shared/supabase.service";

@Module({
  controllers: [UsersController, FollowController, NotificationController],
  providers: [
    UsersService,
    FollowService,
    NotificationService,
    SupabaseService,
  ],
  exports: [UsersService, FollowService, NotificationService],
})
export class UsersModule {}
