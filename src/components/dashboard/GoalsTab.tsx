"use client";

import { useState, useEffect } from "react";
import { Target, Wallet, TrendingUp, Landmark, ArrowRight, Save, Coins } from "lucide-react";
import { useAppStore } from "@/src/store/useAppStore";
import { createClient } from "@/src/utils/supabase/client";

export default function SavingsTab() {
  const { monthlyIncomeTarget, monthlySavingsTarget, updateMonthlyTargets, isDemo, transactions } = useAppStore();
  
  const [income, setIncome] = useState("");
  const [savings, setSavings] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setUserId(session.user.id);
    };
    fetchUser();
    
    // Sync local state with store
    setIncome(monthlyIncomeTarget.toString());
    setSavings(monthlySavingsTarget.toString());
  }, [monthlyIncomeTarget, monthlySavingsTarget]);

  const handleSaveTargets = async () => {
    if (!userId || isDemo) return;
    setIsSaving(true);
    const incomeVal = parseInt(income.replace(/[^0-9]/g, "")) || 0;
    const savingsVal = parseInt(savings.replace(/[^0-9]/g, "")) || 0;
    
    await updateMonthlyTargets(userId, incomeVal, savingsVal);
    setIsSaving(false);
  };

  const formatCurrency = (val: string) => {
    const num = parseInt(val.replace(/[^0-9]/g, ""));
    return isNaN(num) ? "" : num.toLocaleString('id-ID');
  };

  const remainder = Math.max(0, parseInt(income.replace(/[^0-9]/g, "") || "0") - parseInt(savings.replace(/[^0-9]/g, "") || "0"));
  const savingsRate = parseInt(income) > 0 ? (parseInt(savings) / parseInt(income) * 100).toFixed(0) : "0";

  // Calculate actual savings so far (income transactions - total expenses is not correct, user wants "set at start")
  // For this logic, we just show the progress towards the "set target".
  const totalIncomeReal = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="flex flex-col text-foreground font-sans">
      
      {/* Pay Yourself First Header */}
      <div className="bg-primary p-6 rounded-[24px] mb-6 shadow-lg relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>
        <div className="relative z-10">
          <h2 className="text-white text-xl font-black mb-1 flex items-center gap-2">
            <Coins className="w-6 h-6 text-emerald-300" />
            Tabungan Bulan Ini
          </h2>
          <p className="text-emerald-100/80 text-xs font-medium mb-6">Prinsip: Tabung dulu di awal, sisa baru dibelanjakan.</p>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-emerald-800/30 backdrop-blur-md p-4 rounded-2xl border border-emerald-700/30">
                <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest mb-1">Target Tabungan</p>
                <p className="text-lg font-black text-white">Rp {monthlySavingsTarget.toLocaleString('id-ID')}</p>
             </div>
             <div className="bg-emerald-800/30 backdrop-blur-md p-4 rounded-2xl border border-emerald-700/30">
                <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest mb-1">Ratio Tabungan</p>
                <p className="text-lg font-black text-white">{monthlyIncomeTarget > 0 ? Math.round((monthlySavingsTarget / monthlyIncomeTarget) * 100) : 0}%</p>
             </div>
          </div>
        </div>
      </div>

      {/* Target Setting Form */}
      <div className="bg-white dark:bg-gray-900 rounded-[28px] p-8 shadow-sm border border-gray-50 dark:border-gray-800 mb-6 relative">
        {isDemo && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-[1px] z-20 rounded-[28px] flex items-center justify-center">
             <span className="bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg uppercase tracking-tighter">
                Mode Demo: Target Terkunci
             </span>
          </div>
        )}

        <h3 className="text-sm font-black text-foreground mb-6 uppercase tracking-widest flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Set Perencanaan Bulan Ini
        </h3>

        <div className="space-y-6">
          <div className="relative">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-2 block">Estimasi Pemasukan</label>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 focus-within:border-primary/50 transition-all">
              <span className="text-lg font-bold text-muted-foreground">Rp</span>
              <input 
                type="text" 
                placeholder="0"
                value={income === "0" ? "" : formatCurrency(income)}
                onChange={(e) => setIncome(e.target.value.replace(/[^0-9]/g, ""))}
                className="w-full bg-transparent text-xl font-black text-foreground outline-none placeholder-gray-300"
              />
            </div>
          </div>

          <div className="relative">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-2 block">Target Tabungan (Ambil di awal!)</label>
            <div className="flex items-center gap-3 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/20 focus-within:border-primary/50 transition-all">
              <span className="text-lg font-bold text-primary">Rp</span>
              <input 
                type="text" 
                placeholder="0"
                value={savings === "0" ? "" : formatCurrency(savings)}
                onChange={(e) => setSavings(e.target.value.replace(/[^0-9]/g, ""))}
                className="w-full bg-transparent text-xl font-black text-primary outline-none placeholder-emerald-200"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 ml-1 italic">
              *Uang ini akan langsung dipisahkan dari budget belanja kamu.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sisa untuk Budget Belanja</p>
              <p className="text-xl font-black text-foreground">Rp {remainder.toLocaleString('id-ID')}</p>
            </div>
            <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
          </div>

          <button 
            onClick={handleSaveTargets}
            disabled={isSaving || isDemo}
            className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Save className="w-5 h-5" /> Simpan Perencanaan</>
            )}
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-[24px] border border-gray-100 dark:border-gray-800">
           <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Landmark className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-[13px] font-bold">Kenapa Tabung di Awal?</p>
           </div>
           <p className="text-[11.5px] text-muted-foreground leading-relaxed">
             "Jangan menabung sisa dari belanja, tapi belanjakan sisa dari menabung." - Warren Buffett. Ini kunci agar mahasiswa tidak pernah kehabisan uang di akhir bulan.
           </p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-[24px] border border-gray-100 dark:border-gray-800">
           <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-orange-50 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-[13px] font-bold">Realisasi Income</p>
           </div>
           <p className="text-[11.5px] text-muted-foreground leading-relaxed">
             Total uang masuk asli kamu bulan ini: <strong className="text-primary font-bold">Rp {totalIncomeReal.toLocaleString('id-ID')}</strong>. 
             {totalIncomeReal < parseInt(income) ? " Ayo terus cari tambahan pemasukan!" : " Target income tercapai!"}
           </p>
        </div>
      </div>
    </div>
  );
}