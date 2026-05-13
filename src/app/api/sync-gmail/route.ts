import { NextResponse } from "next/server";
import { createClient } from "@/src/utils/supabase/server";
import { fetchLatestReceipts } from "@/src/utils/gmail/gmailService";
import { extractReceiptData } from "@/src/utils/ai/gemini";
import { saveTransactionAndUpdateXP } from "@/src/utils/db/transactionService";

export async function POST() {
  const supabase = await createClient();
  
  // 1. Ambil User & Session
  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();

  // Proteksi: Jika user atau token tidak ada, langsung stop
  if (!user || !session?.provider_token) {
    return NextResponse.json({ error: "Sesi tidak valid atau izin Gmail hilang." }, { status: 401 });
  }

  // FIX: Inisialisasi processedCount di luar loop
  let processedCount = 0;

  try {
    // 2. Tarik email (Gunakan user.created_at karena user sudah dipastikan ada)
    const emails = await fetchLatestReceipts(session.provider_token, user.created_at);
    
    for (const email of emails) {
      if (!email.id || !email.body) continue;

      try {
        // 3. Cek Duplikat di DB agar tidak memproses email yang sama
        // ... di dalam loop
        const { data: existing } = await supabase.from('transactions').select('id').eq('gmail_message_id', email.id).single();
        if (existing) continue;

        // === STRATEGI 1: PRE-FILTERING ===
        // Cek apakah ada kata "Rp", "IDR", atau angka minimal ribuan (misal: 50.000)
        const validReceiptRegex = /(Rp|IDR)\s*\.?\d+|\d{1,3}(?:\.\d{3})+/i;
        if (!validReceiptRegex.test(email.body)) {
            console.log(`Email ${email.id} bukan tagihan valid. Skip AI.`);
            continue; // Lanjut ke email berikutnya tanpa memanggil Gemini
        }
        // =================================

        // Baru kirim ke Gemini
        const parsedData = await extractReceiptData(email.body);

        if (!parsedData || !parsedData.amount || parsedData.amount === 0) {
           console.log(`Email ${email.id} bukan struk valid (Rp 0). Diabaikan.`);
           continue; 
        }

        // 5. Simpan ke DB & Update XP
        await saveTransactionAndUpdateXP(supabase, user.id, {
          ...parsedData,
          gmail_message_id: email.id,
          is_auto_sync: true
        });

        processedCount++;

      } catch (loopError: any) {
        // Jika error duplikat (Postgres code 23505), abaikan dan lanjut email berikutnya
        if (loopError.message?.includes('23505') || loopError.code === '23505') {
          console.warn(`Email ${email.id} duplikat, skip.`);
          continue;
        }
        // Jika error lain dalam loop, log tapi jangan hentikan loop-nya
        console.error("Gagal memproses satu email:", loopError.message);
      }
    }

    return NextResponse.json({ 
        message: `Berhasil sinkronisasi ${processedCount} transaksi baru.` 
    });

  } catch (error: any) {
    console.error("CRITICAL SYNC ERROR:", error);
    return NextResponse.json({ error: "Gagal sinkronisasi global" }, { status: 500 });
  }
}