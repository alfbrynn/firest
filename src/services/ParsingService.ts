import { GeminiProvider } from "@/src/utils/ai/GeminiProvider";

const PARSERS = [
  {
    name: 'mandiri',
    // Deteksi: Pastikan email dari Livin' Mandiri dan adalah notifikasi pembayaran/transfer
    detect: /Livin'|<noreply\.livin@bankmandiri\.co\.id>|Pembayaran Berhasil/i,
    extract: (text: string, fallbackDate?: string) => {
      // Nominal: Cari "Nominal Transaksi Rp 10.000,00"
      const amountMatch = text.match(/Nominal Transaksi\s*Rp\s*([\d.,]+)/i);
      // Merchant/Penerima: Cari teks di bawah "Penerima" sebelum "Tanggal"
      const titleMatch = text.match(/Penerima\s+([\s\S]+?)\s+Tanggal/i);

      if (amountMatch) {
        return {
          title: titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ').substring(0, 30) : 'Transaksi Mandiri',
          // Hapus titik ribuan dan koma desimal untuk mendapatkan angka bulat
          amount: parseInt(amountMatch[1].split(',')[0].replace(/\./g, ''), 10),
          type: 'expense',
          category: 'Lainnya',
          date: fallbackDate || new Date().toISOString()
        };
      }
      return null;
    }
  },
  {
    name: 'alfagift',
    // Deteksi: Email dari Alfagift tentang pesanan
    detect: /Alfagift|<noreply@alfagift\.id>|Pembayaran Pesanan/i,
    extract: (text: string, fallbackDate?: string) => {
      // Nominal: Ambil dari baris "Total Pembayaran Rp 109.500"
      const amountMatch = text.match(/Total Pembayaran\s*Rp\s*([\d.,]+)/i);

      if (amountMatch) {
        return {
          title: 'Belanja Alfagift',
          amount: parseInt(amountMatch[1].replace(/\./g, ''), 10),
          type: 'expense',
          category: 'Belanja',
          date: fallbackDate || new Date().toISOString()
        };
      }
      return null;
    }
  }
];

export class ParsingService {
  /**
   * Filter awal: Cek apakah ada nominal uang dalam teks
   */
  static hasMoneyNominal(text: string): boolean {
    const moneyRegex = /(Rp|IDR|Total|Pembayaran)\s*\.?\d+|\d{1,3}(?:\.\d{3})+/i;
    return moneyRegex.test(text);
  }

  /**
   * Parse dengan regex hardcoded untuk kecepatan & hemat kuota
   */
  static parseWithHardcodedRegex(text: string, fallbackDate?: string) {
    for (const parser of PARSERS) {
      if (parser.detect.test(text)) {
        const result = parser.extract(text, fallbackDate);
        if (result) {
          console.log(`[ParsingService] Regex Match: ${parser.name}`);
          return result;
        }
      }
    }
    return null;
  }

  /**
   * Deteksi kategori berdasarkan kata kunci di judul/keterangan email
   */
  static detectCategoryFromKeywords(title: string, emailBody: string): string {
    const foodRegex = /Kopi|Resto|Kfc|GoFood|Ice|/i;
    const transportRegex = /Gojek|Grab/i;

    const combinedText = `${title} ${emailBody}`;

    if (foodRegex.test(combinedText)) {
      return "Makanan";
    }
    if (transportRegex.test(combinedText)) {
      return "Transport";
    }
    return "Lainnya";
  }

  static async parseEmailToTransaction(emailBody: string, fallbackDate?: string) {
    // 1. Cek Regex Nominal (Filter awal)
    if (!this.hasMoneyNominal(emailBody)) {
      console.log("[ParsingService] Skip: Bukan transaksi (tidak ada nominal).");
      return null;
    }

    // 2. Coba Hardcode Regex (Mandiri, Alfagift, dll)
    const regexResult = this.parseWithHardcodedRegex(emailBody, fallbackDate);

    let result = null;
    if (regexResult) {
      result = regexResult;
    } else {
      // 3. Fallback ke AI jika regex tidak ada yang cocok
      console.log("[ParsingService] Regex Gagal, Fallback ke AI...");
      const aiResult = await GeminiProvider.extractReceiptWithAI(emailBody);

      // Jika AI tidak mengembalikan tanggal, gunakan fallbackDate
      if (aiResult && !aiResult.date && fallbackDate) {
        aiResult.date = fallbackDate;
      }
      result = aiResult;
    }

    // 4. Deteksi Kategori otomatis berdasarkan judul & isi email
    if (result) {
      result.category = this.detectCategoryFromKeywords(result.title, emailBody);
    }

    return result;
  }
}
