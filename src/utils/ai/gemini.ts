import { GoogleGenerativeAI } from "@google/generative-ai";

// Inisialisasi SDK dengan API Key dari .env.local
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function extractReceiptData(receiptText: string) {
  try {
    // Ubah bagian ini
    const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash", // GANTI DARI 2.5-flash KE 1.5-flash
    systemInstruction: "Kamu adalah asisten akuntan pintar...",
    generationConfig: {
        responseMimeType: "application/json",
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