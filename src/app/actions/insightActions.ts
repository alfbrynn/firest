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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  return await InsightService.generateInsightIfNeeded(user.id, data);
}
