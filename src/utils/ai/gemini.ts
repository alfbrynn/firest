import { GoogleGenerativeAI } from "@google/generative-ai";

// Inisialisasi SDK dengan API Key dari .env.local
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function extractReceiptData(receiptText: string) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      // Instruksi disesuaikan dengan skema database Supabase
      systemInstruction: "Kamu adalah asisten akuntan pintar khusus aplikasi gamifikasi finansial. Tugasmu membaca teks mentah dari email/struk dan mengekstrak datanya menjadi format JSON. Aturan output HANYA gunakan kunci berikut: \n1. 'title' (string, nama tempat/transaksi singkat). \n2. 'amount' (number, hanya angka bulat tanpa simbol). \n3. 'type' (HANYA pilih salah satu: 'income', 'expense', atau 'transfer'). \n4. 'category' (HANYA pilih salah satu: 'Makanan', 'Transport', 'Belanja', 'Hiburan', 'Tagihan', 'Lainnya'). \n5. 'date' (format YYYY-MM-DD). \nDilarang keras merespons dengan teks penjelasan atau markdown, kembalikan teks berformat JSON murni.",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1, // Rendah agar stabil dan tidak berhalusinasi
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