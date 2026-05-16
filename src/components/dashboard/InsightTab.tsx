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
          title: "Pola Belanja",
          icon: <TrendingUp className="w-5 h-5 text-orange-600" />,
          bg: "bg-orange-50 dark:bg-orange-950/20",
          border: "border-orange-100 dark:border-orange-900/30",
          content: "Pengeluaran makanan naik 34% dibanding minggu lalu. Sebagian besar dari Grab Food di jam makan siang."
        },
        {
          id: 2,
          title: "Efisiensi",
          icon: <Leaf className="w-5 h-5 text-primary" />,
          bg: "bg-emerald-50 dark:bg-emerald-950/30",
          border: "border-emerald-100 dark:border-emerald-900/30",
          content: "Transportasi sangat hemat minggu ini — kamu sudah aman sampai akhir bulan untuk kategori ini."
        },
        {
          id: 3,
          title: "Peringatan",
          icon: <AlertTriangle className="w-5 h-5 text-pink-600" />,
          bg: "bg-pink-50 dark:bg-pink-950/20",
          border: "border-pink-100 dark:border-pink-900/30",
          content: "Budget belanja sudah terlampaui Rp 30.000. Taman sedikit layu — tahan dulu 10 hari ke depan."
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

  const isCooldown = nextAvailableDate && new Date() < new Date(nextAvailableDate) && !isDemo;
  const daysRemaining = nextAvailableDate ? Math.max(0, differenceInDays(new Date(nextAvailableDate), new Date())) : 0;

  if (isLoadingInitial) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <Sparkles className="w-5 h-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-sm font-bold text-muted-foreground animate-pulse">Menghubungkan ke Gemini AI...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 pb-10">
      
      {/* Header Section */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground leading-tight">Financial AI Insights</h2>
              <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">Powered by Google Gemini</p>
            </div>
          </div>
          
          <p className="text-[13px] text-muted-foreground leading-relaxed mb-6 font-medium">
            Dapatkan analisis personal berdasarkan pola transaksi, budget harian, dan streak kamu.
          </p>

          <button
            onClick={handleGenerateAI}
            disabled={isGenerating || (isCooldown as boolean)}
            className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10 ${
              isCooldown 
                ? 'bg-gray-50 dark:bg-gray-800 text-muted-foreground cursor-not-allowed border border-gray-100 dark:border-gray-700' 
                : 'bg-primary text-white hover:scale-[1.02] active:scale-[0.98]'
            } disabled:opacity-80`}
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            {isGenerating ? "Menganalisis..." : (isCooldown ? `Buka Analisis (${daysRemaining} hari lagi)` : "Generate Analisis Baru")}
          </button>
        </div>
        
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Insights List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Insight Pekan Ini</h3>
          {cachedInsight && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(cachedInsight.created_at), { addSuffix: true, locale: id })}
            </div>
          )}
        </div>

        {displayInsights.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-[32px] p-12 text-center border border-gray-50 dark:border-gray-800 border-dashed">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <p className="text-[14px] font-bold text-foreground mb-1">Belum ada analisis</p>
            <p className="text-[12px] text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
              Klik tombol di atas untuk memulai analisis cerdas pertama kamu.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {displayInsights.map((item) => (
              <div 
                key={item.id} 
                className={`${item.bg} ${item.border} border rounded-[28px] p-5 transition-all hover:scale-[1.01] flex gap-4`}
              >
                <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-[14px] font-black text-foreground mb-1">{item.title}</h4>
                  <p className="text-[12.5px] text-muted-foreground leading-relaxed font-medium">
                    {item.content}
                  </p>
                </div>
                <div className="self-center opacity-20">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Notice */}
      <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 rounded-[28px] p-5 flex gap-4">
         <div className="w-10 h-10 bg-white dark:bg-indigo-900/30 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
            <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
         </div>
         <div className="flex-1">
            <p className="text-[13px] font-black text-indigo-900 dark:text-indigo-200 mb-0.5">Kenapa harus 7 hari?</p>
            <p className="text-[11.5px] text-indigo-800/70 dark:text-indigo-300/60 leading-relaxed font-medium">
               Interval ini dirancang agar kamu punya waktu menerapkan saran AI. Perubahan kebiasaan finansial butuh konsistensi mingguan. 🌿
            </p>
         </div>
      </div>
    </div>
  );
}