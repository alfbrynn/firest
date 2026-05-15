import { NextResponse } from "next/server";
import { createClient } from "@/src/utils/supabase/server";
import { SyncService } from "@/src/services/SyncService";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: { session } } = await supabase.auth.getSession();

    if (!user || !session?.provider_token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Panggil The Orchestrator
    const count = await SyncService.runAutoSync(supabase, user.id, session.provider_token);

    return NextResponse.json({ message: `Sukses sync ${count} transaksi.` });
  } catch (error: any) {
    console.error("Sync Error:", error.message);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}