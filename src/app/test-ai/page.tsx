"use client";

import { useState } from "react";
import { Leaf, Sparkles, Send } from "lucide-react";
import { saveTransactionAndUpdateXP } from "@/src/utils/db/transactionService";
import { createClient } from "@/src/utils/supabase/client";

export default function TestAIPage() {
    const [inputText, setInputText] = useState("");
    const [resultJSON, setResultJSON] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleProcessAI = async () => {
        if (!inputText.trim()) return;

        setIsLoading(true);
        setResultJSON(null);

        try {
            // 1. Panggil AI
            const response = await fetch("/api/test-gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ receiptText: inputText }),
            });

            const parsedData = await response.json();

            if (parsedData.error) throw new Error(parsedData.error);

            // 2. Simpan ke Database & Tambah XP!
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.user) throw new Error("Silakan login dulu.");

            const dbResult = await saveTransactionAndUpdateXP(supabase, session.user.id, parsedData);

            // Gabungkan hasil AI dan hasil Database untuk ditampilkan di layar
            setResultJSON({
                ai_extraction: parsedData,
                gamification: dbResult
            });

            if (dbResult.isLevelUp) {
                alert(`🎉 Selamat! Anda naik ke Level ${dbResult.newLevel}!`);
            }

        } catch (error: any) {
            console.error("Terjadi kesalahan:", error);
            alert(error.message || "Gagal memproses struk.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F9F7] p-8 font-sans">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8">

                <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-6">
                    <div className="bg-emerald-100 p-3 rounded-xl">
                        <Sparkles className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-800">Lab Uji Coba AI Firest</h1>
                        <p className="text-sm text-gray-500">Paste teks mentah struk/email ke bawah ini.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Kolom Kiri: Input */}
                    <div className="flex flex-col gap-3">
                        <label className="font-bold text-gray-700 text-sm">Teks Struk Mentah:</label>
                        <textarea
                            className="w-full h-64 p-4 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none resize-none text-sm font-mono"
                            placeholder="Contoh: Pembayaran GoPay berhasil ke Kopi Kenangan sebesar Rp 45.000 pada 15 Mei 2026..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        ></textarea>

                        <button
                            onClick={handleProcessAI}
                            disabled={isLoading || !inputText}
                            className="bg-[#2A6A55] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-800 disabled:opacity-50 transition-all"
                        >
                            {isLoading ? (
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            {isLoading ? "AI Sedang Berpikir..." : "Ekstrak Data"}
                        </button>
                    </div>

                    {/* Kolom Kanan: Output */}
                    <div className="flex flex-col gap-3">
                        <label className="font-bold text-gray-700 text-sm flex items-center gap-2">
                            <Leaf className="w-4 h-4 text-emerald-500" /> Hasil JSON:
                        </label>
                        <div className="w-full h-[316px] p-4 rounded-xl bg-gray-900 text-emerald-400 font-mono text-sm overflow-auto shadow-inner border border-gray-800">
                            {isLoading ? (
                                <p className="text-gray-500 animate-pulse">Menunggu respon Gemini 2.5 Flash...</p>
                            ) : resultJSON ? (
                                <pre>{JSON.stringify(resultJSON, null, 2)}</pre>
                            ) : (
                                <p className="text-gray-600">Belum ada hasil.</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}