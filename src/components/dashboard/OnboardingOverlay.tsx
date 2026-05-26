"use client";

import { useState, useMemo } from "react";
import { Sparkles, Calendar, Coins, Landmark, AlertCircle, Heart, CheckCircle2, ChevronRight, Leaf, Target, Mail } from "lucide-react";
import { useAppStore } from "@/src/store/useAppStore";
import { completeTutorialAction } from "@/src/app/actions/userActions";

interface OnboardingOverlayProps {
  userId: string;
}

export default function OnboardingOverlay({ userId }: OnboardingOverlayProps) {
  const { updateMonthlyTargets, addTransaction, completeTutorial } = useAppStore();

  // State Input
  const [income, setIncome] = useState("");
  const [savings, setSavings] = useState("");
  const [currentBalance, setCurrentBalance] = useState("");
  const [resetDate, setResetDate] = useState(1);

  // State UI/UX
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const formatCurrency = (val: string) => {
    const num = parseInt(val.replace(/[^0-9]/g, ""));
    return isNaN(num) ? "" : num.toLocaleString('id-ID');
  };

  // Parsed Values
  const incomeVal = useMemo(() => parseInt(income.replace(/[^0-9]/g, "")) || 0, [income]);
  const savingsVal = useMemo(() => parseInt(savings.replace(/[^0-9]/g, "")) || 0, [savings]);
  const currentBalanceVal = useMemo(() => parseInt(currentBalance.replace(/[^0-9]/g, "")) || 0, [currentBalance]);
  const remainingBudget = useMemo(() => Math.max(0, currentBalanceVal - savingsVal), [currentBalanceVal, savingsVal]);

  // Validasi & Navigasi Step
  const handleNext = () => {
    setErrorMsg("");
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      if (incomeVal <= 0) {
        setErrorMsg("Estimasi pemasukan bulanan harus diisi ya!");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (currentBalance.trim() === "") { setErrorMsg("Sisa uang saat ini harus diisi!"); return; }
      if (savings.trim() === "") { setErrorMsg("Target tabungan harus diisi! (Tulis 0 jika tidak ada target)"); return; }
      if (currentBalanceVal < 0) { setErrorMsg("Sisa uang saat ini tidak boleh kurang dari 0!"); return; }
      if (savingsVal < 0) { setErrorMsg("Target tabungan tidak boleh kurang dari 0!"); return; }
      if (savingsVal > incomeVal) { setErrorMsg("Target tabungan tidak logis jika melebihi total pemasukan!"); return; }
      if (savingsVal > currentBalanceVal) { setErrorMsg("Sisa uang di dompetmu saat ini tidak cukup untuk dipotong tabungan awal!"); return; }
      setStep(3); // Masuk ke step terakhir (Pengenalan Gamifikasi/Tutorial)
    }
  };

  const handleBack = () => {
    setErrorMsg("");
    setStep(s => s - 1);
  };

  // Simpan Data di Step Terakhir
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setErrorMsg("");

      // 1. Simpan target bulanan ke database & store
      await updateMonthlyTargets(userId, incomeVal, savingsVal, resetDate);

      // 2. Buat transaksi pertama: Sisa Uang Saat Ini
      await addTransaction({
        title: "Sisa Uang Saat Ini",
        amount: currentBalanceVal,
        category: "Lainnya",
        type: "income",
        date: new Date().toISOString()
      }, userId);

      // 3. Buat transaksi kedua: Alokasi Tabungan (Pay Yourself First)
      if (savingsVal > 0) {
        await addTransaction({
          title: "Alokasi Tabungan (Pay Yourself First)",
          amount: savingsVal,
          category: "Tabungan",
          type: "expense",
          date: new Date().toISOString()
        }, userId);
      }

      // 4. Selesaikan Tutorial secara permanen
      completeTutorial();
      completeTutorialAction();

    } catch (err) {
      console.error("Error setting onboarding targets:", err);
      setErrorMsg("Terjadi kesalahan saat menyimpan data. Silakan coba lagi.");
      setIsSaving(false); // Hanya matikan loading jika error (kalo sukses komponen akan unmount)
    }
  };

  // Data Konten per Step
  const stepContents = [
    {
      icon: <Calendar className="w-8 h-8 text-primary" />,
      title: "Selamat Datang! 🌱",
      desc: "Mari kita atur siklus keuanganmu. Kapan biasanya gajian atau uang saku bulananmu turun?"
    },
    {
      icon: <Landmark className="w-8 h-8 text-blue-500" />,
      title: "Target Pemasukan 💰",
      desc: "Berapa estimasi total pemasukan atau uang sakumu dalam satu bulan?"
    },
    {
      icon: <Target className="w-8 h-8 text-orange-500" />,
      title: "Pay Yourself First 🎯",
      desc: "Berapa uang yang tersisa di dompetmu sekarang? Jangan lupa, tentukan tabungan yang ingin langsung diamankan!"
    },
    {
      icon: <Leaf className="w-8 h-8 text-emerald-600" />,
      title: "Hutan Virtualmu Hidup! 🦋",
      desc: "Sisa uang belanja tadi akan menjadi 'Nyawa' hutanmu. Jajan hemat = hewan lucu datang. Jajan boros = pohon layu! Biarkan AI kami yang mencatat jajanmu otomatis via Gmail."
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md p-6 sm:p-8 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-emerald-500/20 dark:border-emerald-500/10 relative overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100 dark:bg-gray-800">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / stepContents.length) * 100}%` }}
          />
        </div>

        {/* Glow Background */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Dinamis Berdasarkan Step */}
        <div className="text-center mb-6 mt-4 relative z-10 animate-in slide-in-from-right-4 duration-300" key={`header-${step}`}>
          <div className="w-16 h-16 bg-slate-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100/10 shadow-inner">
            {stepContents[step].icon}
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight leading-tight">
            {stepContents[step].title}
          </h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed px-2 font-medium">
            {stepContents[step].desc}
          </p>
        </div>

        {/* Area Form / Error */}
        <div className="space-y-4 relative z-10 min-h-[160px]" key={`form-${step}`}>
          {errorMsg && (
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-3 flex items-start gap-2.5 animate-in shake">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-rose-900 dark:text-rose-200 leading-normal">{errorMsg}</p>
            </div>
          )}

          {/* STEP 0: Tanggal Siklus */}
          {step === 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 focus-within:border-primary/50 transition-colors">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1.5">Pilih Tanggal Mulai Siklus</label>
                <select
                  value={resetDate}
                  onChange={(e) => setResetDate(parseInt(e.target.value))}
                  className="w-full bg-transparent text-lg font-black outline-none cursor-pointer text-foreground"
                >
                  {[...Array(31)].map((_, i) => (
                    <option key={i + 1} value={i + 1} className="bg-white dark:bg-gray-900">Tanggal {i + 1}</option>
                  ))}
                </select>
              </div>
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-left">
                <p className="text-[10px] font-black text-primary uppercase tracking-wider mb-1 flex items-center gap-1">💡 Kenapa tanggal ini penting?</p>
                <p className="text-[9.5px] text-muted-foreground leading-relaxed font-semibold">
                  Tanggal ini adalah awal siklus keuangan bulananmu. Setiap tanggal ini tiba, sisa anggaran belanjamu akan di-reset (dihitung ulang) dan kesehatan hutan virtualmu akan diperbarui.
                </p>
              </div>
            </div>
          )}

          {/* STEP 1: Pemasukan Bulanan */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 focus-within:border-blue-500/50 transition-colors">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1.5">Total Pemasukan Sebulan</label>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-muted-foreground text-base">Rp</span>
                  <input
                    type="text"
                    value={income}
                    onChange={(e) => setIncome(formatCurrency(e.target.value))}
                    placeholder="0"
                    className="w-full bg-transparent text-2xl font-black outline-none text-foreground"
                    autoFocus
                  />
                </div>
              </div>
              <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-left">
                <p className="text-[10px] font-black text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1">💡 Apa itu total pemasukan?</p>
                <p className="text-[9.5px] text-muted-foreground leading-relaxed font-semibold">
                  Masukkan seluruh uang bulananmu (gaji, uang jajan dari ortu, beasiswa, atau hasil jualan). Ini digunakan sebagai dasar batas maksimal anggaran belanjamu bulan ini.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Sisa Uang & Tabungan */}
          {step === 2 && (
            <div className="space-y-3.5 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-slate-50 dark:bg-gray-800 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 focus-within:border-orange-500/50 transition-colors">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Sisa Uang Saat Ini</label>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-muted-foreground text-sm">Rp</span>
                  <input type="text" value={currentBalance} onChange={(e) => setCurrentBalance(formatCurrency(e.target.value))} placeholder="0" className="w-full bg-transparent text-xl font-black outline-none text-foreground" />
                </div>
                <p className="text-[9px] text-muted-foreground mt-1 pl-0.5 font-semibold">Total uang tunai, e-wallet, dan isi rekening bank aktifmu saat ini.</p>
              </div>

              <div className="bg-slate-50 dark:bg-gray-800 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 focus-within:border-orange-500/50 transition-colors">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1 flex justify-between">
                  Target Tabungan
                  <span className="text-[9px] text-primary normal-case font-black">Amankan dulu!</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-muted-foreground text-sm">Rp</span>
                  <input type="text" value={savings} onChange={(e) => setSavings(formatCurrency(e.target.value))} placeholder="0" className="w-full bg-transparent text-xl font-black outline-none text-foreground" />
                </div>
                <p className="text-[9px] text-muted-foreground mt-1 pl-0.5 font-semibold">Bagian dari pemasukan yang ingin langsung kamu simpan/tabung. (Tulis 0 jika tidak ada target)</p>
              </div>

              {/* Dynamic Math */}
              {currentBalanceVal > 0 && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 animate-in fade-in">
                  <div className="flex justify-between items-center text-xs font-bold mb-1">
                    <span className="text-muted-foreground">Uang Aktual:</span>
                    <span>Rp {currentBalanceVal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold mb-2">
                    <span className="text-muted-foreground">Dipotong Tabungan:</span>
                    <span className="text-rose-500">- Rp {savingsVal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="border-t border-dashed border-emerald-500/30 pt-2 flex justify-between items-center">
                    <span className="text-[10px] font-black text-primary flex items-center gap-1"><Heart className="w-3 h-3 fill-primary" /> NYAWA ANGGARAN:</span>
                    <span className="font-black text-primary">Rp {remainingBudget.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Gamifikasi Info (Hanya Visual) */}
          {step === 3 && (
            <div className="bg-emerald-50 dark:bg-gray-800/80 p-4 rounded-2xl border border-emerald-100 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-2 text-center flex flex-col items-center justify-center h-[160px]">
              <Mail className="w-10 h-10 text-orange-500 mb-3 opacity-80" />
              <p className="text-xs font-bold text-foreground">Satu langkah lagi!</p>
              <p className="text-[11px] text-muted-foreground mt-1 px-4 leading-relaxed">
                Tekan tombol di bawah untuk menanam bibit pertamamu dan menyimpan siklus keuanganmu.
              </p>
            </div>
          )}
        </div>

        {/* Footer / Navigasi Buttons */}
        <div className="flex gap-3 mt-6 relative z-10">
          {step > 0 && (
            <button
              onClick={handleBack}
              disabled={isSaving}
              className="px-5 py-4 rounded-2xl font-bold text-muted-foreground bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm"
            >
              Kembali
            </button>
          )}

          <button
            onClick={step === 3 ? handleSave : handleNext}
            disabled={isSaving}
            className="flex-1 bg-primary text-white font-black py-4 rounded-2xl shadow-lg hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer text-sm"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : step === 3 ? (
              <>Mulai Perjalanan <CheckCircle2 className="w-5 h-5" /></>
            ) : (
              <>Lanjut <ChevronRight className="w-5 h-5" /></>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}