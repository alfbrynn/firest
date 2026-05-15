import { GeminiProvider } from "@/src/utils/ai/GeminiProvider";

export class ParsingService {
  /**
   * Filter awal: Cek apakah ada nominal uang dalam teks
   */
  static hasMoneyNominal(text: string): boolean {
    const moneyRegex = /(Rp|IDR|Total|Pembayaran)\s*\.?\d+|\d{1,3}(?:\.\d{3})+/i;
    return moneyRegex.test(text);
  }

  /**
   * (Opsional) Parse dengan regex hardcoded untuk kecepatan & hemat kuota
   */
  static parseWithHardcodedRegex(text: string) {
    // Contoh untuk GoPay (bisa dikembangkan nanti)
    if (text.includes("GoPay") && text.includes("berhasil")) {
       // Logika regex di sini...
    }
    return null; // Sementara return null agar lanjut ke Gemini
  }

  static async parseEmailToTransaction(emailBody: string) {
    // 1. Cek Regex Nominal (Filter awal)
    if (!this.hasMoneyNominal(emailBody)) {
      console.log("[ParsingService] Skip: Tidak ada nominal uang.");
      return null;
    }

    // 2. Coba Hardcode Regex (BCA, GoPay, dll)
    const regexResult = this.parseWithHardcodedRegex(emailBody);
    if (regexResult) return regexResult;

    // 3. Fallback ke AI jika regex tidak ada yang cocok
    return await GeminiProvider.extractReceiptWithAI(emailBody);
  }
}
