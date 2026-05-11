import { useMemo, useState } from "react";
import { Utensils, Car, ShoppingBag, Gamepad2, Zap, CircleEllipsis, Pencil, Check, X, Sparkles } from "lucide-react";
import { useAppStore } from "@/src/store/useAppStore";

// Fungsi bantuan untuk mengubah angka menjadi format "rb" (contoh: 680000 -> 680rb)
const formatRb = (num: number) => {
  if (num === 0) return "0";
  if (num >= 1000) {
    // Bulatkan agar rapi tanpa desimal jika bulat, atau dengan desimal jika pecahan
    const val = num / 1000;
    return `${val % 1 === 0 ? val : val.toFixed(1)}rb`;
  }
  return `${num}`;
};

export default function BudgetTab() {
  // 1. Ambil data dari Otak Zustand
  const { forestHealth, transactions, isDemo } = useAppStore();

  // 2. State Batas Budget Bulanan Dinamis
  const [budgetLimits, setBudgetLimits] = useState<Record<string, number>>({
    'Makanan': 800000,
    'Transport': 300000,
    'Belanja': 400000,
    'Hiburan': 200000,
    'Tagihan': 350000,
    'Lainnya': 200000
  });

  // State untuk mode edit budget
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // State untuk saran AI
  const [showAiSuggestion, setShowAiSuggestion] = useState(true);

  // 3. Hitung otomatis total pengeluaran per kategori dari riwayat transaksi
  const expensesByCategory = useMemo(() => {
    const expenses: Record<string, number> = {
      'Makanan': 0, 'Transport': 0, 'Belanja': 0, 'Hiburan': 0, 'Tagihan': 0, 'Lainnya': 0
    };

    transactions.forEach(tx => {
      // Hanya hitung tipe 'expense' (pengeluaran)
      if (tx.type === 'expense' && expenses[tx.category] !== undefined) {
        expenses[tx.category] += tx.amount;
      }
    });

    return expenses;
  }, [transactions]);

  // 4. Mulai edit kategori
  const startEditing = (category: string) => {
    if (isDemo) return;
    setEditingCategory(category);
    setEditValue(budgetLimits[category].toString());
  };

  // 5. Simpan hasil edit
  const saveBudget = (category: string) => {
    const parsed = parseInt(editValue.replace(/[^0-9]/g, ""));
    if (!isNaN(parsed) && parsed >= 0) {
      setBudgetLimits(prev => ({
        ...prev,
        [category]: parsed
      }));
    }
    setEditingCategory(null);
  };

  // 6. Terapkan saran otomatis dari AI
  const acceptAiSuggestion = () => {
    setBudgetLimits(prev => ({
      ...prev,
      'Transport': 250000,
      'Hiburan': 150000
    }));
    setShowAiSuggestion(false);
  };

  // 7. Susun data untuk di-render di UI
  const budgetData = [
    { cat: 'Makanan', icon: <Utensils className="w-4 h-4" />, limit: budgetLimits['Makanan'] },
    { cat: 'Transport', icon: <Car className="w-4 h-4" />, limit: budgetLimits['Transport'] },
    { cat: 'Belanja', icon: <ShoppingBag className="w-4 h-4" />, limit: budgetLimits['Belanja'] },
    { cat: 'Hiburan', icon: <Gamepad2 className="w-4 h-4" />, limit: budgetLimits['Hiburan'] },
    { cat: 'Tagihan', icon: <Zap className="w-4 h-4" />, limit: budgetLimits['Tagihan'] },
    { cat: 'Lainnya', icon: <CircleEllipsis className="w-4 h-4" />, limit: budgetLimits['Lainnya'] },
  ].map(item => {
    // Ambil total pengeluaran yang sudah dihitung, jika tidak ada fallback ke 0 (hanya untuk mode Demo)
    let dummyBase = 0;
    if (isDemo) {
      if (item.cat === 'Makanan') dummyBase = 680000;
      if (item.cat === 'Transport') dummyBase = 120000;
      if (item.cat === 'Belanja') dummyBase = 430000;
      if (item.cat === 'Hiburan') dummyBase = 80000;
      if (item.cat === 'Tagihan') dummyBase = 350000;
    }

    // Hitung pengeluaran asli + dummy base
    const spent = expensesByCategory[item.cat] + dummyBase;

    // Kalkulasi persentase
    const rawPct = item.limit > 0 ? (spent / item.limit) * 100 : 0;
    const pct = Math.min(rawPct, 100); // Maksimal 100% untuk panjang visual bar
    const isOver = spent > item.limit;

    // Tentukan warna bar secara dinamis
    let color = 'bg-green-500';
    if (rawPct >= 100) color = 'bg-red-500';
    else if (rawPct > 75) color = 'bg-orange-500';

    return {
      ...item,
      spentText: formatRb(spent),
      limitText: formatRb(item.limit),
      pctText: `${pct}%`,
      color,
      alert: isOver
    };
  });

  return (
    <div className="flex flex-col text-foreground font-sans">
      {/* Forest Health Indicator Dinamis */}
      <div className="bg-[#e8f4ec] dark:bg-emerald-950/20 border border-[#b6dfc2] dark:border-emerald-900/30 rounded-[24px] p-5 mb-4 flex items-center gap-5 shadow-sm">
        <div className="text-4xl bg-white dark:bg-gray-900 p-3 rounded-2xl shadow-sm select-none">🌳</div>
        <div className="flex-1">
          <div className="text-[14px] font-bold text-primary mb-2.5">Forest health · {forestHealth} / 100</div>
          <div className="h-2.5 bg-[#c8ebd4] dark:bg-emerald-900/40 rounded-full overflow-hidden mb-2 shadow-inner">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${forestHealth}%` }}></div>
          </div>
          <div className="text-[12px] font-medium text-primary opacity-80">+30 XP jika semua budget aman bulan ini</div>
        </div>
      </div>

      {/* AI Suggestion Banner (Based on pattern, requires confirmation) */}
      {showAiSuggestion && (
        <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-[#1e1b4b]/30 dark:to-[#312e81]/20 border border-violet-100 dark:border-indigo-900/30 rounded-[24px] p-5 mb-4 shadow-sm animate-fade-in relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-violet-300/10 dark:bg-violet-500/5 rounded-full blur-2xl"></div>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-bold text-violet-950 dark:text-violet-300 mb-1">Rekomendasi Hemat Google AI</p>
              <p className="text-[12.5px] font-medium text-violet-900/80 dark:text-violet-300/70 leading-relaxed mb-4">
                Berdasarkan pola pengeluaran minggu pertama, AI menyarankan penyesuaian budget demi mempercepat kesehatan pohon:
                <br />
                • <strong className="font-bold text-primary">Transport</strong>: 300rb → <strong className="font-semibold text-primary">250rb</strong>
                <br />
                • <strong className="font-bold text-primary">Hiburan</strong>: 200rb → <strong className="font-semibold text-primary">150rb</strong>
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={acceptAiSuggestion}
                  className="bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Terapkan Saran AI
                </button>
                <button 
                  onClick={() => setShowAiSuggestion(false)}
                  className="bg-transparent hover:bg-violet-100 dark:hover:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-semibold text-xs px-3 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Abaikan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Budget Container */}
      <div className="bg-white dark:bg-gray-900 rounded-[24px] p-6 shadow-sm border border-gray-50 dark:border-gray-800 mb-6">
        <div className="flex justify-between items-center mb-8">
          <div className="text-[16px] font-bold text-foreground">Budget Mei 2026</div>
          <div className="text-[12px] font-medium text-muted-foreground bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">20 hari berlalu</div>
        </div>

        {/* Looping data budget */}
        <div className="space-y-6">
          {budgetData.map((item) => {
            const isEditing = editingCategory === item.cat;

            return (
              <div key={item.cat} className="group">
                <div className="flex justify-between items-center mb-2.5">
                  <div className="text-[14px] font-semibold text-foreground flex items-center gap-2.5">
                    <span className="text-muted-foreground">{item.icon}</span> 
                    {item.cat}
                    
                    {/* Pencil Edit Icon */}
                    {!isEditing && (
                      <button 
                        onClick={() => startEditing(item.cat)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-all p-1 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer shrink-0"
                        title="Edit Budget"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1">
                        <span className="text-xs font-bold text-muted-foreground">Rp</span>
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value.replace(/[^0-9]/g, ""))}
                          className="w-16 bg-transparent text-xs font-bold text-foreground outline-none text-right"
                          autoFocus
                        />
                        <button 
                          onClick={() => saveBudget(item.cat)}
                          className="text-primary hover:scale-110 p-0.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => setEditingCategory(null)}
                          className="text-red-500 hover:scale-110 p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className={`text-[13px] font-bold ${item.alert ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {item.spentText} / <span className="font-medium">{item.limitText}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${item.color} transition-all duration-500`} style={{ width: item.pctText }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[24px] p-6 shadow-sm border border-gray-50 dark:border-gray-800">
        <div className="flex justify-between items-center mb-3">
          <div className="text-[15px] font-bold text-foreground">Proyeksi Akhir Bulan</div>
        </div>
        <div className="text-[13.5px] font-medium text-muted-foreground leading-relaxed">
          Dengan pola pengeluaran saat ini, kamu akan <strong className="text-red-500">over budget Rp 95.000</strong> di kategori makanan. Kurangi makan di luar 2x minggu ini untuk tetap aman.
        </div>
      </div>
    </div>
  );
}