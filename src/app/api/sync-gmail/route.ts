import { NextResponse } from "next/server";
import { createClient } from "@/src/utils/supabase/server";
import { fetchLatestReceipts } from "@/src/utils/gmail/gmailService";
import { extractReceiptData } from "@/src/utils/ai/gemini";
import { saveTransactionAndUpdateXP } from "@/src/utils/db/transactionService";

export async function POST() {
  // FIX ERROR 1 & 2: Tambahkan 'await' di sini
  const supabase = await createClient();
  
  // 1. Ambil session untuk dapat Token Google
  const { data: { session } } = await supabase.auth.getSession();
  const providerToken = session?.provider_token;

  if (!providerToken) {
    return NextResponse.json({ error: "Token Google tidak ditemukan. Coba login ulang." }, { status: 401 });
  }

  try {
    // 2. Tarik email yang sudah terfilter
    const emails = await fetchLatestReceipts(providerToken);
    
    let processedCount = 0;

    for (const email of emails) {
      // FIX ERROR 3: Pastikan ID dan Body benar-benar ada (bukan undefined)
      if (!email.id || !email.body) continue;

      // 3. Cek apakah email ID ini sudah pernah diproses? (Deduplication)
      const { data: existing } = await supabase
        .from('transactions')
        .select('id')
        .eq('gmail_message_id', email.id)
        .single();

      if (existing) continue; // Skip kalau sudah ada

      // 4. Kirim ke Gemini (Otak AI) - sekarang TypeScript tahu email.body pasti string
      const parsedData = await extractReceiptData(email.body);

      // 5. Simpan ke DB & Update XP
      await saveTransactionAndUpdateXP(supabase, session.user.id, {
        ...parsedData,
        gmail_message_id: email.id,
        is_auto_sync: true
      });

      processedCount++;
    }

    return NextResponse.json({ message: `Berhasil sinkronisasi ${processedCount} transaksi baru.` });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Gagal sinkronisasi" }, { status: 500 });
  }
}