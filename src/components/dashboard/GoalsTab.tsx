import { useState, useEffect, useMemo } from "react";
import { Target, Wallet, TrendingUp, Landmark, ArrowRight, Save, Coins, ArrowDownCircle, AlertCircle, Calendar } from "lucide-react";
import { useAppStore } from "@/src/store/useAppStore";
import { createClient } from "@/src/utils/supabase/client";

export default function SavingsTab() {
  const { 
    monthlyIncomeTarget, 
    monthlySavingsTarget, 
    budgetResetDate,
    updateMonthlyTargets, 
    withdrawFromSavings,
    isDemo, 
    transactions 
  } = useAppStore();
  
  const [income, setIncome] = useState("");
  const [savings, setSavings] = useState("");
  const [resetDate, setResetDate] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // State untuk Withdrawal
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawReason, setWithdrawReason] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setUserId(session.user.id);
    };
    fetchUser();
    
    setIncome(monthlyIncomeTarget.toString());
    setSavings(monthlySavingsTarget.toString());
    setResetDate(budgetResetDate);
  }, [monthlyIncomeTarget, monthlySavingsTarget, budgetResetDate]);

  const handleSaveTargets = async () => {
    if (!userId || isDemo) return;
    setIsSaving(true);
    const incomeVal = parseInt(income.replace(/[^0-9]/g, "")) || 0;
    const savingsVal = parseInt(savings.replace(/[^0-9]/g, "")) || 0;
    
    await updateMonthlyTargets(userId, incomeVal, savingsVal, resetDate);
    setIsSaving(false);
  };

  const handleWithdraw = async () => {
    if (!userId || isDemo) return;
    const amount = parseInt(withdrawAmount.replace(/[^0-9]/g, "")) || 0;
    if (amount <= 0) return;

    await withdrawFromSavings(userId, amount, withdrawReason);
    setShowWithdrawModal(false);
    setWithdrawAmount("");
    setWithdrawReason("");
  };

  const formatCurrency = (val: string) => {
    const num = parseInt(val.replace(/[^0-9]/g, ""));
    return isNaN(num) ? "" : num.toLocaleString('id-ID');
  };

  // Kalkulasi Kas Tersedia: Total Income - Total Expense (tidak termasuk transfer/withdraw internal)
  // Namun sesuai logika user: "Kas Tersedia" adalah akumulasi pemasukan yang masuk.
  // Kita hitung Kas Tersedia = (Total Income) - (Total Expense) 
  const availableCash = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return Math.max(0, totalIncome - totalExpense);
  }, [transactions]);

  const remainder = Math.max(0, parseInt(income.replace(/[^0-9]/g, "") || "0") - parseInt(savings.replace(/[^0-9]/g, "") || "0"));

  return (
    <div className="flex flex-col text-foreground font-sans relative">
      
      {/* Modal Withdrawal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowWithdrawModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 w-full max-w-md p-8 rounded-[32px] shadow-2xl border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black mb-2 flex items-center gap-2">
              <ArrowDownCircle className="w-6 h-6 text-rose-500" />
              Ambil dari Tabungan
            </h3>
            <p className="text-sm text-muted-foreground mb-6">Dana akan dikembalikan ke Kas Tersedia untuk dipakai transaksi.</p>
            
            <div className="space-y-4 mb-8">
              <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Nominal Tarik</label>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-muted-foreground text-lg">Rp</span>
                  <input 
                    type="text" 
                    value={formatCurrency(withdrawAmount)}
                    onChange={(e) => setWithdrawAmount(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="0"
                    className="w-full bg-transparent text-xl font-black outline-none"
                  />
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Alasan (Opsional)</label>
                <input 
                  type="text" 
                  value={withdrawReason}
                  onChange={(e) => setWithdrawReason(e.target.value)}
                  placeholder="Contoh: Dana Darurat Kesehatan"
                  className="w-full bg-transparent text-sm font-semibold outline-none"
                />
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
                  <strong>Peringatan Visual:</strong> Mengambil dana ini akan menunda target tabunganmu sekitar <span className="font-bold">2 bulan</span>. Pikirkan kembali sebelum melanjutkan.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleWithdraw}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-rose-500/20 transition-all active:scale-[0.98]"
              >
                Ya, Tarik Dana
              </button>
              <button 
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold py-4 rounded-2xl transition-all"
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kas Tersedia & Withdrawal Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Kas Tersedia</p>
            <p className="text-2xl font-black text-foreground">Rp {availableCash.toLocaleString('id-ID')}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center">
            <Wallet className="w-6 h-6 text-primary" />
          </div>
        </div>

        <button 
          onClick={() => setShowWithdrawModal(true)}
          className="bg-white dark:bg-gray-900 p-6 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-gray-800 transition-all group"
        >
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Tabungan</p>
            <p className="text-2xl font-black text-rose-500">Rp {monthlySavingsTarget.toLocaleString('id-ID')}</p>
          </div>
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowDownCircle className="w-6 h-6 text-rose-500" />
          </div>
        </button>
      </div>
      
      {/* Set Perencanaan Section */}
      <div className="bg-white dark:bg-gray-900 rounded-[28px] p-8 shadow-sm border border-gray-50 dark:border-gray-800 mb-6 relative">
        <h3 className="text-sm font-black text-foreground mb-6 uppercase tracking-widest flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Siklus Budget Bulanan
        </h3>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-2 block">Pemasukan Bulanan</label>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                <span className="font-bold text-muted-foreground">Rp</span>
                <input 
                  type="text" 
                  value={formatCurrency(income)}
                  onChange={(e) => setIncome(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-full bg-transparent text-lg font-black outline-none"
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-2 block">Tanggal Reset Budget</label>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <select 
                  value={resetDate}
                  onChange={(e) => setResetDate(parseInt(e.target.value))}
                  className="w-full bg-transparent text-lg font-black outline-none cursor-pointer"
                >
                  {[...Array(31)].map((_, i) => (
                    <option key={i+1} value={i+1}>Tanggal {i+1}</option>
                  ))}
                </select>
              </div>
              <p className="text-[9px] text-muted-foreground mt-2 ml-1">Misal: Tanggal 25 saat kiriman ortu datang.</p>
            </div>
          </div>

          <div className="relative">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-2 block">Alokasi Tabungan (intentional)</label>
            <div className="flex items-center gap-3 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/20">
              <span className="text-lg font-bold text-primary">Rp</span>
              <input 
                type="text" 
                value={formatCurrency(savings)}
                onChange={(e) => setSavings(e.target.value.replace(/[^0-9]/g, ""))}
                className="w-full bg-transparent text-xl font-black text-primary outline-none"
              />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Sisa Untuk Budget</p>
              <p className="text-xl font-black text-foreground">Rp {remainder.toLocaleString('id-ID')}</p>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Ratio Tabungan</p>
               <p className="text-xl font-black text-primary">{income > "0" ? Math.round((parseInt(savings) / parseInt(income)) * 100) : 0}%</p>
            </div>
          </div>

          <button 
            onClick={handleSaveTargets}
            disabled={isSaving || isDemo}
            className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-lg hover:bg-emerald-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Save className="w-5 h-5" /> Simpan Siklus Baru</>
            )}
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-[24px] border border-gray-100 dark:border-gray-800 flex gap-4">
         <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-indigo-500" />
         </div>
         <div>
            <p className="text-[14px] font-bold mb-1">Filosofi Kas & Tabungan</p>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
               Pemasukan harian masuk ke <strong className="text-foreground">Kas Tersedia</strong>. Gunakan momen tanggal reset untuk memindahkan dana ke <strong className="text-primary">Tabungan</strong> secara sadar. Jika ada darurat, kamu selalu bisa menariknya kembali tanpa hukuman drastis.
            </p>
         </div>
      </div>
    </div>
  );
}