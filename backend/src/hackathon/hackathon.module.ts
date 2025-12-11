import { Module } from '@nestjs/common';
import { HackathonService } from './hackathon.service';
import { HackathonController } from './hackathon.controller';
import { SupabaseService } from '../shared/supabase.service'; // Import SupabaseService

@Module({
  controllers: [HackathonController],
  providers: [HackathonService, SupabaseService], // Use SupabaseService
  exports: [HackathonService],
})
export class HackathonModule {}
