import { useState, useEffect, useMemo } from "react";
import { Target, Wallet, TrendingUp, Landmark, ArrowRight, Save, Coins, ArrowDownCircle, AlertCircle, Calendar, Edit2, Plus, Trash2, CheckCircle2, Sparkles } from "lucide-react";
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
    transactions,
    mainGoal,
    updateMainGoal,
    deleteMainGoal
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

  // Pre-fill values when editing the dream goal
  useEffect(() => {
    if (showGoalModal && mainGoal) {
      setNewGoalName(mainGoal.name);
      setNewGoalPrice(mainGoal.target.toString());
    } else if (showGoalModal && !mainGoal) {
      setNewGoalName("");
      setNewGoalPrice("");
    }
  }, [showGoalModal, mainGoal]);

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
    if (isDemo) return 650000;
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return Math.max(0, totalIncome - totalExpense);
  }, [transactions, isDemo]);

  const currentSavings = useMemo(() => {
    if (isDemo) return 850000;
    return monthlySavingsTarget;
  }, [monthlySavingsTarget, isDemo]);

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
                   updateMainGoal(userId || 'demo', newGoalName, price);
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

      {/* Kas Tersedia Section (Enhanced shadows, micro-interaction elevations) */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-[22px] border border-gray-100 dark:border-gray-800/80 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex items-center justify-between hover:border-primary/20 hover:shadow-[0_8px_20px_rgba(42,106,85,0.04)] transition-all duration-300">
          <div>
            <p className="text-[9px] font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-1.5">Kas Tersedia</p>
            <p className="text-xl sm:text-2xl font-black text-foreground">Rp {availableCash.toLocaleString('id-ID')}</p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100/10">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-[22px] border border-gray-100 dark:border-gray-800/80 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex items-center justify-between hover:border-rose-500/20 hover:shadow-[0_8px_20px_rgba(244,63,94,0.03)] transition-all duration-300">
          <div>
            <p className="text-[9px] font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-1.5">Total Tabungan</p>
            <p className="text-xl sm:text-2xl font-black text-rose-500">Rp {currentSavings.toLocaleString('id-ID')}</p>
          </div>
          <div className="w-10 h-10 bg-rose-50 dark:bg-rose-950/40 rounded-xl flex items-center justify-center shrink-0 border border-rose-100/10">
            <Coins className="w-5 h-5 text-rose-500" />
          </div>
        </div>
      </div>
      
      {/* Perencanaan Section (Premium Deep Forest Emerald Gradient Card) */}
      {!isEditing ? (
        <div className="bg-gradient-to-br from-primary to-[#133e31] dark:from-[#174f3a] dark:to-[#0a2018] p-5 sm:p-6 rounded-[28px] shadow-[0_10px_30px_rgba(42,106,85,0.15)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)] mb-6 relative overflow-hidden group border border-emerald-500/10 dark:border-emerald-400/10 transition-all duration-300 hover:shadow-[0_15px_35px_rgba(42,106,85,0.22)]">
          <div className="absolute top-0 right-0 p-6 text-white/5 group-hover:rotate-12 group-hover:scale-105 transition-all duration-500 select-none pointer-events-none">
            <Target className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-emerald-100 font-extrabold text-[9px] uppercase tracking-widest mb-0.5 leading-none">Siklus Aktif</p>
                  <h3 className="text-white text-lg sm:text-xl font-black mt-1">Budget {new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</h3>
                </div>
                {isDemo && (
                    <span className="bg-white/20 text-white text-[8px] font-black px-1.5 py-0.5 rounded border border-white/20">DEMO</span>
                )}
              </div>
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-white/15 hover:bg-white/25 backdrop-blur-md p-2 px-3.5 rounded-xl text-white transition-all active:scale-95 flex items-center gap-1.5 text-[10px] font-black cursor-pointer shadow-xs border border-white/10"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6 border-b border-white/5 pb-5">
               <div>
                  <p className="text-emerald-200 font-extrabold text-[9px] uppercase tracking-widest mb-1.5 leading-none">Pemasukan</p>
                  <p className="text-white text-base sm:text-lg font-black">Rp {monthlyIncomeTarget.toLocaleString('id-ID')}</p>
               </div>
               <div>
                  <p className="text-emerald-200 font-extrabold text-[9px] uppercase tracking-widest mb-1.5 leading-none">Tabungan</p>
                  <p className="text-white text-base sm:text-lg font-black">Rp {monthlySavingsTarget.toLocaleString('id-ID')}</p>
               </div>
               <div>
                  <p className="text-emerald-200 font-extrabold text-[9px] uppercase tracking-widest mb-1.5 leading-none">Budget Belanja</p>
                  <p className="text-white text-base sm:text-lg font-black">Rp {(monthlyIncomeTarget - monthlySavingsTarget).toLocaleString('id-ID')}</p>
               </div>
            </div>

            <div className="bg-emerald-950/20 dark:bg-emerald-950/40 rounded-xl p-3 flex items-center gap-2.5 border border-white/5 shadow-inner">
              <Calendar className="w-3.5 h-3.5 text-emerald-300" />
              <p className="text-[10px] text-emerald-100 font-bold leading-none">Reset pada tanggal <strong>{budgetResetDate}</strong> tiap bulan.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-[28px] p-5 sm:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-gray-800/80 mb-6 animate-in slide-in-from-top-2 duration-300">
           <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Edit2 className="w-3.5 h-3.5 text-primary" />
              Atur Siklus Keuangan
            </h3>
            {(monthlyIncomeTarget > 0 || isDemo) && (
              <button onClick={() => setIsEditing(false)} className="text-[10px] font-black text-gray-500 hover:text-foreground cursor-pointer transition-colors">Batal</button>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <div className="flex justify-between items-center mb-1.5 ml-0.5">
                  <label className="text-[9px] font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest block">Pemasukan</label>
                  {!isDemo && (
                    <button 
                        onClick={() => {
                        const totalIncome = transactions
                            .filter(t => t.type === 'income')
                            .reduce((sum, t) => sum + t.amount, 0);
                        setIncome(totalIncome.toString());
                        }}
                        className="flex items-center gap-1 text-[8px] font-black text-primary hover:bg-emerald-50 dark:hover:bg-emerald-950/30 px-1.5 py-0.5 rounded transition-all cursor-pointer border border-emerald-100/10"
                    >
                        <Sparkles className="w-2.5 h-2.5" /> Transaksi
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-gray-800/60 p-2.5 px-3 rounded-xl border border-gray-100 dark:border-gray-800">
                  <span className="text-xs font-black text-gray-500 dark:text-gray-400">Rp</span>
                  <input 
                    type="text" 
                    value={isDemo ? monthlyIncomeTarget.toLocaleString('id-ID') : formatCurrency(income)}
                    disabled={isDemo}
                    onChange={(e) => setIncome(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full bg-transparent text-sm font-black outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-[9px] font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest ml-0.5 mb-1.5 block">Tanggal Reset</label>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-gray-800/60 p-2.5 px-3 rounded-xl border border-gray-100 dark:border-gray-800">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <select 
                    value={resetDate}
                    disabled={isDemo}
                    onChange={(e) => setResetDate(parseInt(e.target.value))}
                    className="w-full bg-transparent text-xs font-black outline-none cursor-pointer disabled:opacity-50"
                  >
                    {[...Array(31)].map((_, i) => (
                      <option key={i+1} value={i+1}>Tanggal {i+1}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="relative">
              <label className="text-[9px] font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest ml-0.5 mb-1.5 block">Mau ditabung berapa?</label>
              <div className="flex items-center gap-2 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 px-3 rounded-xl border border-emerald-100/50 dark:border-emerald-900/20">
                <span className="text-xs font-black text-primary">Rp</span>
                <input 
                  type="text" 
                  value={isDemo ? monthlySavingsTarget.toLocaleString('id-ID') : formatCurrency(savings)}
                  disabled={isDemo}
                  onChange={(e) => setSavings(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-full bg-transparent text-sm font-black text-primary outline-none disabled:opacity-50"
                />
              </div>
            </div>

            <button 
              onClick={handleSaveTargets}
              disabled={isSaving || isDemo}
              className="w-full bg-primary text-white font-black py-3 rounded-xl shadow-md hover:bg-emerald-700 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isDemo ? (
                <><Save className="w-4 h-4" /> Fitur Dikunci (Demo)</>
              ) : (
                <><Save className="w-4 h-4" /> Simpan Siklus Baru</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Satu Impian Utama Section (Glowing High-Prestige North Star target box) */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest px-2 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
          Impian Utama Anda
        </h3>
        
        {mainGoal ? (
          <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-[28px] border border-gray-100 dark:border-gray-800/80 shadow-[0_8px_30px_rgba(42,106,85,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)] relative overflow-hidden group hover:shadow-[0_12px_32px_rgba(42,106,85,0.12)] hover:-translate-y-0.5 transition-all duration-300">
            {/* Glowing spot underlying */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                 <div className="flex items-center gap-3 mb-4.5">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100/10 shadow-inner">
                       <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                       <div className="flex items-center gap-2">
                          <h4 className="text-base sm:text-lg font-black text-foreground leading-none">{mainGoal.name}</h4>
                          <span className="text-[8px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-250/20 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse leading-none">
                             🔥 Target Utama
                          </span>
                       </div>
                       <p className="text-[9px] font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest mt-2 leading-none">Target: Rp {mainGoal.target.toLocaleString('id-ID')}</p>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <div className="flex justify-between items-end px-0.5">
                       <p className="text-[9px] font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest">Progress Tabungan</p>
                       <p className="text-lg sm:text-xl font-black text-primary leading-none">{Math.round((currentSavings / mainGoal.target) * 100)}%</p>
                    </div>
                    
                    {/* Shimmering Emerald Target Quest Progress Bar */}
                    <div className="h-3.5 w-full bg-slate-100 dark:bg-gray-800/80 rounded-full overflow-hidden border border-gray-100 dark:border-gray-800/80 shadow-inner relative">
                       <div 
                         className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-shimmer" 
                         style={{ width: `${Math.min(100, (currentSavings / mainGoal.target) * 100)}%` }} 
                       />
                    </div>
                    <div className="flex justify-between text-[9px] font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest px-0.5 leading-none">
                       <span>Terkumpul Rp {currentSavings.toLocaleString('id-ID')}</span>
                       <span>Kurang Rp {Math.max(0, mainGoal.target - currentSavings).toLocaleString('id-ID')}</span>
                    </div>
                 </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0 md:min-w-[130px]">
                 <button 
                   onClick={() => setShowGoalModal(true)}
                   className="bg-slate-50 dark:bg-gray-800/60 hover:bg-slate-100 dark:hover:bg-gray-700/80 text-foreground font-black py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer border border-gray-100 dark:border-gray-700/50"
                 >
                   <Edit2 className="w-3.5 h-3.5" /> Ganti Impian
                 </button>
                 <button 
                    onClick={() => setShowWithdrawModal(true)}
                    className="bg-rose-50 dark:bg-rose-950/20 text-rose-500 font-black py-2.5 px-4 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer border border-rose-100/10"
                 >
                    <ArrowDownCircle className="w-3.5 h-3.5" /> Tarik Dana
                 </button>
              </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setShowGoalModal(true)}
            className="w-full bg-white dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-800 p-10 rounded-[28px] flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-gray-800/30 transition-all group cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.01)]"
          >
            <div className="w-14 h-14 bg-slate-50 dark:bg-gray-800/80 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 transition-all border border-gray-100 dark:border-gray-850">
               <Plus className="w-6 h-6 text-gray-500 group-hover:text-primary animate-pulse" />
            </div>
            <div className="text-center">
               <p className="text-sm font-black text-foreground">Tentukan Impian Utamamu</p>
               <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold mt-1">Beri nama barang yang ingin kamu beli agar nabung lebih semangat.</p>
            </div>
          </button>
        )}
      </div>

      {/* Info Card Carry Over (High contrast, premium typography) */}
      <div className="mt-8 bg-indigo-50/70 dark:bg-indigo-950/20 p-5 rounded-[24px] border border-indigo-100/50 dark:border-indigo-900/30 flex gap-3.5 hover:shadow-[0_4px_16px_rgba(99,102,241,0.03)] transition-shadow duration-300">
         <div className="w-10 h-10 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center shrink-0 shadow-xs border border-indigo-100/20">
            <CheckCircle2 className="w-5 h-5 text-indigo-500" />
         </div>
         <div>
            <p className="text-xs font-black text-indigo-900 dark:text-indigo-250 uppercase tracking-widest mb-1.5 leading-none">Carry Over Otomatis</p>
            <p className="text-[12px] text-indigo-950 dark:text-indigo-200 leading-relaxed font-semibold">
               Sisa budget dari bulan lalu tidak hangus, tapi otomatis ditambahkan ke <strong className="text-indigo-900 dark:text-indigo-100 underline decoration-indigo-300 dark:decoration-indigo-500">Kas Tersedia</strong> bulan baru. Hemat hari ini = modal lebih besar untuk impianmu besok!
            </p>
         </div>
      </div>
    </div>
  );
}