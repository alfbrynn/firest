"use client";

import { useState } from "react";
import { TrendingUp, Leaf, AlertTriangle, Clock, Calendar, Sparkles, Loader2 } from "lucide-react";

export default function InsightTab() {
  // State untuk simulasi loading Gemini AI
  const [isGenerating, setIsGenerating] = useState(false);

  // Data disiapkan dalam bentuk Array agar nanti mudah diganti dengan respons JSON dari Gemini API
  const weeklyInsights = [
    {
      id: 1,
      icon: <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
      bg: "bg-orange-50 dark:bg-orange-950/20",
      content: <><strong className="font-bold text-foreground">Pengeluaran makanan naik 34%</strong> dibanding minggu lalu. Sebagian besar dari Grab Food di jam makan siang.</>
    },
    {
      id: 2,
      icon: <Leaf className="w-5 h-5 text-primary" />,
      bg: "bg-[#e8f4ec] dark:bg-emerald-950/30",
      content: <><strong className="font-bold text-foreground">Transportasi sangat hemat</strong> minggu ini — kamu sudah aman sampai akhir bulan untuk kategori ini.</>
    },
    {
      id: 3,
      icon: <AlertTriangle className="w-5 h-5 text-pink-600 dark:text-pink-400" />,
      bg: "bg-pink-50 dark:bg-pink-950/20",
      content: <>Budget <strong className="font-bold text-foreground">belanja sudah terlampaui</strong> Rp 30.000. Taman sedikit layu — tahan dulu 10 hari.</>
    }
  ];

  const patternInsights = [
    {
      id: 1,
      icon: <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      bg: "bg-indigo-50 dark:bg-indigo-950/20",
      content: <>Kamu paling sering belanja di <strong className="font-bold text-foreground">Shopee antara pukul 20–23</strong>. Coba pause notifikasi promo di jam itu.</>
    },
    {
      id: 2,
      icon: <Calendar className="w-5 h-5 text-primary" />,
      bg: "bg-[#e8f4ec] dark:bg-emerald-950/30",
      content: <>3 bulan terakhir, pengeluaran selalu lebih rendah di <strong className="font-bold text-foreground">minggu ke-3</strong>. Jadikan referensi untuk nabung lebih.</>
    }
  ];

  // Fungsi simulasi memanggil AI
  const handleGenerateAI = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      // Di tahap selanjutnya, di sini kita akan me-replace data array dengan hasil dari Gemini AI
    }, 2000);
  };

  return (
    <div className="flex flex-col space-y-5 text-foreground font-sans">

      {/* Tombol Trigger Gemini AI */}
      <button
        onClick={handleGenerateAI}
        disabled={isGenerating}
        className="w-full bg-gradient-to-r from-primary to-gradient-end text-white py-3.5 rounded-[20px] font-medium hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
      >
        {isGenerating ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Sparkles className="w-5 h-5 text-yellow-300" />
        )}
        {isGenerating ? "Menganalisis transaksi..." : "Dapatkan Insight AI Terbaru"}
      </button>

      <div className="bg-white dark:bg-gray-900 rounded-[24px] p-6 shadow-sm border border-gray-50 dark:border-gray-800">
        <div className="text-[11px] font-bold text-muted-foreground mb-5 uppercase tracking-widest">Pekan Ini</div>

        {weeklyInsights.map((item, index) => (
          <div key={item.id} className={`flex items-start gap-4 py-4 ${index !== weeklyInsights.length - 1 ? 'border-b border-gray-50 dark:border-gray-800' : 'pb-0'} first:pt-0`}>
            <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
              {item.icon}
            </div>
            <div className="text-[13.5px] font-medium text-muted-foreground leading-[1.6] flex-1 pt-0.5">
              {item.content}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[24px] p-6 shadow-sm border border-gray-50 dark:border-gray-800">
        <div className="text-[11px] font-bold text-muted-foreground mb-5 uppercase tracking-widest">Pola Pengeluaran</div>

        {patternInsights.map((item, index) => (
          <div key={item.id} className={`flex items-start gap-4 py-4 ${index !== patternInsights.length - 1 ? 'border-b border-gray-50 dark:border-gray-800' : 'pb-0'} first:pt-0`}>
            <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
              {item.icon}
            </div>
            <div className="text-[13.5px] font-medium text-muted-foreground leading-[1.6] flex-1 pt-0.5">
              {item.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}