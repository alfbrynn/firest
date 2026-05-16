import { useState, useMemo } from "react";
import { TrendingUp, Mail, Utensils, ShoppingBag, Car, Landmark, Plus, ChevronDown, ChevronRight, Search, Filter, RefreshCw, CheckCircle2, AlertCircle, X } from "lucide-react";
import { useAppStore } from "@/src/store/useAppStore";
import { createClient } from "@/src/utils/supabase/client";

// Fungsi bantuan untuk memilih ikon berdasarkan kategori
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Makanan': return <Utensils className="w-5 h-5" />;
    case 'Transport': return <Car className="w-5 h-5" />;
    case 'Belanja': return <ShoppingBag className="w-5 h-5" />;
    case 'Tagihan': return <Landmark className="w-5 h-5" />;
    default: return <Plus className="w-5 h-5" />;
  }
};

export default function TransactionTab() {
  const [txType, setTxType] = useState("keluar");
  const [txCat, setTxCat] = useState('Makanan');

  const [txTitle, setTxTitle] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  const [expandedMonths, setExpandedMonths] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const { addTransaction, transactions, isDemo, fetchUserData } = useAppStore();

  // Ambil user ID untuk simpan transaksi di database
  useState(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    fetchUser();
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSyncGmail = async () => {
    if (!userId || isSyncing) return;
    
    try {
      setIsSyncing(true);
      const response = await fetch("/api/sync-gmail", { method: "POST" });
      const data = await response.json();
      
      if (response.ok) {
        if (data.message.includes("Sukses sync")) {
          // Update data di store agar UI langsung berubah
          await fetchUserData(userId);
        }
        showToast(data.message, "success");
      } else {
        throw new Error(data.error || "Gagal sinkronisasi");
      }
    } catch (error: any) {
      console.error("Sync Error:", error);
      showToast(error.message || "Gagal sinkronisasi Gmail.", "error");
    } finally {
      setIsSyncing(false);
    }
  };



  const handleAddTransaction = () => {
    if (!txTitle || !txAmount || !userId) return;

    const cleanAmount = parseInt(txAmount.replace(/[^0-9]/g, ""));
    if (isNaN(cleanAmount)) return;

    const newTx = {
      title: txTitle,
      amount: cleanAmount,
      category: txCat,
      type: (txType === "masuk" ? "income" : "expense") as "income" | "expense" | "transfer",
      date: new Date(txDate).toISOString(),
    };

    addTransaction(newTx, userId);
    setTxTitle("");
    setTxAmount("");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, "");
    if (numericValue) {
      setTxAmount(parseInt(numericValue).toLocaleString('id-ID'));
    } else {
      setTxAmount("");
    }
  };

  const toggleMonth = (id: string) => {
    setExpandedMonths(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const [visibleLimits, setVisibleLimits] = useState<Record<string, number>>({});

  // 1. Grouping riwayat transaksi secara dinamis berdasarkan data dari database
  const groupedHistory = useMemo(() => {
    const filteredTxs = transactions.filter(tx =>
      tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const months: Record<string, typeof transactions> = {};
    filteredTxs.forEach(tx => {
      const d = new Date(tx.date);
      const monthName = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      if (!months[monthName]) {
        months[monthName] = [];
      }
      months[monthName].push(tx);
    });

    const result = Object.entries(months).map(([monthName, txList]) => {
      const id = monthName.toLowerCase().replace(/\s+/g, '-');
      const limit = visibleLimits[id] || 10;
      
      // Ambil transaksi sesuai limit untuk ditampilkan
      const limitedTxList = txList.slice(0, limit);

      const dayGroups: Record<string, typeof transactions> = {};
      const todayStr = new Date().toDateString();
      const yesterdayStr = new Date(Date.now() - 86400000).toDateString();

      limitedTxList.forEach(tx => {
        const d = new Date(tx.date);
        let label = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' }).toUpperCase();
        if (d.toDateString() === todayStr) {
          label = "HARI INI";
        } else if (d.toDateString() === yesterdayStr) {
          label = "KEMARIN";
        }

        if (!dayGroups[label]) {
          dayGroups[label] = [];
        }
        dayGroups[label].push(tx);
      });

      const totalExpense = txList
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalIncome = txList
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        id,
        month: monthName,
        totalCount: txList.length,
        hasMore: txList.length > limit,
        totalExpenseText: totalExpense > 0 ? `- Rp ${totalExpense.toLocaleString('id-ID')}` : 'Rp 0',
        totalIncomeText: totalIncome > 0 ? `+ Rp ${totalIncome.toLocaleString('id-ID')}` : 'Rp 0',
        groups: Object.entries(dayGroups).map(([label, items]) => ({
          label,
          items: items.map(t => ({
            id: t.id || Math.random().toString(),
            title: t.title,
            amount: t.amount,
            type: t.type,
            category: t.category,
            time: new Date(t.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            source: t.is_auto_sync ? 'Auto Sync' : 'Manual',
            icon: getCategoryIcon(t.category)
          }))
        }))
      };
    });

    return result;
  }, [transactions, searchQuery, visibleLimits]);

  const handleLoadMore = (monthId: string) => {
    setVisibleLimits(prev => ({
      ...prev,
      [monthId]: (prev[monthId] || 10) + 10
    }));
  };

  // Set default bulan pertama ter-expand jika data ter-load
  useState(() => {
    if (groupedHistory.length > 0 && expandedMonths.length === 0) {
      setExpandedMonths([groupedHistory[0].id]);
    }
  });

  // 2. Hitung totals dinamis bulan berjalan
  const currentMonthSummary = useMemo(() => {
    const now = new Date();
    const currM = now.getMonth();
    const currY = now.getFullYear();

    const currentMonthTxs = transactions.filter(tx => {
      const d = new Date(tx.date);
      return d.getMonth() === currM && d.getFullYear() === currY;
    });

    const expense = currentMonthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const income = currentMonthTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

    const formatShort = (num: number) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}jt`;
      if (num >= 1000) return `${(num / 1000).toFixed(0)}rb`;
      return num.toString();
    };

    const savingRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
    const isRatePositive = savingRate > 0;

    return {
      expense: formatShort(expense),
      income: formatShort(income),
      savingRate: isRatePositive ? `${savingRate}%` : '0%',
      progressRate: isRatePositive ? Math.min(savingRate, 100) : 0,
      rawExpense: expense,
      rawIncome: income
    };
  }, [transactions]);

  return (
    <div className="flex flex-col text-foreground font-sans relative">
      {/* Custom Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-[100] animate-in fade-in slide-in-from-right-4 duration-300">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-[20px] shadow-[0_15px_50px_-10px_rgba(0,0,0,0.1)] border backdrop-blur-xl ${
            toast.type === "success" 
            ? "bg-emerald-500/90 border-emerald-400 text-white" 
            : "bg-rose-500/90 border-rose-400 text-white"
          }`}>
            {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-bold tracking-tight">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {/* Row 1: Pemasukan & Pengeluaran */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-[16px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-[11px] font-semibold text-muted-foreground mb-1">Pemasukan</p>
          <p className="text-[22px] font-semibold text-primary">{currentMonthSummary.income}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Bulan ini</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-[16px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-[11px] font-semibold text-muted-foreground mb-1">Pengeluaran</p>
          <p className="text-[22px] font-semibold text-red-500 dark:text-red-400">{currentMonthSummary.expense}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Bulan ini</p>
        </div>
      </div>

      {/* Row 2: Saving Rate */}
      <div className="bg-primary p-5 rounded-[20px] mb-3 shadow-md">
        <p className="text-[11px] font-medium text-emerald-100 dark:text-emerald-200 mb-1">Saving Rate bulan ini</p>
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-2">
            <p className="text-[40px] font-bold text-white leading-none">{currentMonthSummary.savingRate}</p>
            <TrendingUp className="w-5 h-5 text-emerald-300 mb-1" />
          </div>
          <span className="text-[11px] text-emerald-300 dark:text-emerald-200 bg-emerald-800/30 px-3 py-1 rounded-full">
            🌱 Taman tumbuh
          </span>
        </div>
        <div className="mt-3 h-1.5 bg-emerald-800/30 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-300 rounded-full" style={{ width: `${currentMonthSummary.progressRate}%` }} />
        </div>
      </div>

      {/* Add Transaction Section */}
      <div className="bg-white dark:bg-gray-900 rounded-[24px] p-6 shadow-sm border border-gray-50 dark:border-gray-800 mb-6 relative">
        {isDemo && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-[1px] z-10 rounded-[24px] flex items-center justify-center">
            <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              Input dinonaktifkan di mode Demo
            </span>
          </div>
        )}
        <div className="text-[11px] font-bold text-muted-foreground mb-4 uppercase tracking-widest">Catat Transaksi</div>
        <div className="flex bg-slate-50 dark:bg-gray-800 p-1.5 rounded-xl mb-6">
          {['Keluar', 'Masuk', 'Transfer'].map((type) => (
            <button
              key={type}
              onClick={() => setTxType(type.toLowerCase())}
              disabled={isDemo}
              className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all ${txType === type.toLowerCase()
                ? "bg-white dark:bg-gray-900 text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex gap-4 mb-6 border-b border-gray-100 dark:border-gray-800 pb-3">
          <input
            type="text"
            id="titleTransactions"
            name="titleTransactions"
            value={txTitle}
            onChange={(e) => setTxTitle(e.target.value)}
            disabled={isDemo}
            placeholder="Nama transaksi..."
            className="flex-1 text-[16px] font-medium text-foreground bg-transparent outline-none placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
          />
          <div className="flex items-center w-1/3">
            <span className="text-[24px] font-bold text-muted-foreground mr-1">Rp</span>
            <input
              type="text"
              id="amountTransactions"
              name="amountTransactions"
              value={txAmount}
              onChange={handleAmountChange}
              disabled={isDemo}
              placeholder="0"
              className="w-full text-[24px] text-left font-bold text-foreground bg-transparent outline-none placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          {['Makanan', 'Transport', 'Belanja', 'Hiburan', 'Tagihan', 'Lainnya'].map((tag) => (
            <button
              key={tag}
              onClick={() => setTxCat(tag)}
              className={`px-5 py-2 rounded-full text-[13px] border transition-colors ${txCat === tag
                ? 'border-primary bg-[#e8f4ec] dark:bg-emerald-950/40 text-primary font-semibold'
                : 'border-gray-200 dark:border-gray-700 text-muted-foreground hover:border-gray-300 dark:hover:border-gray-600'
                }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Date Selection */}
        <div className="flex items-center gap-3 mb-6 bg-slate-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Tanggal:</span>
          <input 
            type="date" 
            value={txDate}
            onChange={(e) => setTxDate(e.target.value)}
            className="bg-transparent text-sm font-semibold text-foreground outline-none cursor-pointer focus:text-primary transition-colors"
          />
          <div className="flex gap-1 ml-auto">
             <button 
              onClick={() => setTxDate(new Date().toISOString().split('T')[0])}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${txDate === new Date().toISOString().split('T')[0] ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800 text-muted-foreground border border-gray-100 dark:border-gray-700'}`}
             >
               Hari Ini
             </button>
             <button 
              onClick={() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                setTxDate(yesterday.toISOString().split('T')[0]);
              }}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${txDate === new Date(Date.now() - 86400000).toISOString().split('T')[0] ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800 text-muted-foreground border border-gray-100 dark:border-gray-700'}`}
             >
               Kemarin
             </button>
          </div>
        </div>

        <button
          onClick={handleAddTransaction}
          className="w-full bg-primary text-white py-3.5 rounded-xl font-medium hover:bg-primary-hover transition-colors shadow-sm cursor-pointer"
        >
          + Simpan Transaksi
        </button>
      </div>

      {/* Gmail Sync Section */}
      <div className="bg-[#e8f4ec] dark:bg-emerald-950/20 border border-[#b6dfc2] dark:border-emerald-900/30 rounded-[20px] p-4 mb-8 flex items-center justify-between group">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-white dark:bg-emerald-900/40 flex items-center justify-center shadow-sm ${isSyncing ? 'animate-spin' : ''}`}>
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-primary leading-tight">Sinkronisasi Gmail</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Tarik transaksi otomatis dari email</p>
          </div>
        </div>
        
        <button
          onClick={handleSyncGmail}
          disabled={isSyncing}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black transition-all ${
            isSyncing 
            ? "bg-gray-100 dark:bg-gray-800 text-gray-400" 
            : "bg-primary text-white hover:bg-emerald-700 shadow-sm active:scale-[0.96]"
          }`}
        >
          {isSyncing ? (
            <>Memproses...</>
          ) : (
            <><RefreshCw className="w-3.5 h-3.5" /> Sinkronkan</>
          )}
        </button>
      </div>

      {/* Riwayat Transaksi (Grouped List) */}
      <div className="mb-4">
        {/* Search Bar & Filter */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm focus-within:border-primary/50 transition-colors">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              id="transactionsSearch"
              name="transactionsSearch"
              placeholder="Cari transaksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-[14px] outline-none text-foreground placeholder-gray-400"
            />
          </div>
          <button className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Filter className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Mapped Month Groups */}
        <div className="space-y-4">
          {groupedHistory.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6">
              <p className="text-[14px] font-semibold text-foreground">Belum ada riwayat transaksi</p>
              <p className="text-[12px] text-muted-foreground mt-1.5 leading-relaxed">Pencarian Anda tidak menemukan hasil, atau Anda belum mencatatkan transaksi bulan ini.</p>
            </div>
          ) : (
            groupedHistory.map((monthData) => {
              const isExpanded = expandedMonths.includes(monthData.id);

              return (
                <div key={monthData.id} className="flex flex-col border border-gray-100/50 dark:border-gray-800/50 rounded-2xl bg-gray-50/30 dark:bg-gray-900/10 overflow-hidden transition-all">
                  {/* Accordion Header */}
                  <button
                    onClick={() => toggleMonth(monthData.id)}
                    className="flex items-center justify-between p-4 hover:bg-gray-100/50 dark:hover:bg-gray-800/30 transition-colors w-full text-left"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                      <span className="text-[15px] font-bold text-foreground">{monthData.month}</span>
                    </div>
                    <span className="text-[13px] text-muted-foreground font-medium hidden sm:inline-block">
                      {monthData.totalCount} transaksi · {monthData.totalExpenseText}
                    </span>
                    <span className="text-[13px] text-muted-foreground font-medium sm:hidden">
                      {monthData.totalExpenseText}
                    </span>
                  </button>

                  {/* Collapsible Content */}
                  {isExpanded && (
                    <div className="p-4 pt-1 bg-transparent">
                      {monthData.groups.map((group, gIdx) => (
                        <div key={gIdx} className="mb-5 last:mb-0">
                          <p className="text-[11px] font-bold text-muted-foreground tracking-widest mb-3 px-2">{group.label}</p>
                          <div className="space-y-2">
                            {group.items.map((item) => (
                              <div key={item.id} className="bg-white dark:bg-gray-900 p-3.5 sm:p-4 rounded-[16px] flex items-center justify-between shadow-sm border border-gray-50 dark:border-gray-800 hover:border-emerald-500/20 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3.5">
                                  <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 ${item.type === 'income' ? 'bg-[#e8f4ec] dark:bg-emerald-950/40 text-primary' : 'bg-orange-50 dark:bg-orange-950/30 text-orange-500'}`}>
                                    {item.icon}
                                  </div>
                                  <div>
                                    <p className="text-[14px] font-bold text-foreground group-hover:text-primary transition-colors">{item.title}</p>
                                    <p className="text-[11px] font-medium text-muted-foreground mt-0.5 flex items-center gap-2">
                                      {item.time} <span className="bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-md text-[9px] uppercase font-bold">{item.source}</span>
                                    </p>
                                  </div>
                                </div>
                                <p className={`text-[14px] font-bold shrink-0 ${item.type === 'income' ? 'text-primary' : 'text-red-500 dark:text-red-400'}`}>
                                  {item.type === 'income' ? '+ ' : '- '} Rp {item.amount.toLocaleString('id-ID')}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Lazy load / Tampilkan lebih banyak */}
                      {monthData.hasMore && (
                        <button 
                          onClick={() => handleLoadMore(monthData.id)}
                          className="w-full py-3 mt-2 text-[13px] font-bold text-primary hover:text-primary-hover bg-primary/5 dark:bg-primary/10 rounded-xl transition-colors cursor-pointer"
                        >
                          Lihat lebih banyak ↓
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}