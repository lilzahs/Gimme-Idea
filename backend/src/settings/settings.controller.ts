import { Controller, Get } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { ApiResponse } from '../shared/types';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('menu-config')
  async getMenuConfig(): Promise<ApiResponse<any[]>> {
    const config = await this.settingsService.getMenuConfig();
    return {
      success: true,
      data: config,
    };
  }
}
