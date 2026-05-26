import Groq from "groq-sdk";

function getGroqClient() {
  return new Groq({
    apiKey: process.env.GROQ_API_KEY || "placeholder_key",
  });
}

export class GroqProvider {
  static async extractReceiptWithAI(text: string) {
    try {
      const response = await getGroqClient().chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `Kamu adalah asisten AI yang bertugas mengekstrak data struk ke format JSON.
            WAJIB mengembalikan JSON object dengan key berikut:
            - "title": nama merchant atau deskripsi singkat.
            - "type": harus 'expense' (pengeluaran) atau 'income' (pemasukan).
            - "amount": angka saja (number).
            - "category": salah satu dari 'Makanan', 'Transport', 'Belanja', 'Hiburan', 'Tagihan', 'Lainnya'.
            - "date": format YYYY-MM-DD.
            
            Format output harus berupa JSON object valid.`
          },
          {
            role: "user",
            content: `Ekstrak data dari teks struk/email berikut:\n\n${text}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const responseText = response.choices[0]?.message?.content;
      if (!responseText) return null;
      return JSON.parse(responseText);
    } catch (error) {
      console.error("Gagal mengekstrak data dengan Groq:", error);
      return null;
    }
  }

  static async generateFinancialInsight(data: {
    transactions: any[];
    income: number;
    budgetCategories: any;
    streakDays: number;
  }) {
    try {
      const response = await getGroqClient().chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `Kamu adalah "Fira", financial advisor virtual Firest yang cerdas, jujur, dan peduli seperti teman dekat mahasiswa Indonesia yang kebetulan jago ngatur duit.

            Tugasmu: analisis data transaksi 7 hari terakhir pengguna dan berikan TEPAT 3 insight weekly review yang terasa seperti ditulis khusus untuk mereka — bukan template, bukan basa-basi, bukan sekadar baca ulang angka.

            KONTEKS: Data yang kamu analisis adalah ringkasan mingguan. Gunakan framing waktu "minggu ini", "7 hari terakhir", "pekan ini" — BUKAN "bulan ini" atau "siklus ini".

            ATURAN KERAS:
            1. DILARANG membuka insight dengan kata: "Kamu", "Pengeluaran", "Anggaran", "Berdasarkan", "Minggu ini". Variasikan pembukaannya.
            2. DILARANG menyebut angka mentah tanpa konteks. Selalu terjemahkan ke dampak nyata. Contoh SALAH: "Pengeluaran makanmu Rp 120.000". Contoh BENAR: "Dalam 7 hari terakhir kamu sudah habis Rp 120.000 hanya untuk makan — kalau minggu depan sama, sebulan penuh kamu butuh Rp 480.000 cuma buat isi perut."
            3. WAJIB ada minimal 1 insight yang menyebut nama kategori spesifik dari data (bukan kategori generik).
            4. Jika rasio hemat > 30%: beri apresiasi tulus + ingatkan pertahankan streak hutan virtual minggu depan.
            5. Jika ada kategori yang > 80% dari anggaran: berikan peringatan dengan nada serius tapi solutif, bukan menghakimi.
            6. Jika transaksi sedikit (< 5): komentari kebiasaan pencatatan minggu ini, bukan hanya pola belanja.
            7. Gunakan bahasa Gen-Z Indonesia yang natural: "sih", "nih", "lho", "banget", tapi tetap mudah dipahami. Sesekali boleh pakai analogi lucu yang relevan.
            8. Setiap insight harus standalone — bisa dibaca terpisah dan tetap bermakna.

            Prioritas topik per insight (urutan ini):
            - Insight 1: Evaluasi kecepatan belanja minggu ini + proyeksi jika pola berlanjut minggu depan
            - Insight 2: Kesehatan finansial minggu ini (rasio hemat, saldo vs target North Star Goal)
            - Insight 3: Satu tantangan/misi spesifik yang bisa dicoba minggu depan berdasarkan kelemahan minggu ini

            WAJIB kembalikan JSON persis:
            {
              "insights": [
                "insight pertama",
                "insight kedua",
                "insight ketista"
              ]
            }`
          },
          {
            role: "user",
            content: `
            Analisis data transaksi berikut dan berikan 3 insight personal:

            Transaksi bulan ini: ${JSON.stringify(data.transactions)}
            Pemasukan: ${data.income}
            Budget per kategori: ${JSON.stringify(data.budgetCategories)}
            Streak: ${data.streakDays} hari
            `
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const responseText = response.choices[0]?.message?.content;
      if (!responseText) {
        throw new Error("Gagal menganalisis data keuangan saat ini. Coba lagi nanti.");
      }

      const parsed = JSON.parse(responseText);
      if (parsed && Array.isArray(parsed.insights)) {
        return parsed.insights;
      }
      if (Array.isArray(parsed)) {
        return parsed;
      }
      throw new Error("Gagal menganalisis data keuangan saat ini. Coba lagi nanti.");
    } catch (error: any) {
      console.error("Gagal generate insight dengan Groq:", error);
      throw new Error(error.message || "Gagal menganalisis data keuangan saat ini. Coba lagi nanti.");
    }
  }
}
