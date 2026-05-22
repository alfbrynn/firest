import { useState, useMemo } from "react";
import { TrendingUp, Mail, Utensils, ShoppingBag, Car, Landmark, Plus, ChevronDown, ChevronRight, Search, Filter, RefreshCw, CheckCircle2, AlertCircle, X, Leaf, Edit2, Trash2, PiggyBank } from "lucide-react";
import { useAppStore, Transaction } from "@/src/store/useAppStore";
import { createClient } from "@/src/utils/supabase/client";

// Fungsi bantuan untuk memilih ikon berdasarkan kategori
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Makanan': return <Utensils className="w-5 h-5" />;
    case 'Transport': return <Car className="w-5 h-5" />;
    case 'Belanja': return <ShoppingBag className="w-5 h-5" />;
    case 'Tagihan': return <Landmark className="w-5 h-5" />;
    case 'Tabungan': return <PiggyBank className="w-5 h-5" />;
    default: return <Plus className="w-5 h-5" />;
  }
};

// Fungsi bantuan untuk mendapatkan kategori berdasarkan tipe transaksi
const getCategoriesForType = (type: string) => {
  if (type === 'masuk' || type === 'income') {
    return ['Uang Saku', 'Gaji', 'Bonus', 'Hasil Jualan', 'Lainnya'];
  }
  if (type === 'transfer') {
    return ['Transfer', 'Lainnya'];
  }
  return ['Makanan', 'Transport', 'Belanja', 'Hiburan', 'Tagihan', 'Tabungan', 'Lainnya'];
};

// Fungsi bantuan untuk mendapatkan string YYYY-MM-DD dalam waktu lokal
const getLocalDateString = (d: Date = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function TransactionTab() {
  const [txType, setTxType] = useState("keluar");
  const [txCat, setTxCat] = useState('Makanan');

  const [txTitle, setTxTitle] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txDate, setTxDate] = useState(getLocalDateString());

  const handleTxTypeChange = (newType: string) => {
    setTxType(newType);
    const availableCategories = getCategoriesForType(newType);
    setTxCat(availableCategories[0]);
  };

  const [expandedMonths, setExpandedMonths] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const [isSyncing, setIsSyncing] = useState(false);
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const { addTransaction, updateTransaction, deleteTransaction, transactions, isDemo, fetchUserData } = useAppStore();

  // Ambil user ID untuk simpan transaksi di database
  useState(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        const connected = session.user.app_metadata?.provider === 'google' || session.user.user_metadata?.is_gmail_connected;
        setIsGmailConnected(!!connected);
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

    // Pisahkan YYYY-MM-DD untuk membuat objek Date lokal yang kokoh
    const [year, month, day] = txDate.split('-').map(Number);
    const now = new Date();
    // Gabungkan dengan jam, menit, detik saat ini agar tidak ter-reset ke 00:00:00 (dan 07:00 WIB)
    const selectedDate = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());

    const newTx = {
      title: txTitle,
      amount: cleanAmount,
      category: txCat,
      type: (txType === "masuk" ? "income" : "expense") as "income" | "expense" | "transfer",
      date: selectedDate.toISOString(),
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

  // State for Editing
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [editingTxTitle, setEditingTxTitle] = useState("");
  const [editingTxAmount, setEditingTxAmount] = useState("");
  const [editingTxType, setEditingTxType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [editingTxCategory, setEditingTxCategory] = useState("Makanan");
  const [editingTxDate, setEditingTxDate] = useState("");
  const [editingTxIsAutoSync, setEditingTxIsAutoSync] = useState(false);

  // State for Deleting
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTxId, setDeletingTxId] = useState<string | null>(null);

  const openEditModal = (item: any) => {
    setEditingTxId(item.id);
    setEditingTxTitle(item.title);
    setEditingTxAmount(item.amount.toLocaleString('id-ID'));
    setEditingTxType(item.type);
    setEditingTxCategory(item.category);
    const formattedDate = item.date ? item.date.substring(0, 10) : getLocalDateString();
    setEditingTxDate(formattedDate);
    setEditingTxIsAutoSync(item.is_auto_sync);
    setIsEditModalOpen(true);
  };

  const handleEditAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, "");
    if (numericValue) {
      setEditingTxAmount(parseInt(numericValue).toLocaleString('id-ID'));
    } else {
      setEditingTxAmount("");
    }
  };

  const handleSaveEditTransaction = async () => {
    if (!editingTxId || !userId) return;
    if (!editingTxTitle || !editingTxAmount) {
      showToast("Nama dan nominal transaksi harus diisi.", "error");
      return;
    }

    const cleanAmount = parseInt(editingTxAmount.replace(/[^0-9]/g, ""));
    if (isNaN(cleanAmount)) {
      showToast("Nominal transaksi tidak valid.", "error");
      return;
    }

    const [year, month, day] = editingTxDate.split('-').map(Number);
    const now = new Date();
    const selectedDate = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds());

    const updatedFields: Partial<Transaction> = {
      title: editingTxTitle,
      category: editingTxCategory,
      type: editingTxType,
    };

    if (!editingTxIsAutoSync) {
      updatedFields.amount = cleanAmount;
      updatedFields.date = selectedDate.toISOString();
    }

    try {
      await updateTransaction(editingTxId, updatedFields, userId);
      setIsEditModalOpen(false);
      showToast("Transaksi berhasil diperbarui!", "success");
    } catch (error) {
      console.error(error);
      showToast("Gagal memperbarui transaksi.", "error");
    }
  };

  const openDeleteModal = (id: string) => {
    setDeletingTxId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteTransaction = async () => {
    if (!deletingTxId || !userId) return;

    try {
      await deleteTransaction(deletingTxId, userId);
      setIsDeleteModalOpen(false);
      setDeletingTxId(null);
      showToast("Transaksi berhasil dihapus!", "success");
    } catch (error) {
      console.error(error);
      showToast("Gagal menghapus transaksi.", "error");
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
            date: t.date,
            is_auto_sync: t.is_auto_sync || false,
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
        <div className="fixed top-20 right-6 z-100 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-[20px] shadow-[0_15px_50px_-10px_rgba(0,0,0,0.15)] border backdrop-blur-xl ${toast.type === "success"
            ? "bg-emerald-500/90 border-emerald-400 text-white"
            : "bg-rose-500/90 border-rose-400 text-white"
            }`}>
            {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-black tracking-tight">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
         👑 CROWN JEWEL: REDESIGNED SAVING RATE WIDGET (Top Visual Hierarchy)
         ========================================================================= */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-900 dark:from-[#1b5e43] dark:to-[#0f2e21] p-5 sm:p-6 rounded-[28px] mb-4 shadow-[0_10px_30px_rgba(42,106,85,0.2)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)] relative overflow-hidden group border border-emerald-500/10 dark:border-emerald-400/10 transition-all duration-300 hover:shadow-[0_15px_35px_rgba(42,106,85,0.3)] hover:-translate-y-0.5">

        {/* Decorative Glowing Radial Grid Behind Content */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Dynamic Rotating Leaf Asset in Widget Background */}
        <div className="absolute -top-6 -right-6 text-white/5 group-hover:rotate-12 group-hover:scale-110 transition-all duration-700 ease-out select-none pointer-events-none">
          <Leaf className="w-24 h-24 fill-white/5" />
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full">

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
              </div>
              <span className="text-[10px] font-black text-emerald-100 uppercase tracking-widest leading-none">Mesin Tabunganmu</span>
            </div>

            {/* Gamified Health Status Indicator Tag */}
            <span className="text-[9px] font-black text-emerald-100 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 uppercase tracking-wider animate-pulse leading-none">
              🌱 Taman Tumbuh
            </span>
          </div>

          <div className="flex items-baseline gap-3 mb-3">
            <h2 className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
              {currentMonthSummary.savingRate}
            </h2>
            <div className="flex flex-col">
              <span className="text-emerald-300 font-extrabold text-[10px] uppercase tracking-widest flex items-center gap-1 leading-none">
                Rasio Hemat
              </span>
              <span className="text-[9px] text-white/70 font-bold mt-1 leading-none">
                Makin besar, pohon makin subur!
              </span>
            </div>
          </div>

          {/* Gamified Narrative Feedback */}
          <p className="text-[11px] text-emerald-50/95 leading-relaxed font-semibold mb-4 bg-emerald-950/25 dark:bg-emerald-950/45 p-2.5 px-3.5 rounded-2xl border border-white/5 shadow-inner">
            🌿 {currentMonthSummary.progressRate >= 50
              ? `Luar biasa! Saving Rate ${currentMonthSummary.savingRate} sangat menyehatkan ekosistem. Pohon-pohon bertumbuh 2x lebih cepat!`
              : currentMonthSummary.progressRate > 0
                ? `Kerja bagus! Sisa tabungan Anda berada di zona aman. Teruskan berhemat agar pohon tidak layu.`
                : `Peringatan: Saving Rate Anda di bawah batas minimal. Pemasukan bulanan habis terpakai. Hemat segera untuk menyiram hutan!`
            }
          </p>

          <div className="space-y-2">
            <div className="flex justify-between text-[9px] font-bold text-emerald-100 uppercase tracking-widest px-0.5">
              <span>Tabungan Tersimpan: Rp {((currentMonthSummary.rawIncome - currentMonthSummary.rawExpense) > 0 ? (currentMonthSummary.rawIncome - currentMonthSummary.rawExpense) : 0).toLocaleString('id-ID')}</span>
              <span>{currentMonthSummary.savingRate}</span>
            </div>

            {/* Dynamic Glowing Progress Bar with Sweeping Shimmer */}
            <div className="h-3 bg-emerald-950/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full animate-shimmer"
                style={{ width: `${currentMonthSummary.progressRate}%` }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Row 1: Pemasukan & Pengeluaran (Visual contrast boost) */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-[22px] border border-gray-100 dark:border-gray-800 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-primary/20 hover:shadow-[0_8px_20px_rgba(42,106,85,0.04)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-all duration-300">
          <div>
            <p className="text-[9px] font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-1.5">Pemasukan</p>
            <p className="text-xl sm:text-2xl font-black text-primary">Rp {currentMonthSummary.income}</p>
          </div>
          <p className="text-[9px] font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mt-3.5">Bulan ini</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-[22px] border border-gray-100 dark:border-gray-800 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-rose-500/20 hover:shadow-[0_8px_20px_rgba(244,63,94,0.03)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-all duration-300">
          <div>
            <p className="text-[9px] font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-1.5">Pengeluaran</p>
            <p className="text-xl sm:text-2xl font-black text-rose-500">Rp {currentMonthSummary.expense}</p>
          </div>
          <p className="text-[9px] font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mt-3.5">Bulan ini</p>
        </div>
      </div>

      {/* Add Transaction Section (Clean UI, High legibility, Scale interactions) */}
      <div className="bg-white dark:bg-gray-900 rounded-[24px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-gray-800 mb-4 relative overflow-hidden">
        {isDemo && (
          <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-[1px] z-10 rounded-[24px] flex items-center justify-center">
            <span className="bg-primary text-white text-xs font-black px-4 py-1.5 rounded-full shadow-md border border-emerald-400/20 animate-pulse">
              Input dinonaktifkan di mode Demo
            </span>
          </div>
        )}
        <div className="text-[10px] font-black text-gray-500 dark:text-gray-300 mb-4.5 uppercase tracking-widest">Catat Transaksi</div>

        <div className="flex bg-slate-100/70 dark:bg-gray-800/60 p-1 rounded-xl mb-4.5">
          {['Keluar', 'Masuk', 'Transfer'].map((type) => {
            const typeLower = type.toLowerCase();
            return (
              <button
                key={type}
                onClick={() => handleTxTypeChange(typeLower)}
                disabled={isDemo}
                className={`flex-1 py-2 text-xs font-black rounded-lg transition-all duration-300 cursor-pointer active:scale-95 ${txType === typeLower
                  ? typeLower === 'keluar'
                    ? "bg-rose-500 text-white shadow-[0_2px_8px_rgba(244,63,94,0.3)]"
                    : typeLower === 'masuk'
                      ? "bg-emerald-500 text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)]"
                      : "bg-blue-500 text-white shadow-[0_2px_8px_rgba(59,130,246,0.3)]"
                  : "text-gray-500 dark:text-gray-400 hover:text-foreground"
                  }`}
              >
                {type}
              </button>
            );
          })}
        </div>

        <div className="flex gap-4 mb-4.5 border-b border-gray-100 dark:border-gray-800/80 pb-2.5">
          <input
            type="text"
            id="titleTransactions"
            name="titleTransactions"
            value={txTitle}
            onChange={(e) => setTxTitle(e.target.value)}
            disabled={isDemo}
            placeholder="Nama transaksi..."
            className="flex-1 text-sm font-semibold text-foreground bg-transparent outline-none placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
          />
          <div className="flex items-center w-1/3">
            <span className="text-lg font-black text-gray-500 dark:text-gray-400 mr-1">Rp</span>
            <input
              type="text"
              id="amountTransactions"
              name="amountTransactions"
              value={txAmount}
              onChange={handleAmountChange}
              disabled={isDemo}
              placeholder="0"
              className="w-full text-lg text-left font-black text-foreground bg-transparent outline-none placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
            />
          </div>
        </div>

        <div className="flex gap-1.5 flex-wrap mb-4.5">
          {getCategoriesForType(txType).map((tag) => (
            <button
              key={tag}
              onClick={() => setTxCat(tag)}
              className={`px-3.5 py-1 rounded-full text-[11px] font-bold border transition-all duration-200 cursor-pointer hover:-translate-y-0.25 ${txCat === tag
                ? 'border-primary bg-[#e8f4ec] dark:bg-emerald-950/40 text-primary'
                : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Date Selection */}
        <div className="flex items-center gap-3 mb-4.5 bg-slate-50 dark:bg-gray-800/30 p-2.5 px-3.5 rounded-xl border border-gray-100 dark:border-gray-800/80">
          <span className="text-[10px] font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest pl-0.5 leading-none">Tanggal:</span>
          <input
            type="date"
            value={txDate}
            onChange={(e) => setTxDate(e.target.value)}
            className="bg-transparent text-xs font-extrabold text-foreground outline-none cursor-pointer focus:text-primary transition-colors"
          />
          <div className="flex gap-1 ml-auto">
            <button
              onClick={() => setTxDate(getLocalDateString())}
              className={`px-2 py-1 rounded-lg text-[9px] font-black transition-all ${txDate === getLocalDateString() ? 'bg-primary text-white shadow-xs' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700'}`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                setTxDate(getLocalDateString(yesterday));
              }}
              className={`px-2 py-1 rounded-lg text-[9px] font-black transition-all ${txDate === getLocalDateString(new Date(Date.now() - 86400000)) ? 'bg-primary text-white shadow-xs' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700'}`}
            >
              Kemarin
            </button>
          </div>
        </div>

        <button
          onClick={handleAddTransaction}
          className={`w-full text-white py-3 rounded-xl font-black text-xs active:scale-[0.98] transition-all cursor-pointer ${
            txType === 'masuk'
              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-[0_4px_12px_rgba(16,185,129,0.25)]'
              : txType === 'transfer'
              ? 'bg-blue-600 hover:bg-blue-700 shadow-[0_4px_12px_rgba(37,99,235,0.25)]'
              : 'bg-rose-600 hover:bg-rose-700 shadow-[0_4px_12px_rgba(225,29,72,0.25)]'
          }`}
        >
          {txType === 'masuk'
            ? '+ Simpan Pemasukan 💰'
            : txType === 'transfer'
            ? '+ Catat Transfer 🔄'
            : '+ Catat Pengeluaran 💸'
          }
        </button>
      </div>

      {/* Gmail Sync Section (Upgraded with Glows and Micro-Leaf theme details) */}
      <div className={`bg-[#e8f4ec]/80 dark:bg-emerald-950/20 border border-[#b6dfc2]/60 dark:border-emerald-900/30 rounded-[20px] p-4 mb-4.5 flex items-center justify-between group hover:shadow-[0_8px_20px_rgba(42,106,85,0.04)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300 relative overflow-hidden ${!isGmailConnected ? 'opacity-80' : ''}`}>
        {/* Soft underlying glow gradient */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className={`w-9 h-9 rounded-xl bg-white dark:bg-emerald-900/30 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.02)] shrink-0 border border-emerald-100/30 ${isSyncing ? 'animate-spin' : 'group-hover:scale-105 transition-transform'}`}>
            <Mail className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-black text-primary leading-tight">Sinkronisasi Gmail</p>
            <p className="text-[10px] font-bold text-gray-500 dark:text-emerald-200/50 mt-1">
              {!isGmailConnected ? "Gmail belum terhubung. Aktifkan di Pengaturan." : "Tarik transaksi otomatis dari email"}
            </p>
          </div>
        </div>

        <button
          onClick={handleSyncGmail}
          disabled={isSyncing || !isGmailConnected}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black transition-all cursor-pointer ${isSyncing || !isGmailConnected
            ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            : "bg-primary text-white hover:bg-emerald-700 shadow-[0_4px_12px_rgba(42,106,85,0.1)] active:scale-[0.96]"
            }`}
        >
          {isSyncing ? (
            <>Memproses...</>
          ) : !isGmailConnected ? (
            <>Belum Terhubung</>
          ) : (
            <><RefreshCw className="w-3.5 h-3.5 animate-pulse" /> Sinkronkan</>
          )}
        </button>
      </div>

      {/* Riwayat Transaksi (Grouped List, Glow Shadow improvements, high legibility) */}
      <div className="mb-4">
        {/* Search Bar & Filter */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 flex items-center gap-2.5 shadow-xs focus-within:border-primary/50 transition-colors">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              id="transactionsSearch"
              name="transactionsSearch"
              placeholder="Cari transaksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs outline-none text-foreground placeholder-gray-400 font-semibold"
            />
          </div>
          <button className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3 rounded-xl shadow-xs hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-200 transition-all cursor-pointer">
            <Filter className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Mapped Month Groups */}
        <div className="space-y-3.5">
          {groupedHistory.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-[24px] border border-gray-100 dark:border-gray-800 p-6 shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
              <p className="text-xs font-black text-foreground">Belum ada riwayat transaksi</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">Pencarian Anda tidak menemukan hasil, atau Anda belum mencatatkan transaksi bulan ini.</p>
            </div>
          ) : (
            groupedHistory.map((monthData) => {
              const isExpanded = expandedMonths.includes(monthData.id);

              return (
                <div key={monthData.id} className="flex flex-col border border-gray-100/60 dark:border-gray-800/60 rounded-[20px] bg-gray-50/50 dark:bg-gray-900/10 overflow-hidden transition-all">
                  {/* Accordion Header */}
                  <button
                    onClick={() => toggleMonth(monthData.id)}
                    className="flex items-center justify-between p-4 hover:bg-gray-100/50 dark:hover:bg-gray-800/30 transition-colors w-full text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                      <span className="text-xs sm:text-sm font-black text-foreground">{monthData.month}</span>
                    </div>
                    <span className="text-[11px] text-gray-500 dark:text-gray-300 font-extrabold hidden sm:inline-block">
                      {monthData.totalCount} transaksi · {monthData.totalExpenseText}
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-300 font-extrabold sm:hidden">
                      {monthData.totalExpenseText}
                    </span>
                  </button>

                  {/* Collapsible Content */}
                  {isExpanded && (
                    <div className="p-3.5 pt-1.5 bg-transparent">
                      {monthData.groups.map((group, gIdx) => (
                        <div key={gIdx} className="mb-4.5 last:mb-0">
                          <p className="text-[9px] font-black text-gray-500 dark:text-gray-300 tracking-widest mb-2 px-1.5">{group.label}</p>
                          <div className="space-y-2">
                            {group.items.map((item) => (
                              <div key={item.id} className="bg-white dark:bg-gray-900 p-3 sm:p-3.5 rounded-[16px] flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-gray-800/80 hover:border-primary/40 dark:hover:border-primary/30 hover:shadow-[0_8px_20px_rgba(42,106,85,0.06)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8.5 h-8.5 rounded-[12px] flex items-center justify-center shrink-0 ${item.category === 'Tabungan' ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400' : item.type === 'income' ? 'bg-[#e8f4ec] dark:bg-emerald-950/40 text-primary' : 'bg-orange-50 dark:bg-orange-950/30 text-orange-500'}`}>
                                    {item.icon}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <p className="text-xs font-black text-foreground group-hover:text-primary transition-colors">{item.title}</p>
                                      {item.is_auto_sync && item.category === 'Lainnya' && (
                                        <span className="bg-amber-500/10 text-amber-600 dark:bg-amber-500/5 dark:text-amber-400 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider border border-amber-500/20">
                                          Perlu Dikategorikan ⚠️
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[9px] font-extrabold text-gray-500 dark:text-gray-300 mt-1 flex items-center gap-1.5">
                                      {item.time} {item.category === 'Tabungan' ? (
                                        <span className="bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300 px-2 py-0.5 rounded-md text-[8px] uppercase font-black">TABUNGAN</span>
                                      ) : (
                                        <span className="bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 px-2 py-0.5 rounded-md text-[8px] uppercase font-black">{item.source}</span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  <p className={`text-xs font-black ${item.category === 'Tabungan' ? 'text-violet-600 dark:text-violet-400' : item.type === 'income' ? 'text-primary' : 'text-red-500 dark:text-red-400'}`}>
                                    {item.type === 'income' ? '+ ' : '- '} Rp {item.amount.toLocaleString('id-ID')}
                                  </p>
                                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openEditModal(item);
                                      }}
                                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-primary transition-colors cursor-pointer"
                                      title="Edit Transaksi"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openDeleteModal(item.id);
                                      }}
                                      className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg text-gray-500 hover:text-rose-600 transition-colors cursor-pointer"
                                      title="Hapus Transaksi"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Lazy load / Tampilkan lebih banyak */}
                      {monthData.hasMore && (
                        <button
                          onClick={() => handleLoadMore(monthData.id)}
                          className="w-full py-2.5 mt-2.5 text-xs font-black text-primary hover:text-primary-hover bg-primary/5 dark:bg-primary/10 rounded-xl transition-all duration-200 active:scale-[0.98] cursor-pointer"
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

      {/* Edit Transaction Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-950 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-gray-900/20">
              <div>
                <h3 className="text-base font-black text-foreground">Edit Transaksi</h3>
                <p className="text-[10px] font-bold text-gray-500 mt-1">
                  {editingTxIsAutoSync ? "Transaksi Auto-Sync Gmail 🔒" : "Ubah detail transaksi Anda"}
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-4">
              {editingTxIsAutoSync && (
                <div className="bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-3 flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 text-primary">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-primary leading-normal">
                      Transaksi Tersinkronisasi Otomatis
                    </p>
                    <p className="text-[9px] font-bold text-gray-500 dark:text-emerald-200/50 mt-0.5 leading-normal">
                      Nominal & tanggal dikunci untuk menjaga validitas data dari Gmail. Kategori tetap dapat diubah.
                    </p>
                  </div>
                </div>
              )}

              {/* Transaction Type */}
              <div className="flex bg-slate-100/70 dark:bg-gray-800/60 p-1 rounded-xl">
                {['Keluar', 'Masuk', 'Transfer'].map((type) => {
                  const typeLower = type.toLowerCase();
                  const typeValue = typeLower === 'keluar' ? 'expense' : typeLower === 'masuk' ? 'income' : 'transfer';
                  return (
                    <button
                      key={type}
                      type="button"
                      disabled={editingTxIsAutoSync}
                      onClick={() => {
                        setEditingTxType(typeValue);
                        const cats = getCategoriesForType(typeValue);
                        setEditingTxCategory(cats[0]);
                      }}
                      className={`flex-1 py-2 text-xs font-black rounded-lg transition-all duration-300 active:scale-95 disabled:opacity-50 ${editingTxType === typeValue
                        ? typeValue === 'expense'
                          ? "bg-rose-500 text-white shadow-[0_2px_8px_rgba(244,63,94,0.3)]"
                          : typeValue === 'income'
                            ? "bg-emerald-500 text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)]"
                            : "bg-blue-500 text-white shadow-[0_2px_8px_rgba(59,130,246,0.3)]"
                        : "text-gray-500 dark:text-gray-400 hover:text-foreground"
                        }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>

              {/* Title & Amount */}
              <div className="space-y-3">
                <div className="flex flex-col">
                  <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Nama Transaksi</label>
                  <input
                    type="text"
                    value={editingTxTitle}
                    onChange={(e) => setEditingTxTitle(e.target.value)}
                    placeholder="Nama transaksi..."
                    className="w-full text-sm font-semibold text-foreground bg-slate-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">
                    Nominal {editingTxIsAutoSync && "🔒"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-sm font-black text-gray-400">Rp</span>
                    <input
                      type="text"
                      value={editingTxAmount}
                      onChange={handleEditAmountChange}
                      disabled={editingTxIsAutoSync}
                      placeholder="0"
                      className="w-full text-sm font-black text-foreground bg-slate-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-primary/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="flex flex-col">
                <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Kategori</label>
                <div className="flex gap-1.5 flex-wrap">
                  {getCategoriesForType(editingTxType).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setEditingTxCategory(tag)}
                      className={`px-3.5 py-1 rounded-full text-[11px] font-bold border transition-all duration-200 cursor-pointer hover:-translate-y-0.25 ${editingTxCategory === tag
                        ? 'border-primary bg-[#e8f4ec] dark:bg-emerald-950/40 text-primary'
                        : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div className="flex flex-col">
                <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">
                  Tanggal {editingTxIsAutoSync && "🔒"}
                </label>
                <input
                  type="date"
                  value={editingTxDate}
                  onChange={(e) => setEditingTxDate(e.target.value)}
                  disabled={editingTxIsAutoSync}
                  className="w-full text-xs font-extrabold text-foreground bg-slate-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4.5 bg-slate-50/50 dark:bg-gray-900/20 border-t border-gray-100 dark:border-gray-800/80 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-3 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-black text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-gray-900/50 active:scale-[0.98] transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEditTransaction}
                className={`flex-1 text-white py-3 rounded-xl font-black text-xs active:scale-[0.98] transition-all cursor-pointer ${
                  editingTxType === 'income'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-[0_4px_12px_rgba(16,185,129,0.25)]'
                    : editingTxType === 'transfer'
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-[0_4px_12px_rgba(37,99,235,0.25)]'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-[0_4px_12px_rgba(225,29,72,0.25)]'
                }`}
              >
                {editingTxType === 'income'
                  ? 'Simpan Pemasukan 💰'
                  : editingTxType === 'transfer'
                  ? 'Simpan Transfer 🔄'
                  : 'Simpan Pengeluaran 💸'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-950 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Body */}
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-black text-foreground">Hapus Transaksi?</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed px-2">
                  Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan dan akan memengaruhi perhitungan saving rate serta kesehatan hutan Anda.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-slate-50/50 dark:bg-gray-900/20 border-t border-gray-100 dark:border-gray-800/80 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingTxId(null);
                }}
                className="flex-1 py-3 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-black text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-gray-900/50 active:scale-[0.98] transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteTransaction}
                className="flex-1 bg-rose-500 text-white py-3 rounded-xl font-black text-xs hover:bg-rose-600 active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(239,68,68,0.15)] cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
