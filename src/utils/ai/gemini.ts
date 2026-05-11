import { GoogleGenerativeAI } from "@google/generative-ai";

// Inisialisasi SDK dengan API Key dari .env.local
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function extractReceiptData(receiptText: string) {
  try {
    // Ubah bagian ini
    const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite", 
    systemInstruction: `Ekstrak data struk ke JSON. 
    WAJIB: 
    - "type": harus 'expense' (pengeluaran) atau 'income' (pemasukan).
    - "amount": angka saja.
    - "category": 'Makanan', 'Transport', 'Belanja', 'Hiburan', 'Tagihan', 'Lainnya'.`,
    generationConfig: {
        responseMimeType: "application/json", // Memaksa model untuk berpikir dalam format JSON
        temperature: 0.1, 
    },
    });

    const prompt = `Ekstrak data dari teks struk/email berikut:\n\n${receiptText}`;
    
    // Kirim ke Gemini
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse JSON murni dari Gemini
    const parsedData = JSON.parse(responseText);
    
    return parsedData;

  } catch (error) {
    console.error("Gagal mengekstrak data dengan Gemini:", error);
    throw new Error("Gagal memproses struk");
  }
}