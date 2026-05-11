import { useState } from "react";
import { Zap, Plus, X, Landmark, Coins, Settings2 } from "lucide-react";
import { useAppStore } from "@/src/store/useAppStore";

export default function GoalsTab() {
  const { isDemo } = useAppStore();

  // 1. Data Goals dengan State Dinamis (hanya menggunakan mock saat di mode Demo)
  const [goals, setGoals] = useState(() => {
    if (isDemo) {
      return [
        {
          id: 1,
          title: "Laptop Baru",
          icon: "💻",
          targetDate: "Agustus 2026",
          monthsLeft: 3,
          collected: 2400000,
          target: 8000000,
          color: "bg-blue-500",
          bgLight: "bg-blue-50 dark:bg-blue-950/30",
          autoAlloc: 600000,
          isAutoAllocActive: true,
        },
        {
          id: 2,
          title: "Liburan Bali",
          icon: "✈️",
          targetDate: "Desember 2026",
          monthsLeft: 7,
          collected: 800000,
          target: 3000000,
          color: "bg-orange-500",
          bgLight: "bg-orange-50 dark:bg-orange-950/30",
          autoAlloc: 300000,
          isAutoAllocActive: true,
        }
      ];
    }
    return [];
  });

  // State untuk mengontrol Form Tambah Goal
  const [showForm, setShowForm] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [newGoalAutoAlloc, setNewGoalAutoAlloc] = useState("");

  // State untuk input alokasi manual temporer per goal id
  const [allocatingGoalId, setAllocatingGoalId] = useState<number | null>(null);
  const [manualAllocAmount, setManualAllocAmount] = useState("");

  // 3. Simpan Goal baru
  const handleAddGoal = () => {
    if (isDemo) return;
    if (!newGoalTitle || !newGoalTarget) return;

    const targetNum = parseInt(newGoalTarget.replace(/[^0-9]/g, ""));
    const autoAllocNum = parseInt(newGoalAutoAlloc.replace(/[^0-9]/g, "")) || 0;
    if (isNaN(targetNum)) return;

    const newGoal = {
      id: Date.now(),
      title: newGoalTitle,
      icon: "🎯",
      targetDate: "Desember 2026",
      monthsLeft: 12,
      collected: 0,
      target: targetNum,
      color: "bg-emerald-500",
      bgLight: "bg-emerald-50 dark:bg-emerald-950/30",
      autoAlloc: autoAllocNum,
      isAutoAllocActive: autoAllocNum > 0,
    };

    setGoals([...goals, newGoal]);
    setShowForm(false);
    setNewGoalTitle("");
    setNewGoalTarget("");
    setNewGoalAutoAlloc("");
  };

  // 4. Lakukan alokasi dana manual eksplisit dari Sisa Budget
  const handleAllocate = (goalId: number, amount: number) => {
    if (isDemo) return;
    if (amount <= 0) return;
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        return {
          ...g,
          collected: Math.min(g.collected + amount, g.target)
        };
      }
      return g;
    }));
    setAllocatingGoalId(null);
    setManualAllocAmount("");
  };

  // Toggle status Auto-Alokasi Sistem
  const toggleAutoAlloc = (goalId: number) => {
    if (isDemo) return;
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        return {
          ...g,
          isAutoAllocActive: !g.isAutoAllocActive
        };
      }
      return g;
    }));
  };

  // Helper untuk format angka ke Rupiah
  const formatRp = (num: number) => num.toLocaleString("id-ID");

  return (
    <div className="flex flex-col space-y-4 text-foreground font-sans">
      
      {/* Alokasi Penjelasan */}
      <div className="bg-gradient-to-r from-emerald-50/60 to-teal-50/40 dark:from-emerald-950/20 dark:to-teal-950/10 border border-emerald-100/70 dark:border-emerald-900/20 rounded-[20px] p-4 text-[12.5px] font-medium text-emerald-800 dark:text-emerald-300 leading-relaxed">
        💡 <strong>Konsep Alokasi Eksplisit:</strong> Akumulasi dana di bawah dikumpulkan secara mandiri dari sisa budget bulanan, terpisah dari saldo rekening real Anda.
      </div>

      {/* Looping semua data Goals */}
      {goals.map((goal) => {
        const pct = Math.min((goal.collected / goal.target) * 100, 100);
        const isAllocatingThis = allocatingGoalId === goal.id;

        return (
          <div key={goal.id} className="bg-white dark:bg-gray-900 rounded-[24px] p-6 shadow-sm border border-gray-50 dark:border-gray-800 transition-all hover:border-emerald-500/10">
            <div className="flex items-center gap-4 mb-5">
              <div className={`w-14 h-14 rounded-[16px] ${goal.bgLight} flex items-center justify-center text-3xl shrink-0`}>
                {goal.icon}
              </div>
              <div className="flex-1">
                <div className="text-[16px] font-bold text-foreground">{goal.title}</div>
                <div className="text-[12px] font-medium text-muted-foreground mt-1">
                  Target: {goal.targetDate} · {goal.monthsLeft} bulan lagi
                </div>
              </div>
            </div>

            <div className="flex justify-between text-[12px] font-semibold text-muted-foreground mb-2.5">
              <span>Terkumpul (Alokasi Akumulasi)</span>
              <span className="text-foreground">Rp {formatRp(goal.collected)} / {formatRp(goal.target)}</span>
            </div>

            <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-5 shadow-inner">
              <div className={`h-full rounded-full ${goal.color} transition-all duration-500`} style={{ width: `${pct}%` }}></div>
            </div>

            {/* Action Section: Explicit Allocations */}
            <div className="flex flex-col gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                {/* Auto allocation info */}
                <button 
                  onClick={() => toggleAutoAlloc(goal.id)}
                  className={`text-[12px] font-medium flex items-center gap-1.5 py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
                    goal.isAutoAllocActive 
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-primary font-bold" 
                      : "bg-gray-50 dark:bg-gray-850 text-muted-foreground"
                  }`}
                  title="Klik untuk aktifkan/nonaktifkan auto-alokasi"
                >
                  <Zap className={`w-3.5 h-3.5 ${goal.isAutoAllocActive ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                  Auto-Alokasi: <span className="font-bold">{goal.isAutoAllocActive ? `Rp ${formatRp(goal.autoAlloc)}` : 'Nonaktif'}/bln</span>
                </button>

                {/* Manual Allocate Trigger */}
                {!isAllocatingThis && (
                  <button 
                    onClick={() => setAllocatingGoalId(goal.id)}
                    className="text-xs font-bold text-primary hover:text-primary-hover bg-[#e8f4ec] dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                  >
                    + Sisihkan Dana
                  </button>
                )}
              </div>

              {/* Manual explicit allocation drawer */}
              {isAllocatingThis && (
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl flex flex-col gap-2.5 animate-fade-in border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-muted-foreground">PILIH NOMINAL ALOKASI</span>
                    <button onClick={() => setAllocatingGoalId(null)} className="text-muted-foreground hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[50000, 100000, 250000].map((val) => (
                      <button 
                        key={val}
                        onClick={() => handleAllocate(goal.id, val)}
                        className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl py-2 text-xs font-bold text-foreground hover:border-primary hover:text-primary transition-all cursor-pointer"
                      >
                        + Rp {formatRp(val)}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl px-3 py-2 flex items-center gap-1.5">
                      <span className="text-xs font-bold text-muted-foreground">Rp</span>
                      <input 
                        type="text"
                        placeholder="Jumlah custom..."
                        value={manualAllocAmount}
                        onChange={(e) => setManualAllocAmount(e.target.value.replace(/[^0-9]/g, ""))}
                        className="w-full bg-transparent text-xs font-bold text-foreground outline-none"
                      />
                    </div>
                    <button 
                      onClick={() => handleAllocate(goal.id, parseInt(manualAllocAmount) || 0)}
                      className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shrink-0 cursor-pointer"
                    >
                      Konfirmasi
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Render Form Tambah Goal */}
      {showForm ? (
        <div className="bg-white dark:bg-gray-900 rounded-[24px] p-6 shadow-sm border border-emerald-300 dark:border-emerald-800">
          <div className="flex justify-between items-center mb-4">
            <div className="text-[14px] font-bold text-foreground">Target Baru</div>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-red-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Nama Goal (cth: Dana Darurat)"
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
            className="w-full mb-3 text-[14px] bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:border-primary text-foreground transition-colors"
          />
          <input
            type="text"
            placeholder="Target Dana (Rp)"
            value={newGoalTarget}
            onChange={(e) => setNewGoalTarget(e.target.value)}
            className="w-full mb-3 text-[14px] bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:border-primary text-foreground transition-colors"
          />
          <input
            type="text"
            placeholder="Auto Alokasi per Bulan (Rp)"
            value={newGoalAutoAlloc}
            onChange={(e) => setNewGoalAutoAlloc(e.target.value)}
            className="w-full mb-4 text-[14px] bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:border-primary text-foreground transition-colors"
          />
          <button
            onClick={handleAddGoal}
            className="w-full bg-primary text-white py-2.5 rounded-xl text-[13px] font-bold hover:bg-primary-hover transition-colors shadow-sm cursor-pointer"
          >
            Simpan Goal
          </button>
        </div>
      ) : (
        /* Render Tombol Tambah Goal */
        <div
          onClick={() => setShowForm(true)}
          className="bg-transparent border-2 border-dashed border-emerald-200 dark:border-emerald-900 rounded-[24px] cursor-pointer hover:bg-white dark:hover:bg-gray-900/40 hover:shadow-sm transition-all group"
        >
          <div className="text-center py-6 text-muted-foreground group-hover:text-primary flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-gray-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 flex items-center justify-center mb-2 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <div className="text-[13px] font-bold">Tambah Goal Baru</div>
          </div>
        </div>
      )}

    </div>
  );
}