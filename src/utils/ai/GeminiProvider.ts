import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export class GeminiProvider {
  static async extractReceiptWithAI(text: string) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-latest", 
        systemInstruction: `Ekstrak data struk ke JSON. 
        WAJIB: 
        - "title": nama merchant atau deskripsi singkat.
        - "type": harus 'expense' (pengeluaran) atau 'income' (pemasukan).
        - "amount": angka saja.
        - "category": 'Makanan', 'Transport', 'Belanja', 'Hiburan', 'Tagihan', 'Lainnya'.
        - "date": format YYYY-MM-DD.`,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1, 
        },
      });

      const prompt = `Ekstrak data dari teks struk/email berikut:\n\n${text}`;
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      return JSON.parse(responseText);
    } catch (error) {
      console.error("Gagal mengekstrak data dengan Gemini:", error);
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
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-latest", // Model stabil, cepat, dan gratis
        systemInstruction: `Kamu adalah financial advisor untuk mahasiswa Indonesia. 
        Berikan insight dalam Bahasa Indonesia yang singkat, personal, dan actionable. 
        Sebut pola spesifik dari datanya, jangan generic. Format JSON array of strings.`,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const prompt = `
      Analisis data transaksi berikut dan berikan 3 insight personal:

      Transaksi bulan ini: ${JSON.stringify(data.transactions)}
      Pemasukan: ${data.income}
      Budget per kategori: ${JSON.stringify(data.budgetCategories)}
      Streak: ${data.streakDays} hari

      Berikan insight dalam Bahasa Indonesia yang singkat, personal, dan actionable. 
      Sebut pola spesifik dari datanya, jangan generic. Format JSON array of strings.
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      return JSON.parse(responseText);
    } catch (error) {
      console.error("Gagal generate insight dengan Gemini:", error);
      return ["Gagal menganalisis data keuangan saat ini. Coba lagi nanti."];
    }
  }
}
