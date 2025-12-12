import { Module } from '@nestjs/common';
import { FeedsService } from './feeds.service';
import { FeedsController } from './feeds.controller';
import { SupabaseService } from '../shared/supabase.service';

@Module({
  controllers: [FeedsController],
  providers: [FeedsService, SupabaseService],
  exports: [FeedsService],
})
export class FeedsModule {}
