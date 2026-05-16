"use server";

import { createClient } from "@/src/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getNotificationsAction() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data };
}

export async function markAllReadAction() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

    if (error) return { success: false, error: error.message };
    
    revalidatePath("/notifications");
    revalidatePath("/dashboard");
    return { success: true };
}

export async function deleteNotificationAction(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/notifications");
    return { success: true };
}

export async function createNotificationAction(type: string, title: string, content: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
        .from("notifications")
        .insert({
            user_id: user.id,
            type,
            title,
            content
        });

    if (error) return { success: false, error: error.message };
    
    revalidatePath("/notifications");
    revalidatePath("/dashboard");
    return { success: true };
}
