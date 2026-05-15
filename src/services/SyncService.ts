import { SupabaseClient } from "@supabase/supabase-js";
import { GmailProvider } from "@/src/utils/gmail/GmailProvider";
import { TransactionService } from "@/src/utils/db/TransactionService";
import { ParsingService } from "./ParsingService";
import { GamificationService } from "@/src/utils/db/GamificationService";

export class SyncService {
  static async runAutoSync(supabase: SupabaseClient, userId: string, providerToken: string) {
    let successCount = 0;

    // 1. Tarik email via Provider (3 hari terakhir)
    const emails = await GmailProvider.fetchRecentEmails(providerToken, 3);

    for (const email of emails) {
       // 2. Cek DB via TransactionService apakah sudah pernah diproses
       if (await TransactionService.isExists(supabase, email.id)) continue;

       // 3. Parsing via ParsingService (Regex + Gemini)
       const parsedData = await ParsingService.parseEmailToTransaction(email.body, email.date);

       
       if (!parsedData || !parsedData.amount || parsedData.amount === 0) {
         continue;
       }

       // 4. Simpan ke Database
       await TransactionService.saveTransaction(supabase, userId, {
         ...parsedData,
         gmail_message_id: email.id
       });

       // 5. Update Gamifikasi
       await GamificationService.addXpForTransaction(supabase, userId, parsedData.type);

       successCount++;
    }

    return successCount;
  }
}
