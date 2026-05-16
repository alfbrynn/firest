"use client";

import { useMemo, useState, useEffect } from "react";
import { Utensils, Car, ShoppingBag, Gamepad2, Zap, CircleEllipsis, Pencil, Check, X, Sparkles, Wallet, Info } from "lucide-react";
import { useAppStore } from "@/src/store/useAppStore";

// Fungsi bantuan untuk mengubah angka menjadi format "rb" (contoh: 680000 -> 680rb)
const formatRb = (num: number) => {
  if (num === 0) return "0";
  if (num >= 1000) {
    const val = num / 1000;
    return `${val % 1 === 0 ? val : val.toFixed(1)}rb`;
  }
  return `${num}`;
};

export default function BudgetTab() {
  const { forestHealth, transactions, isDemo, monthlyIncomeTarget, monthlySavingsTarget } = useAppStore();

  // 2. State Batas Budget Bulanan (Derived from Pay Yourself First if not manually edited)
  const [budgetLimits, setBudgetLimits] = useState<Record<string, number>>({
    'Makanan': 0, 'Transport': 0, 'Belanja': 0, 'Hiburan': 0, 'Tagihan': 0, 'Lainnya': 0
  });

  const [isAutoBudget, setIsAutoBudget] = useState(true);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showAiSuggestion, setShowAiSuggestion] = useState(true);

  // 3. Kalkulasi Otomatis Berdasarkan Pemasukan - Tabungan
  const totalBudget = Math.max(0, monthlyIncomeTarget - monthlySavingsTarget);

  useEffect(() => {
    if (isAutoBudget && totalBudget > 0) {
      setBudgetLimits({
        'Makanan': Math.round(totalBudget * 0.4),
        'Transport': Math.round(totalBudget * 0.15),
        'Belanja': Math.round(totalBudget * 0.15),
        'Hiburan': Math.round(totalBudget * 0.1),
        'Tagihan': Math.round(totalBudget * 0.15),
        'Lainnya': Math.round(totalBudget * 0.05)
      });
    }
  }, [totalBudget, isAutoBudget]);

  // 4. Hitung otomatis total pengeluaran per kategori
  const expensesByCategory = useMemo(() => {
    const expenses: Record<string, number> = {
      'Makanan': 0, 'Transport': 0, 'Belanja': 0, 'Hiburan': 0, 'Tagihan': 0, 'Lainnya': 0
    };
    transactions.forEach(tx => {
      if (tx.type === 'expense' && expenses[tx.category] !== undefined) {
        expenses[tx.category] += tx.amount;
      }
    });
    return expenses;
  }, [transactions]);

  const startEditing = (category: string) => {
    if (isDemo) return;
    setIsAutoBudget(false); // Switch to manual mode if user edits
    setEditingCategory(category);
    setEditValue(budgetLimits[category].toString());
  };

  const saveBudget = (category: string) => {
    const parsed = parseInt(editValue.replace(/[^0-9]/g, ""));
    if (!isNaN(parsed) && parsed >= 0) {
      setBudgetLimits(prev => ({ ...prev, [category]: parsed }));
    }
    setEditingCategory(null);
  };

  const budgetData = [
    { cat: 'Makanan', icon: <Utensils className="w-4 h-4" />, limit: budgetLimits['Makanan'] },
    { cat: 'Transport', icon: <Car className="w-4 h-4" />, limit: budgetLimits['Transport'] },
    { cat: 'Belanja', icon: <ShoppingBag className="w-4 h-4" />, limit: budgetLimits['Belanja'] },
    { cat: 'Hiburan', icon: <Gamepad2 className="w-4 h-4" />, limit: budgetLimits['Hiburan'] },
    { cat: 'Tagihan', icon: <Zap className="w-4 h-4" />, limit: budgetLimits['Tagihan'] },
    { cat: 'Lainnya', icon: <CircleEllipsis className="w-4 h-4" />, limit: budgetLimits['Lainnya'] },
  ].map(item => {
    const spent = expensesByCategory[item.cat] || 0;
    const rawPct = item.limit > 0 ? (spent / item.limit) * 100 : 0;
    const pct = Math.min(rawPct, 100);
    const isOver = spent > item.limit;

    let color = 'bg-emerald-500';
    if (rawPct >= 100) color = 'bg-rose-500';
    else if (rawPct > 75) color = 'bg-amber-500';

    return {
      ...item,
      spentText: formatRb(spent),
      limitText: formatRb(item.limit),
      pctText: `${pct}%`,
      color,
      alert: isOver
    };
  });

  const totalSpent = Object.values(expensesByCategory).reduce((a, b) => a + b, 0);
  const totalLimit = Object.values(budgetLimits).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col text-foreground font-sans">
      
      {/* Pay Yourself First Summary Card */}
      <div className="bg-white dark:bg-gray-900 rounded-[28px] p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-4">
         <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center shrink-0">
               <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1.5">Total Budget Belanja</p>
               <h2 className="text-2xl font-black text-foreground">Rp {totalBudget.toLocaleString('id-ID')}</h2>
            </div>
            <div className="ml-auto text-right">
               <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${isAutoBudget ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-700'}`}>
                  {isAutoBudget ? 'Auto-Divide' : 'Custom'}
               </span>
            </div>
         </div>

         <div className="space-y-3">
            <div className="flex justify-between px-1">
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Realisasi Pengeluaran</span>
               <span className={`text-[10px] font-black uppercase tracking-widest ${totalSpent > totalBudget ? 'text-rose-500' : 'text-primary'}`}>
                  Rp {totalSpent.toLocaleString('id-ID')} / {formatRb(totalBudget)}
               </span>
            </div>
            <div className="h-3 bg-gray-50 dark:bg-gray-800/50 rounded-full overflow-hidden border border-gray-100 dark:border-gray-800 shadow-inner">
               <div 
                className={`h-full transition-all duration-1000 ${totalSpent > totalBudget ? 'bg-rose-500' : 'bg-primary'}`} 
                style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }} 
               />
            </div>
            <p className="text-[10px] text-muted-foreground text-center font-bold uppercase tracking-widest">
               {totalSpent > totalBudget ? '⚠️ Melewati batas budget!' : `Sisa budget Rp ${(totalBudget - totalSpent).toLocaleString('id-ID')} lagi.`}
            </p>
         </div>
      </div>


      {/* Categories Grid */}
      <div className="bg-white dark:bg-gray-900 rounded-[28px] p-8 shadow-sm border border-gray-50 dark:border-gray-800 mb-6">
        <div className="flex justify-between items-center mb-8">
          <div>
             <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Alokasi Kategori</h3>
             <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Pembagian otomatis ideal.</p>
          </div>
          {!isAutoBudget && (
            <button 
            onClick={() => setIsAutoBudget(true)}
            className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
           >
             Reset ke Auto
           </button>
          )}
        </div>

        <div className="space-y-6">
          {budgetData.map((item) => {
            const isEditing = editingCategory === item.cat;

            return (
              <div key={item.cat} className="group">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-[14px] font-bold text-foreground flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                      {item.icon}
                    </div>
                    {item.cat}
                    
                    {!isEditing && !isDemo && (
                      <button 
                        onClick={() => startEditing(item.cat)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-all p-1"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value.replace(/[^0-9]/g, ""))}
                          className="w-16 bg-transparent text-xs font-bold text-foreground outline-none text-right"
                          autoFocus
                        />
                        <button onClick={() => saveBudget(item.cat)} className="text-primary"><Check className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setEditingCategory(null)} className="text-rose-500"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <div className={`text-[13px] font-black ${item.alert ? 'text-rose-500' : 'text-foreground'}`}>
                        {item.spentText} <span className="text-muted-foreground font-medium uppercase text-[10px] tracking-tighter">/ {item.limitText}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="h-2 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-100 dark:border-gray-800">
                  <div className={`h-full rounded-full ${item.color} transition-all duration-700`} style={{ width: item.pctText }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contextual Insight Banner */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-[24px] p-6 shadow-sm flex gap-4">
         <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800/40 rounded-xl flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-amber-600 dark:text-amber-400" />
         </div>
         <div>
            <p className="text-[10px] font-bold text-amber-900 dark:text-amber-200 uppercase tracking-widest mb-1">Tips Hemat Minggu Ini</p>
            <p className="text-[12px] text-amber-800/80 dark:text-amber-300/70 leading-relaxed font-medium">
               Budget "Makanan" kamu sudah terpakai 85%. Cobalah masak sendiri di kost untuk 3 hari ke depan agar budget tetap aman sampai akhir bulan! 🌿
            </p>
         </div>
      </div>
    </div>
  );
}