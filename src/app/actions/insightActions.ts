"use server";

import { InsightService } from "@/src/utils/db/InsightService";
import { createClient } from "@/src/utils/supabase/server";

export async function getInsightsAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  return await InsightService.getLatestInsight(user.id);
}

export async function generateInsightAction(data: {
  transactions: any[];
  income: number;
  budgetCategories: any;
  streakDays: number;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    const result = await InsightService.generateInsightIfNeeded(user.id, data);
    return { success: true, ...result };
  } catch (err: any) {
    console.error("Error in generateInsightAction server action:", err);
    return { success: false, error: err.message || "Gagal menganalisis data keuangan saat ini." };
  }
}
