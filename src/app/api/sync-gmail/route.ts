import { NextResponse } from "next/server";
import { createClient } from "@/src/utils/supabase/server";
import { fetchLatestReceipts } from "@/src/utils/gmail/gmailService";
import { extractReceiptData } from "@/src/utils/ai/gemini";
import { saveTransactionAndUpdateXP } from "@/src/utils/db/transactionService";

export async function POST() {
  const supabase = await createClient();
  
  // 1. Verifikasi User secara Aman (Sesuai anjuran log)
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  // 2. Ambil Session secara terpisah untuk mendapatkan Provider Token
  const { data: { session } } = await supabase.auth.getSession();
  const providerToken = session?.provider_token;

  // Cek Log di terminal VS Code untuk debug
  if (!user) {
    console.error("DEBUG: User tidak ditemukan dalam sesi.");
    return NextResponse.json({ error: "Sesi habis, silakan login ulang." }, { status: 401 });
  }

  if (!providerToken) {
    console.error("DEBUG: Provider Token (Google) hilang. User harus login ulang dengan izin Gmail.");
    return NextResponse.json({ error: "Izin Gmail hilang. Silakan Logout lalu Login lagi." }, { status: 401 });
  }

  try {
    const emails = await fetchLatestReceipts(providerToken, user.created_at);
    let processedCount = 0;

    for (const email of emails) {
      if (!email.id || !email.body) continue;

      const { data: existing } = await supabase
        .from('transactions')
        .select('id')
        .eq('gmail_message_id', email.id)
        .single();

      if (existing) continue;

      const parsedData = await extractReceiptData(email.body);

      // Gunakan user.id dari getUser() yang lebih aman
      await saveTransactionAndUpdateXP(supabase, user.id, {
        ...parsedData,
        gmail_message_id: email.id,
        is_auto_sync: true
      });

      processedCount++;
    }

    return NextResponse.json({ message: `Berhasil sinkronisasi ${processedCount} transaksi baru.` });

  } catch (error: any) {
    console.error("SYNC ERROR:", error);
    return NextResponse.json({ error: "Gagal sinkronisasi" }, { status: 500 });
  }
}