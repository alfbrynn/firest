import { SupabaseClient } from "@supabase/supabase-js";

export class TransactionService {
  static async isExists(supabase: SupabaseClient, messageId: string) {
    const { data } = await supabase
      .from('transactions')
      .select('id')
      .eq('gmail_message_id', messageId)
      .single();
    
    return !!data;
  }

  static async saveTransaction(supabase: SupabaseClient, userId: string, data: any) {
    const { error } = await supabase
      .from('transactions')
      .insert([{
        user_id: userId,
        title: data.title || "Transaksi Otomatis",
        amount: data.amount || 0,
        type: ['expense', 'income', 'transfer'].includes(data.type) ? data.type : 'expense',
        category: data.category || "Lainnya",
        date: data.date || new Date().toISOString(),
        is_auto_sync: true,
        gmail_message_id: data.gmail_message_id
      }]);

    if (error) {
      console.error("Error saving transaction:", error);
      throw error;
    }
  }
}