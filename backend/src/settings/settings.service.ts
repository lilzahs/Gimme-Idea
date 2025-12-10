import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../shared/supabase.service';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Get public menu configuration for the Navbar
   */
  async getMenuConfig() {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('system_settings')
        .select('value')
        .eq('key', 'menu_config')
        .single();

      if (error) {
        // If config doesn't exist yet, return default structure matching the current hardcoded one
        if (error.code === 'PGRST116') {
          return this.getDefaultMenuConfig();
        }
        this.logger.error(`Error fetching menu config: ${error.message}`);
        return this.getDefaultMenuConfig();
      }

      return data.value;
    } catch (err) {
      this.logger.error(`Unexpected error fetching menu config: ${err}`);
      return this.getDefaultMenuConfig();
    }
  }

  /**
   * Default configuration to use if DB is empty or fails
   */
  private getDefaultMenuConfig() {
    return [
      { name: 'Hackathon', route: '/hackathon', icon: 'Trophy', isActive: true },
      { name: 'About Us', route: '/about', icon: 'Info', isActive: true },
      { name: 'Contact', route: '/contact', icon: 'Mail', isActive: true },
    ];
  }
}
