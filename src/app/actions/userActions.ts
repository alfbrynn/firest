"use server";

import { createClient } from "@/src/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateNotifPreferencesAction(preferences: {
    notif_spending_alert?: boolean;
    notif_budget_reminder?: boolean;
    notif_ai_insight?: boolean;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
        .from("profiles")
        .update(preferences)
        .eq("id", user.id);

    if (error) return { success: false, error: error.message };
    
    revalidatePath("/settings");
    return { success: true };
}

export async function getUserPreferencesAction() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
        .from("profiles")
        .select("notif_spending_alert, notif_budget_reminder, notif_ai_insight, is_gmail_tester")
        .eq("id", user.id)
        .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
}

export async function completeTutorialAction() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
        .from("profiles")
        .update({ has_completed_tutorial: true })
        .eq("id", user.id);

    if (error) return { success: false, error: error.message };
    return { success: true };
}
