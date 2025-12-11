import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../shared/supabase.service';

@Injectable()
export class HackathonService {
  constructor(private supabaseService: SupabaseService) {}

  // Chúng ta chỉ cần lấy thông tin cơ bản của Hackathon (Ngày bắt đầu, kết thúc, trạng thái chung)
  // Không cần join bảng timeline hay tasks nữa.
  private readonly HACKATHON_SELECT_QUERY = '*'; 

  // 1. Get the current active hackathon info
  async getActiveHackathon() {
    const { data, error } = await this.supabaseService.getClient()
      .from('hackathons')
      .select(this.HACKATHON_SELECT_QUERY)
      .in('status', ['ongoing', 'upcoming', 'open'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching active hackathon:', error);
      // Nếu không có hackathon nào trong DB, trả về null thay vì lỗi để Frontend tự xử lý hiển thị mặc định
      return null; 
    }
    
    // Trả về thêm server_time để frontend đồng bộ thời gian
    return {
      ...data,
      server_time: new Date().toISOString()
    };
  }

  // 2. Get Leaderboard (Vẫn cần DB vì điểm số thay đổi động)
  async getLeaderboard(hackathonId: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('hackathon_teams')
      .select(`
        *,
        captain (
          username,
          avatar
        )
      `)
      .eq('hackathon_id', hackathonId)
      .order('score', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return []; // Trả về mảng rỗng nếu lỗi
    }
    return data;
  }

  // 3. Check User Registration (Vẫn cần DB để biết user cụ thể)
  async getUserRegistration(userId: string, hackathonId: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('hackathon_participants')
      .select(`
        *,
        team (*)
      `)
      .eq('hackathon_id', hackathonId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { 
      return { isRegistered: false };
    }

    return {
      isRegistered: !!data,
      details: data
    };
  }

  // 4. Join Hackathon
  async joinHackathon(userId: string, hackathonId: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('hackathon_participants')
      .insert({
        hackathon_id: hackathonId,
        user_id: userId,
        role: 'member'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error joining hackathon: ${error.message}`);
    }
    return data;
  }
}
