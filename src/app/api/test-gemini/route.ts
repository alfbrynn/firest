import { NextResponse } from "next/server";
import { extractReceiptData } from "@/src/utils/ai/gemini";

export async function POST(request: Request) {
  try {
    // Tangkap teks struk yang dikirim dari halaman tes
    const body = await request.json();
    const { receiptText } = body;

    if (!receiptText) {
      return NextResponse.json({ error: "Teks struk tidak boleh kosong" }, { status: 400 });
    }

    // Serahkan ke AI
    const extractedData = await extractReceiptData(receiptText);

    // Kembalikan hasilnya ke browser
    return NextResponse.json(extractedData);

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Gagal memproses data dengan AI" }, { status: 500 });
  }
}