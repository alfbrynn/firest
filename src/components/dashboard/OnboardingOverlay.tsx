"use client";

import { useState, useMemo } from "react";
import { Sparkles, Save, Calendar, Coins, Landmark, AlertCircle, Heart } from "lucide-react";
import { useAppStore } from "@/src/store/useAppStore";

interface OnboardingOverlayProps {
  userId: string;
}

export default function OnboardingOverlay({ userId }: OnboardingOverlayProps) {
  const { updateMonthlyTargets } = useAppStore();
  const [income, setIncome] = useState("");
  const [savings, setSavings] = useState("");
  const [resetDate, setResetDate] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const formatCurrency = (val: string) => {
    const num = parseInt(val.replace(/[^0-9]/g, ""));
    return isNaN(num) ? "" : num.toLocaleString('id-ID');
  };

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIncome(formatCurrency(e.target.value));
  };

  const handleSavingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSavings(formatCurrency(e.target.value));
  };

  const incomeVal = useMemo(() => parseInt(income.replace(/[^0-9]/g, "")) || 0, [income]);
  const savingsVal = useMemo(() => parseInt(savings.replace(/[^0-9]/g, "")) || 0, [savings]);
  const remainingBudget = useMemo(() => Math.max(0, incomeVal - savingsVal), [incomeVal, savingsVal]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (incomeVal <= 0) {
      setErrorMsg("Estimasi pemasukan bulanan harus diisi!");
      return;
    }
    if (savingsVal < 0) {
      setErrorMsg("Target tabungan tidak boleh kurang dari 0!");
      return;
    }
    if (savingsVal > incomeVal) {
      setErrorMsg("Target tabungan tidak boleh melebihi total pemasukan bulanan!");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg("");
      await updateMonthlyTargets(userId, incomeVal, savingsVal, resetDate);
    } catch (err) {
      console.error("Error setting onboarding targets:", err);
      setErrorMsg("Terjadi kesalahan saat menyimpan data. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md p-6 sm:p-8 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-emerald-500/20 dark:border-emerald-500/10 relative overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Glow Background */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-6 relative z-10">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl flex items-center justify-center mx-auto mb-3.5 border border-emerald-100/10 shadow-inner">
            <Sparkles className="w-7 h-7 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight leading-tight">
            Selamat Datang di Firest! 🌱
          </h2>
          <p className="text-xs text-muted-foreground font-bold mt-1.5 uppercase tracking-wider">
            Langkah Awal Siklus Keuanganmu
          </p>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed px-2">
            Metode <strong className="text-foreground">Pay Yourself First</strong> mendikte kita untuk mengamankan tabungan dan tanggal siklus terlebih dahulu sebelum menganggarkan belanja.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4 relative z-10">
          {errorMsg && (
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-3 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-rose-900 dark:text-rose-200 leading-normal">{errorMsg}</p>
            </div>
          )}

          {/* 1. Reset Date (Payday/Uang saku turun) */}
          <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 focus-within:border-primary/50 transition-colors">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" /> Kapan tanggal gajian/uang sakumu turun?
            </label>
            <select
              value={resetDate}
              onChange={(e) => setResetDate(parseInt(e.target.value))}
              className="w-full bg-transparent text-sm font-black outline-none cursor-pointer text-foreground"
            >
              {[...Array(31)].map((_, i) => (
                <option key={i + 1} value={i + 1} className="bg-white dark:bg-gray-900">Tanggal {i + 1}</option>
              ))}
            </select>
          </div>

          {/* 2. Monthly Income Target */}
          <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 focus-within:border-primary/50 transition-colors">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1.5 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-primary" /> Berapa pemasukan/uang sakumu per bulan?
            </label>
            <div className="flex items-center gap-2">
              <span className="font-bold text-muted-foreground text-sm">Rp</span>
              <input
                type="text"
                value={income}
                onChange={handleIncomeChange}
                placeholder="0"
                className="w-full bg-transparent text-base font-black outline-none text-foreground"
                required
              />
            </div>
          </div>

          {/* 3. Monthly Savings Target */}
          <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 focus-within:border-primary/50 transition-colors">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1.5 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-primary" /> Berapa target tabunganmu per bulan?
            </label>
            <div className="flex items-center gap-2">
              <span className="font-bold text-muted-foreground text-sm">Rp</span>
              <input
                type="text"
                value={savings}
                onChange={handleSavingsChange}
                placeholder="0"
                className="w-full bg-transparent text-base font-black outline-none text-foreground"
                required
              />
            </div>
          </div>

          {/* Dynamic "Pay Yourself First" Math Display */}
          {incomeVal > 0 && (
            <div className="bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 space-y-2 animate-in fade-in duration-300">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-muted-foreground">Pemasukan Bulanan:</span>
                <span className="text-foreground">Rp {incomeVal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-muted-foreground">Target Tabungan (Amankan dulu!):</span>
                <span className="text-rose-500">- Rp {savingsVal.toLocaleString('id-ID')}</span>
              </div>
              <div className="border-t border-dashed border-emerald-500/20 pt-2 flex justify-between items-center text-xs font-black">
                <span className="text-primary flex items-center gap-1"><Heart className="w-3.5 h-3.5 fill-primary text-primary" /> Sisa Budget Belanja:</span>
                <span className="text-primary text-sm">Rp {remainingBudget.toLocaleString('id-ID')}</span>
              </div>
              <p className="text-[9px] text-gray-500 dark:text-emerald-250/60 leading-normal text-center mt-1 font-semibold">
                Sisa budget belanja ini akan otomatis dibagi secara ideal ke dalam kategori-kategori anggaran Anda!
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-lg hover:bg-emerald-700 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer text-xs"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Save className="w-4 h-4" /> Simpan & Mulai Hutan Keuanganmu</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
