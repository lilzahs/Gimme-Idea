import { Controller, Get, Post, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { HackathonService } from './hackathon.service';

@Controller('hackathon')
export class HackathonController {
  constructor(private readonly hackathonService: HackathonService) {}

  @Get('active')
  async getActiveHackathon() {
    return this.hackathonService.getActiveHackathon();
  }

  @Get(':id/leaderboard')
  async getLeaderboard(@Param('id') id: string) {
    return this.hackathonService.getLeaderboard(id);
  }

  @Get(':id/status')
  async getUserStatus(@Param('id') id: string, @Query('userId') userId: string) {
    // In real app, get userId from JWT/Session (Request)
    if (!userId) return { isRegistered: false };
    return this.hackathonService.getUserRegistration(userId, id);
  }

  @Post(':id/join')
  async joinHackathon(@Param('id') id: string, @Body('userId') userId: string) {
    return this.hackathonService.joinHackathon(userId, id);
  }
}
