"use client";

import { useState, useEffect, useMemo } from "react";
import { TrendingUp, Leaf, AlertTriangle, Clock, Sparkles, Loader2, BarChart3, Info, ChevronRight, Target } from "lucide-react";
import { useAppStore } from "@/src/store/useAppStore";
import { generateInsightAction, getInsightsAction } from "@/src/app/actions/insightActions";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { id } from "date-fns/locale";

export default function InsightTab() {
  const {
    isDemo,
    transactions,
    monthlyIncomeTarget,
    monthlySavingsTarget,
    currentStreak
  } = useAppStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [cachedInsight, setCachedInsight] = useState<any>(null);
  const [nextAvailableDate, setNextAvailableDate] = useState<string | null>(null);

  useEffect(() => {
    if (isDemo) {
      setIsLoadingInitial(false);
      return;
    }

    async function loadInsight() {
      try {
        const last = await getInsightsAction();
        if (last) {
          setCachedInsight(last);
          const nextDate = new Date(new Date(last.created_at).getTime() + 7 * 24 * 60 * 60 * 1000);
          setNextAvailableDate(nextDate.toISOString());
        }
      } catch (err) {
        console.error("Failed to load insight:", err);
      } finally {
        setIsLoadingInitial(false);
      }
    }
    loadInsight();
  }, [isDemo]);

  const totalBudget = Math.max(0, monthlyIncomeTarget - monthlySavingsTarget);
  const budgetCategories = {
    'Makanan': Math.round(totalBudget * 0.4),
    'Transport': Math.round(totalBudget * 0.15),
    'Belanja': Math.round(totalBudget * 0.15),
    'Hiburan': Math.round(totalBudget * 0.1),
    'Tagihan': Math.round(totalBudget * 0.15),
    'Lainnya': Math.round(totalBudget * 0.05)
  };

  const handleGenerateAI = async () => {
    if (isDemo) {
      setIsGenerating(true);
      setTimeout(() => setIsGenerating(false), 2000);
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateInsightAction({
        transactions: transactions.slice(0, 20),
        income: monthlyIncomeTarget,
        budgetCategories,
        streakDays: currentStreak
      });

      if (result.insight) {
        setCachedInsight(result.insight);
        setNextAvailableDate(result.nextAvailableDate);
      }
    } catch (err) {
      console.error("Error generating insight:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const displayInsights = useMemo(() => {
    if (isDemo) {
      return [
        {
          id: 1,
          title: "Evaluasi Belanja",
          icon: <TrendingUp className="w-5 h-5 text-orange-600" />,
          bg: "bg-orange-50 dark:bg-orange-950/20",
          border: "border-orange-100 dark:border-orange-900/30",
          content: "Kategori Belanja kamu sudah over budget Rp 30.000. Pengeluaran Shopee kemarin jadi penyebab utamanya. Tahan diri dulu ya!"
        },
        {
          id: 2,
          title: "Efisiensi Pangan",
          icon: <Leaf className="w-5 h-5 text-primary" />,
          bg: "bg-emerald-50 dark:bg-emerald-950/30",
          border: "border-emerald-100 dark:border-emerald-900/30",
          content: "Budget Makanan sisa Rp 20.000 lagi. Hindari Grab Food minggu ini dan coba masak sendiri agar tanaman tetap sehat."
        },
        {
          id: 3,
          title: "Konsistensi",
          icon: <Sparkles className="w-5 h-5 text-blue-600" />,
          bg: "bg-blue-50 dark:bg-blue-950/20",
          border: "border-blue-100 dark:border-blue-900/30",
          content: "Keren! 7 hari streak kamu menjaga 18% tabungan tetap aman. Pertahankan performa ini untuk membuka pohon baru."
        }
      ];
    }

    if (!cachedInsight || !cachedInsight.content) return [];

    const configs = [
      { title: "Pola Belanja", icon: <TrendingUp className="w-5 h-5 text-orange-500" />, bg: "bg-orange-50 dark:bg-orange-950/20", border: "border-orange-100 dark:border-orange-900/30" },
      { title: "Kesehatan Finansial", icon: <Leaf className="w-5 h-5 text-emerald-500" />, bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-100 dark:border-emerald-900/30" },
      { title: "Rekomendasi", icon: <Target className="w-5 h-5 text-blue-500" />, bg: "bg-blue-50 dark:bg-blue-950/20", border: "border-blue-100 dark:border-blue-900/30" }
    ];

    return (cachedInsight.content as string[]).map((text, i) => ({
      id: i,
      ...configs[i % configs.length],
      content: text
    }));
  }, [isDemo, cachedInsight]);

  const isCooldown = false; // Temporarily disabled cooldown for testing
  const daysRemaining = nextAvailableDate ? Math.max(0, differenceInDays(new Date(nextAvailableDate), new Date())) : 0;

  if (isLoadingInitial) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <Sparkles className="w-5 h-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-sm font-black text-gray-700 dark:text-gray-300 animate-pulse">Menghubungkan ke Groq AI...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 pb-10">

      {/* Header Section (Stunning Glassmorphic AI Box with Hover Uplift) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-emerald-50/25 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-950/20 rounded-[28px] p-5.5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-gray-800/80 hover:border-primary/25 hover:shadow-[0_8px_24px_rgba(42,106,85,0.04)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-all duration-300">
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-3.5">
            <div className="w-9.5 h-9.5 bg-primary/10 rounded-xl flex items-center justify-center border border-emerald-500/10">
              <Sparkles className="w-4.5 h-4.5 text-primary animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-black text-foreground leading-none">Analisis Keuangan oleh AI</h2>
            </div>
          </div>

          <p className="text-[12.5px] text-gray-700 dark:text-gray-250 leading-relaxed mb-4.5 font-semibold">
            Dapatkan analisis personal berdasarkan pola transaksi, budget harian, dan streak kamu.
          </p>

          <button
            onClick={handleGenerateAI}
            disabled={isGenerating || (isCooldown as boolean)}
            className={`w-full py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(16,185,129,0.1)] cursor-pointer ${isCooldown
              ? 'bg-slate-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed border border-gray-100 dark:border-gray-700/60 shadow-none'
              : 'bg-primary text-white hover:scale-[1.01] active:scale-[0.98] hover:bg-emerald-700'
              } disabled:opacity-80`}
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isGenerating ? "Menganalisis..." : (isCooldown ? `Buka Analisis (${daysRemaining} hari lagi)` : "Generate Analisis Baru")}
          </button>
        </div>

        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-40 h-40 bg-primary/5 rounded-full blur-3xl select-none pointer-events-none"></div>
      </div>

      {/* Main Insights List */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-[10px] font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest">Insight Pekan Ini</h3>
          {cachedInsight && (
            <div className="flex items-center gap-1.5 text-[9px] font-black text-primary bg-primary/5 dark:bg-primary/10 px-2.5 py-1 rounded-full border border-primary/15">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(cachedInsight.created_at), { addSuffix: true, locale: id })}
            </div>
          )}
        </div>

        {displayInsights.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-[28px] p-10 text-center border border-gray-100 dark:border-gray-800 border-dashed">
            <div className="w-12 h-12 bg-slate-50 dark:bg-gray-850 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-100 dark:border-gray-800">
              <BarChart3 className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-xs font-black text-foreground mb-1">Belum ada analisis</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-300 max-w-[200px] mx-auto leading-relaxed font-bold mt-1.5">
              Klik tombol di atas untuk memulai analisis cerdas pertama kamu.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {displayInsights.map((item) => (
              <div
                key={item.id}
                className={`${item.bg} ${item.border} border rounded-[22px] p-4.5 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.02)] flex gap-3.5`}
              >
                <div className="w-9 h-9 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-black/5 dark:border-white/5 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-black text-foreground mb-1 leading-none">{item.title}</h4>
                  <p className="text-[12px] text-gray-950 dark:text-gray-200 leading-relaxed font-semibold">
                    {item.content}
                  </p>
                </div>
                <div className="self-center opacity-25 shrink-0 pl-1">
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Notice (High Contrast Indigo Alert Card) */}
      <div className="bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-900/30 rounded-[24px] p-5 flex gap-3.5 hover:shadow-[0_4px_16px_rgba(99,102,241,0.03)] transition-shadow duration-300">
        <div className="w-8.5 h-8.5 bg-white dark:bg-indigo-900/40 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-indigo-100/20">
          <Info className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-black text-indigo-900 dark:text-indigo-250 uppercase tracking-widest mb-1.5 leading-none">Kenapa harus 7 hari?</p>
          <p className="text-[12px] text-indigo-950 dark:text-indigo-200 leading-relaxed font-semibold">
            Interval ini dirancang agar kamu punya waktu menerapkan saran AI. Perubahan kebiasaan finansial butuh konsistensi mingguan. 🌿
          </p>
        </div>
      </div>
    </div>
  );
}