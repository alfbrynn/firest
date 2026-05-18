"use client";

import { useMemo, useState, useEffect } from "react";
import { Utensils, Car, ShoppingBag, Gamepad2, Zap, CircleEllipsis, Pencil, Check, X, Sparkles, Wallet, Info, AlertCircle, CheckCircle2 } from "lucide-react";
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

  // 5. Generate Personalized saving tips based on current budget limits and actual spending
  const personalizedTips = useMemo(() => {
    const tips: { type: 'danger' | 'warning' | 'success' | 'info'; title: string; text: string; icon: string }[] = [];

    // Find overspent categories
    const overspentCategories = budgetData
      .filter(item => item.alert)
      .map(item => ({
        cat: item.cat,
        overAmount: (expensesByCategory[item.cat] || 0) - item.limit,
        spent: expensesByCategory[item.cat] || 0,
        limit: item.limit
      }));

    // Find categories close to limit (>= 80% and < 100%)
    const warnedCategories = budgetData
      .filter(item => {
        const spent = expensesByCategory[item.cat] || 0;
        return item.limit > 0 && spent >= item.limit * 0.8 && spent <= item.limit;
      })
      .map(item => ({
        cat: item.cat,
        pct: Math.round(((expensesByCategory[item.cat] || 0) / item.limit) * 100),
        spent: expensesByCategory[item.cat] || 0,
        limit: item.limit
      }));

    // Case 1: Total budget overspent
    if (totalSpent > totalBudget && totalBudget > 0) {
      tips.push({
        type: 'danger',
        title: '⚠️ Total Budget Jebol!',
        text: `Total pengeluaran belanjamu sudah melebihi budget bulanan sebesar Rp ${(totalSpent - totalBudget).toLocaleString('id-ID')}. Untuk menjaga Financial Rainforest-mu tetap lestari, segera batasi pengeluaran non-primer dan alihkan sisa uang ke kebutuhan pokok saja!`,
        icon: 'AlertCircle'
      });
    }

    // Case 2: Overspent specific categories
    overspentCategories.forEach(c => {
      let advice = "";
      if (c.cat === 'Makanan') {
        advice = "Coba batasi jajan di luar/delivery dan beralih ke masak porsi lebih besar di kost untuk menghemat pengeluaran makanan secara signifikan.";
      } else if (c.cat === 'Belanja') {
        advice = "Hapus keranjang e-commerce dan tunda pembelian barang baru. Simpan barang non-esensial ke dalam wishlist untuk dibeli di siklus berikutnya.";
      } else if (c.cat === 'Hiburan') {
        advice = "Ganti nongkrong kafe mahal dengan alternatif gratis seperti olahraga sore, bermain game santai bersama teman, atau movie-night di rumah.";
      } else if (c.cat === 'Transport') {
        advice = "Pertimbangkan opsi menumpang teman, berjalan kaki untuk jarak dekat, atau mencocokkan rute perjalanan demi menghemat bahan bakar.";
      } else if (c.cat === 'Tagihan') {
        advice = "Periksa kembali langganan bulananmu (streaming/aplikasi) yang jarang digunakan dan nonaktifkan sementara untuk memotong biaya bulanan.";
      } else {
        advice = "Tunda pengeluaran pendukung untuk kategori ini dan prioritaskan kas yang tersisa untuk pengeluaran yang mutlak dibutuhkan.";
      }

      tips.push({
        type: 'danger',
        title: `⚠️ Budget ${c.cat} Terlewati!`,
        text: `Pengeluaran ${c.cat}-mu sudah melewati batas alokasi sebesar Rp ${c.overAmount.toLocaleString('id-ID')}. ${advice}`,
        icon: 'AlertCircle'
      });
    });

    // Case 3: Warned categories (80% - 100%)
    warnedCategories.forEach(c => {
      let advice = "";
      if (c.cat === 'Makanan') {
        advice = "Kurangi frekuensi ngopi-ngopi premium di luar dan siapkan bekal sendiri untuk 3 hari ke depan agar budget makan tetap aman hingga akhir bulan.";
      } else if (c.cat === 'Belanja') {
        advice = "Pembelian belanjamu sudah kritis. Sebelum menambah transaksi belanja baru, tanyakan kembali pada dirimu: apakah barang ini butuh sekarang?";
      } else if (c.cat === 'Hiburan') {
        advice = "Batasi aktivitas hiburan berbayar akhir pekan ini. Pilih hiburan gratis atau piknik santai di taman kota tanpa memakan biaya besar.";
      } else if (c.cat === 'Transport') {
        advice = "Cobalah rencanakan perjalananmu secara efisien dalam satu rute searah, atau gunakan opsi transportasi publik jika memungkinkan.";
      } else if (c.cat === 'Tagihan') {
        advice = "Hemat penggunaan listrik dan kuota internet non-esensial dari sekarang agar tagihan berikutnya tidak melonjak melebihi perkiraan.";
      } else {
        advice = "Berhati-hatilah melakukan transaksi tambahan di kategori ini karena budget kamu sudah hampir menyentuh garis batas.";
      }

      tips.push({
        type: 'warning',
        title: `💡 Budget ${c.cat} Kritis (${c.pct}%)`,
        text: `Kategori ${c.cat} telah terpakai sebanyak Rp ${c.spent.toLocaleString('id-ID')} dari Rp ${c.limit.toLocaleString('id-ID')}. ${advice} 🌿`,
        icon: 'Info'
      });
    });

    // Case 4: No critical issues, doing great!
    if (tips.length === 0) {
      const totalPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
      if (totalSpent <= totalBudget * 0.5 && totalBudget > 0) {
        tips.push({
          type: 'success',
          title: '🎉 Hutan Virtual Tumbuh Subur!',
          text: `Luar biasa! Pengeluaranmu baru terpakai ${totalPct}% dari total budget belanja. Hutan di Financial Rainforest-mu sangat rindang. Pertahankan kedisiplinan hebat ini demi mencapai target menabung Rp ${monthlySavingsTarget.toLocaleString('id-ID')} bulan ini!`,
          icon: 'Sparkles'
        });
      } else if (totalBudget > 0) {
        tips.push({
          type: 'success',
          title: '🌟 Alokasi Keuangan Terjaga Aman',
          text: `Kerja bagus! Hutan virtualmu terpelihara dengan baik tanpa kekeringan karena semua kategori pengeluaranmu berada di batas aman (total terpakai ${totalPct}%). Terus pantau sisa budget secara berkala!`,
          icon: 'CheckCircle2'
        });
      } else {
        tips.push({
          type: 'info',
          title: '🌱 Mulai Perjalanan Financial Rainforest-mu',
          text: 'Atur target pemasukan dan tabungan bulananmu di tab Target agar Firest dapat membagi alokasi budget belanja belanjamu secara otomatis secara ideal!',
          icon: 'Sparkles'
        });
      }
    }

    return tips;
  }, [budgetData, expensesByCategory, totalSpent, totalBudget, monthlySavingsTarget]);

  return (
    <div className="flex flex-col text-foreground font-sans relative">
      
      {/* Pay Yourself First Summary Card (Interactive elevate, glowing borders) */}
      <div className="bg-white dark:bg-gray-900 rounded-[28px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-gray-800/80 mb-4 hover:border-primary/20 hover:shadow-[0_8px_24px_rgba(42,106,85,0.04)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-all duration-300">
         <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100/20">
               <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
               <p className="text-[9px] font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest leading-none mb-1.5">Total Budget Belanja</p>
               <h2 className="text-xl sm:text-2xl font-black text-foreground">Rp {totalBudget.toLocaleString('id-ID')}</h2>
            </div>
            <div className="ml-auto text-right">
               <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isAutoBudget ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/20' : 'bg-amber-100 text-amber-700 border border-amber-200/20'}`}>
                  {isAutoBudget ? 'Auto-Divide' : 'Custom'}
               </span>
            </div>
         </div>

         <div className="space-y-2">
            <div className="flex justify-between px-1">
               <span className="text-[9px] font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest">Realisasi Pengeluaran</span>
               <span className={`text-[9px] font-black uppercase tracking-widest ${totalSpent > totalBudget ? 'text-rose-500' : 'text-primary'}`}>
                  Rp {totalSpent.toLocaleString('id-ID')} / {formatRb(totalBudget)}
               </span>
            </div>
            <div className="h-3 bg-slate-100 dark:bg-gray-800/40 rounded-full overflow-hidden border border-gray-100 dark:border-gray-800/80 shadow-inner">
               <div 
                className={`h-full transition-all duration-1000 ${totalSpent > totalBudget ? 'bg-rose-500' : 'bg-primary'}`} 
                style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }} 
               />
            </div>
            <p className={`text-[10px] text-center font-black uppercase tracking-widest mt-2 ${totalSpent > totalBudget ? 'text-rose-500' : 'text-primary'}`}>
               {totalSpent > totalBudget ? '⚠️ Melewati batas budget!' : `Sisa budget Rp ${(totalBudget - totalSpent).toLocaleString('id-ID')} lagi.`}
            </p>
         </div>
      </div>


      {/* Categories Grid (Interactive hover items, enhanced typography contrast) */}
      <div className="bg-white dark:bg-gray-900 rounded-[28px] p-5 sm:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-gray-800/80 mb-4 hover:shadow-[0_8px_24px_rgba(0,0,0,0.03)] transition-shadow duration-300">
        <div className="flex justify-between items-center mb-5 px-1">
          <div>
             <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Alokasi Kategori</h3>
             <p className="text-[10px] text-gray-500 dark:text-gray-300 font-extrabold uppercase tracking-widest mt-1.5">Pembagian otomatis ideal.</p>
          </div>
          {!isAutoBudget && (
            <button 
              onClick={() => setIsAutoBudget(true)}
              className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline cursor-pointer transition-all active:scale-95"
            >
              Reset ke Auto
            </button>
          )}
        </div>

        <div className="space-y-2">
          {budgetData.map((item) => {
            const isEditing = editingCategory === item.cat;

            return (
              <div key={item.cat} className="group p-2.5 sm:p-3 rounded-2xl border border-transparent hover:border-gray-100 dark:hover:border-gray-800/60 hover:bg-slate-50/40 dark:hover:bg-gray-800/20 transition-all duration-300">
                <div className="flex justify-between items-center mb-2.5">
                  <div className="text-xs font-black text-foreground flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-gray-800/60 border border-gray-100/50 dark:border-gray-700/50 flex items-center justify-center text-gray-500 group-hover:text-primary transition-all shrink-0">
                      {item.icon}
                    </div>
                    {item.cat}
                    
                    {!isEditing && !isDemo && (
                      <button 
                        onClick={() => startEditing(item.cat)}
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-primary transition-all p-1 cursor-pointer hover:scale-110"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1">
                        <input
                           type="text"
                           value={editValue}
                           onChange={(e) => setEditValue(e.target.value.replace(/[^0-9]/g, ""))}
                           className="w-16 bg-transparent text-xs font-black text-foreground outline-none text-right"
                           autoFocus
                        />
                        <button onClick={() => saveBudget(item.cat)} className="text-primary cursor-pointer hover:scale-110 transition-transform"><Check className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setEditingCategory(null)} className="text-rose-500 cursor-pointer hover:scale-110 transition-transform"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <div className={`text-xs font-black ${item.alert ? 'text-rose-500' : 'text-foreground'}`}>
                        {item.spentText} <span className="text-gray-500 dark:text-gray-300 font-extrabold uppercase text-[9px] tracking-widest pl-0.5">/ {item.limitText}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="h-2 bg-slate-100 dark:bg-gray-800/40 rounded-full overflow-hidden border border-gray-100/50 dark:border-gray-850 shadow-inner">
                  <div className={`h-full rounded-full ${item.color} transition-all duration-700`} style={{ width: item.pctText }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Personalized Insights Section (High visual interest, high contrast cards) */}
      <div className="space-y-3 mt-1">
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
          <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">Rekomendasi Hemat Personal</h4>
        </div>
        
        <div className="space-y-2">
          {personalizedTips.map((tip, idx) => {
            let cardBg = "bg-amber-50/70 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30";
            let iconBg = "bg-amber-100 dark:bg-amber-900/40";
            let iconColor = "text-amber-700 dark:text-amber-300";
            let textColor = "text-amber-900 dark:text-amber-200";
            let titleColor = "text-amber-900 dark:text-amber-200";
            
            if (tip.type === 'danger') {
              cardBg = "bg-rose-50/70 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30";
              iconBg = "bg-rose-100 dark:bg-rose-900/40";
              iconColor = "text-rose-700 dark:text-rose-300";
              textColor = "text-rose-950 dark:text-rose-250";
              titleColor = "text-rose-900 dark:text-rose-200";
            } else if (tip.type === 'success') {
              cardBg = "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30";
              iconBg = "bg-emerald-100 dark:bg-emerald-900/40";
              iconColor = "text-emerald-700 dark:text-emerald-350";
              textColor = "text-emerald-950 dark:text-emerald-250";
              titleColor = "text-emerald-900 dark:text-emerald-200";
            } else if (tip.type === 'info') {
              cardBg = "bg-indigo-50/70 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30";
              iconBg = "bg-indigo-100 dark:bg-indigo-900/40";
              iconColor = "text-indigo-700 dark:text-indigo-300";
              textColor = "text-indigo-950 dark:text-indigo-250";
              titleColor = "text-indigo-900 dark:text-indigo-200";
            }

            let IconComponent = Info;
            if (tip.icon === 'AlertCircle') IconComponent = AlertCircle;
            else if (tip.icon === 'Sparkles') IconComponent = Sparkles;
            else if (tip.icon === 'CheckCircle2') IconComponent = CheckCircle2;

            return (
              <div key={idx} className={`border rounded-[22px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.01)] flex gap-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.03)] ${cardBg}`}>
                 <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-black/5 dark:border-white/5 ${iconBg}`}>
                    <IconComponent className={`w-4.5 h-4.5 ${iconColor}`} />
                 </div>
                 <div>
                    <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${titleColor}`}>{tip.title}</p>
                    <p className={`text-[12px] leading-relaxed font-semibold ${textColor}`}>
                       {tip.text}
                    </p>
                 </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}