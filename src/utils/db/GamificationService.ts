import { SupabaseClient } from "@supabase/supabase-js";

export class GamificationService {
  static async addXpForTransaction(supabase: SupabaseClient, userId: string, transactionType: string) {
    const { data: gameState } = await supabase
      .from('gamification_state')
      .select('*')
      .eq('user_id', userId)
      .single();

    let currentXp = gameState?.xp || 0;
    const XP_REWARD = transactionType === 'income' ? 50 : 5;
    const newXp = currentXp + XP_REWARD;
    
    // Hitung level baru (200 XP per level, max 12)
    const newLevel = Math.min(12, Math.floor(newXp / 200) + 1);
    const isLevelUp = newLevel > (gameState?.level || 1);

    if (gameState) {
      await supabase
        .from('gamification_state')
        .update({ xp: newXp, level: newLevel })
        .eq('user_id', userId);
    } else {
      await supabase
        .from('gamification_state')
        .insert([{ user_id: userId, xp: newXp, level: newLevel }]);
    }

    return { addedXp: XP_REWARD, newXp, newLevel, isLevelUp };
  }
}

