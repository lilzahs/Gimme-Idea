import { Module } from '@nestjs/common';
import { HackathonController } from './hackathon.controller';
import { HackathonService } from './hackathon.service';
import { SupabaseService } from '../shared/supabase.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [HackathonController],
  providers: [HackathonService, SupabaseService],
  exports: [HackathonService]
})
export class HackathonModule {}
