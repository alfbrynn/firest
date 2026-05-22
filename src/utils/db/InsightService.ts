import { createClient } from "../supabase/server";
import { GroqProvider } from "../ai/GroqProvider";
import { differenceInDays } from "date-fns";

export class InsightService {
  static async getLatestInsight(userId: string) {
    const supabase = await createClient();
    
    const { data: lastInsight, error } = await supabase
      .from('insights')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching latest insight:", error);
    }

    return lastInsight;
  }

  static async generateInsightIfNeeded(userId: string, data: {
    transactions: any[];
    income: number;
    budgetCategories: any;
    streakDays: number;
  }) {
    const lastInsight = await this.getLatestInsight(userId);

    if (lastInsight) {
      const daysSinceLast = differenceInDays(new Date(), new Date(lastInsight.created_at));
      // Temporarily disabled cooldown for testing
      if (false && daysSinceLast < 7) {
        return { 
          insight: lastInsight, 
          isNew: false, 
          daysRemaining: 7 - daysSinceLast,
          nextAvailableDate: new Date(new Date(lastInsight.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };
      }
    }

    // Generate new insight
    const insights = await GroqProvider.generateFinancialInsight(data);
    
    const supabase = await createClient();
    const { data: newInsight, error } = await supabase
      .from('insights')
      .insert({
        user_id: userId,
        content: insights
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving new insight:", error);
      throw new Error("Failed to save insight");
    }

    return { 
      insight: newInsight, 
      isNew: true, 
      daysRemaining: 7,
      nextAvailableDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  }
}
