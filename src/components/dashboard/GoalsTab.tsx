import { useState, useEffect, useMemo } from "react";
import { Target, Wallet, TrendingUp, Landmark, ArrowRight, Save, Coins, ArrowDownCircle, AlertCircle, Calendar, Edit2, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/src/store/useAppStore";
import { createClient } from "@/src/utils/supabase/client";

export default function GoalsTab() {
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
  const [isEditing, setIsEditing] = useState(false);

  // State untuk Withdrawal
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawReason, setWithdrawReason] = useState("");

  // State untuk Satu Impian Utama
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalPrice, setNewGoalPrice] = useState("");
  
  // Single Goal State (null jika belum set)
  const [mainGoal, setMainGoal] = useState<{name: string, target: number, color: string} | null>({
    name: 'Laptop MacBook Air',
    target: 15000000,
    color: 'bg-primary'
  });

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
    
    if (monthlyIncomeTarget > 0) setIsEditing(false);
    else setIsEditing(true);
  }, [monthlyIncomeTarget, monthlySavingsTarget, budgetResetDate]);

  const handleSaveTargets = async () => {
    if (!userId || isDemo) return;
    setIsSaving(true);
    const incomeVal = parseInt(income.replace(/[^0-9]/g, "")) || 0;
    const savingsVal = parseInt(savings.replace(/[^0-9]/g, "")) || 0;
    
    await updateMonthlyTargets(userId, incomeVal, savingsVal, resetDate);
    setIsSaving(false);
    setIsEditing(false);
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

  const availableCash = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return Math.max(0, totalIncome - totalExpense);
  }, [transactions]);

  const currentSavings = monthlySavingsTarget; // Sementara menggunakan total tabungan bulan ini

  return (
    <div className="flex flex-col text-foreground font-sans relative pb-20">
      
      {/* Modal Add Goal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowGoalModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 w-full max-w-md p-8 rounded-[32px] shadow-2xl border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black mb-2 flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              Tentukan Impian Utama
            </h3>
            <p className="text-sm text-muted-foreground mb-6">Fokus pada satu hal yang paling ingin kamu capai saat ini.</p>
            
            <div className="space-y-4 mb-8">
              <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Nama Impian</label>
                <input 
                  type="text" 
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  placeholder="Contoh: Laptop Kerja"
                  className="w-full bg-transparent text-lg font-bold outline-none"
                />
              </div>
              <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Target Harga</label>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-muted-foreground text-lg">Rp</span>
                  <input 
                    type="text" 
                    value={formatCurrency(newGoalPrice)}
                    onChange={(e) => setNewGoalPrice(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="0"
                    className="w-full bg-transparent text-xl font-black outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => {
                   const price = parseInt(newGoalPrice.replace(/[^0-9]/g, "")) || 0;
                   if (!newGoalName || price <= 0) return;
                   setMainGoal({
                      name: newGoalName,
                      target: price,
                      color: 'bg-primary'
                   });
                   setShowGoalModal(false);
                }}
                className="flex-1 bg-primary hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98]"
              >
                Mulai Kejar Impian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kas Tersedia Section */}
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

        <div className="bg-white dark:bg-gray-900 p-6 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Tabungan</p>
            <p className="text-2xl font-black text-rose-500">Rp {monthlySavingsTarget.toLocaleString('id-ID')}</p>
          </div>
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/30 rounded-2xl flex items-center justify-center">
            <Coins className="w-6 h-6 text-rose-500" />
          </div>
        </div>
      </div>
      
      {/* Perencanaan Section */}
      {!isEditing ? (
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 mb-8 flex justify-between items-center">
          <div>
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Siklus Aktif</p>
             <h3 className="text-xl font-black text-foreground">{new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</h3>
             <p className="text-[11px] text-muted-foreground mt-1">Pemasukan Target: <span className="text-foreground font-bold">Rp {monthlyIncomeTarget.toLocaleString('id-ID')}</span></p>
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="w-12 h-12 bg-slate-50 dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-2xl flex items-center justify-center transition-all"
          >
            <Edit2 className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8 animate-in slide-in-from-top-2 duration-300">
           {/* ... Form input tetap sama ... */}
           <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-primary" />
              Atur Siklus Keuangan
            </h3>
            {monthlyIncomeTarget > 0 && (
              <button onClick={() => setIsEditing(false)} className="text-xs font-bold text-muted-foreground hover:text-foreground">Batal</button>
            )}
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-2 block">Pemasukan</label>
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
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-2 block">Tanggal Reset</label>
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
              </div>
            </div>

            <div className="relative">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-2 block">Mau ditabung berapa?</label>
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
      )}

      {/* Satu Impian Utama Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-foreground px-2">Impian Utama Anda</h3>
        
        {mainGoal ? (
          <div className="bg-white dark:bg-gray-900 p-10 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-xl relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex-1">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                       <Target className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                       <h4 className="text-2xl font-black text-foreground">{mainGoal.name}</h4>
                       <p className="text-sm text-muted-foreground font-bold">Target Harga: Rp {mainGoal.target.toLocaleString('id-ID')}</p>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <div className="flex justify-between items-end">
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Progress Tabungan</p>
                       <p className="text-xl font-black text-primary">{Math.round((currentSavings / mainGoal.target) * 100)}%</p>
                    </div>
                    <div className="h-4 w-full bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
                         style={{ width: `${Math.min(100, (currentSavings / mainGoal.target) * 100)}%` }} 
                       />
                    </div>
                    <div className="flex justify-between text-xs font-bold text-muted-foreground">
                       <span>Terkumpul Rp {currentSavings.toLocaleString('id-ID')}</span>
                       <span>Kurang Rp {Math.max(0, mainGoal.target - currentSavings).toLocaleString('id-ID')}</span>
                    </div>
                 </div>
              </div>

              <div className="flex flex-col gap-3">
                 <button 
                   onClick={() => setShowGoalModal(true)}
                   className="bg-slate-50 dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 text-foreground font-bold py-3 px-6 rounded-2xl transition-all flex items-center justify-center gap-2"
                 >
                   <Edit2 className="w-4 h-4" /> Ganti Impian
                 </button>
                 <button 
                    onClick={() => setShowWithdrawModal(true)}
                    className="bg-rose-50 dark:bg-rose-950/20 text-rose-500 font-bold py-3 px-6 rounded-2xl hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-all flex items-center justify-center gap-2"
                 >
                    <ArrowDownCircle className="w-4 h-4" /> Tarik Dana
                 </button>
              </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setShowGoalModal(true)}
            className="w-full bg-white dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-800 p-16 rounded-[40px] flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-gray-800 transition-all group"
          >
            <div className="w-20 h-20 bg-slate-50 dark:bg-gray-800 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 transition-all">
               <Plus className="w-10 h-10 text-muted-foreground group-hover:text-primary" />
            </div>
            <div className="text-center">
               <p className="text-lg font-black text-foreground">Tentukan Impian Utamamu</p>
               <p className="text-sm text-muted-foreground font-medium">Beri nama barang yang ingin kamu beli agar nabung lebih semangat.</p>
            </div>
          </button>
        )}
      </div>

      {/* Info Card Carry Over */}
      <div className="mt-10 bg-indigo-50 dark:bg-indigo-950/20 p-6 rounded-[28px] border border-indigo-100/50 dark:border-indigo-900/30 flex gap-4">
         <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
            <CheckCircle2 className="w-6 h-6 text-indigo-500" />
         </div>
         <div>
            <p className="text-[14px] font-bold text-indigo-900 dark:text-indigo-100 mb-1">Carry Over Otomatis</p>
            <p className="text-[11px] text-indigo-700/70 dark:text-indigo-300/70 leading-relaxed font-medium">
               Sisa budget dari bulan lalu tidak hangus, tapi otomatis ditambahkan ke <strong className="text-indigo-900 dark:text-indigo-200 underline decoration-indigo-300">Kas Tersedia</strong> bulan baru. Hemat hari ini = modal lebih besar untuk impianmu besok!
            </p>
         </div>
      </div>
    </div>
  );
}