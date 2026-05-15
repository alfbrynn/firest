import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export class GeminiProvider {
  static async extractReceiptWithAI(text: string) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite", 
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
}
