"use client";

import { useState } from "react";
import { TrendingUp, Leaf, AlertTriangle, Clock, Calendar, Sparkles, Loader2, BarChart3 } from "lucide-react";
import { useAppStore } from "@/src/store/useAppStore";

export default function InsightTab() {
  const { isDemo, transactions } = useAppStore();
  // State untuk simulasi loading Gemini AI
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedReal, setHasGeneratedReal] = useState(false);

  // Data disiapkan dalam bentuk Array agar nanti mudah diganti dengan respons JSON dari Gemini API
  const weeklyInsights = isDemo ? [
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
  ] : (hasGeneratedReal && transactions.length > 0 ? [
    {
      id: 1,
      icon: <Leaf className="w-5 h-5 text-primary" />,
      bg: "bg-[#e8f4ec] dark:bg-emerald-950/30",
      content: <><strong className="font-bold text-foreground">Keuanganmu sehat!</strong> Belum ada pengeluaran berlebih terdeteksi dari transaksi barumu.</>
    }
  ] : []);

  const patternInsights = isDemo ? [
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
  ] : (hasGeneratedReal && transactions.length > 0 ? [
    {
      id: 1,
      icon: <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      bg: "bg-indigo-50 dark:bg-indigo-950/20",
      content: <>AI mendeteksi pola keuanganmu masih stabil. Tambahkan pengeluaran rutin agar AI dapat menyusun peta pola belanja malam hari.</>
    }
  ] : []);

  // Fungsi simulasi memanggil AI
  const handleGenerateAI = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setHasGeneratedReal(true);
    }, 2000);
  };

  return (
    <div className="flex flex-col space-y-5 text-foreground font-sans">

      {/* Archive Header & Notice */}
      <div className="bg-slate-50 dark:bg-gray-800/40 p-5 rounded-[24px] border border-gray-100 dark:border-gray-800 border-dashed mb-1">
         <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
            <div>
               <p className="text-sm font-bold text-foreground">Arsip Analisis AI</p>
               <p className="text-[11px] text-muted-foreground font-medium">Insight terbaru kini muncul otomatis saat kamu mencatat transaksi.</p>
            </div>
         </div>
      </div>

      {/* Tombol Trigger Gemini AI */}
      <button
        onClick={handleGenerateAI}
        disabled={isGenerating}
        className="w-full bg-white dark:bg-gray-900 text-primary border-2 border-primary/20 py-3.5 rounded-[20px] font-bold hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
      >
        {isGenerating ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Sparkles className="w-5 h-5" />
        )}
        {isGenerating ? "Menganalisis..." : "Generate Analisis Mendalam (Bulanan)"}
      </button>

      <div className="bg-white dark:bg-gray-900 rounded-[24px] p-6 shadow-sm border border-gray-50 dark:border-gray-800">
        <div className="text-[11px] font-bold text-muted-foreground mb-5 uppercase tracking-widest">Riwayat Insight Pekan Ini</div>

        {weeklyInsights.length === 0 ? (
          <div className="text-center py-6">
            <BarChart3 className="w-8 h-8 mx-auto text-muted-foreground opacity-40 mb-2" />
            <p className="text-[12.5px] font-semibold text-muted-foreground">Belum ada analisis pekan ini</p>
            <p className="text-[11px] text-muted-foreground/80 mt-1 max-w-xs mx-auto">Klik tombol di atas untuk menganalisis pengeluaran terbarumu menggunakan Google Gemini AI!</p>
          </div>
        ) : (
          weeklyInsights.map((item, index) => (
            <div key={item.id} className={`flex items-start gap-4 py-4 ${index !== weeklyInsights.length - 1 ? 'border-b border-gray-50 dark:border-gray-800' : 'pb-0'} first:pt-0`}>
              <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                {item.icon}
              </div>
              <div className="text-[13.5px] font-medium text-muted-foreground leading-[1.6] flex-1 pt-0.5">
                {item.content}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[24px] p-6 shadow-sm border border-gray-50 dark:border-gray-800">
        <div className="text-[11px] font-bold text-muted-foreground mb-5 uppercase tracking-widest">Pola Pengeluaran</div>

        {patternInsights.length === 0 ? (
          <div className="text-center py-6">
            <Sparkles className="w-8 h-8 mx-auto text-muted-foreground opacity-40 mb-2 animate-pulse" />
            <p className="text-[12.5px] font-semibold text-muted-foreground">Pola belanja belum terbentuk</p>
            <p className="text-[11px] text-muted-foreground/80 mt-1 max-w-xs mx-auto">Gemini AI mendeteksi sisa budget-mu masih tinggi. Tambahkan pengeluaran harianmu terlebih dahulu.</p>
          </div>
        ) : (
          patternInsights.map((item, index) => (
            <div key={item.id} className={`flex items-start gap-4 py-4 ${index !== patternInsights.length - 1 ? 'border-b border-gray-50 dark:border-gray-800' : 'pb-0'} first:pt-0`}>
              <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                {item.icon}
              </div>
              <div className="text-[13.5px] font-medium text-muted-foreground leading-[1.6] flex-1 pt-0.5">
                {item.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}