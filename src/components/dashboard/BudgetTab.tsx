"use client";

import { useMemo } from "react";
import { Utensils, Car, ShoppingBag, Gamepad2, Zap, CircleEllipsis } from "lucide-react";
import { useAppStore } from "@/src/store/useAppStore";

// Fungsi bantuan untuk mengubah angka menjadi format "rb" (contoh: 680000 -> 680rb)
const formatRb = (num: number) => {
  if (num === 0) return "0";
  if (num >= 1000) return `${Math.floor(num / 1000)}rb`;
  return `${num}`;
};

export default function BudgetTab() {
  // 1. Ambil data dari Otak Zustand
  const { forestHealth, transactions } = useAppStore();

  // 2. Definisi Batas Budget Bulanan (Untuk MVP, kita tetapkan batasnya di sini)
  const budgetLimits: Record<string, number> = {
    'Makanan': 800000,
    'Transport': 300000, // Disesuaikan dengan kategori di TransactionTab
    'Belanja': 400000,
    'Hiburan': 200000,
    'Tagihan': 350000,
    'Lainnya': 200000
  };

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

  // 4. Susun data untuk di-render di UI
  const budgetData = [
    { cat: 'Makanan', icon: <Utensils className="w-4 h-4" />, limit: budgetLimits['Makanan'] },
    { cat: 'Transport', icon: <Car className="w-4 h-4" />, limit: budgetLimits['Transport'] },
    { cat: 'Belanja', icon: <ShoppingBag className="w-4 h-4" />, limit: budgetLimits['Belanja'] },
    { cat: 'Hiburan', icon: <Gamepad2 className="w-4 h-4" />, limit: budgetLimits['Hiburan'] },
    { cat: 'Tagihan', icon: <Zap className="w-4 h-4" />, limit: budgetLimits['Tagihan'] },
    { cat: 'Lainnya', icon: <CircleEllipsis className="w-4 h-4" />, limit: budgetLimits['Lainnya'] },
  ].map(item => {
    // Ambil total pengeluaran yang sudah dihitung, jika tidak ada fallback ke 0
    // Untuk simulasi MVP agar UI tidak kosong melompong, kita tambahkan data dummy base
    // Hapus "+ dummyBase" nanti jika ingin murni dari input form
    let dummyBase = 0;
    if (item.cat === 'Makanan') dummyBase = 680000;
    if (item.cat === 'Transport') dummyBase = 120000;
    if (item.cat === 'Belanja') dummyBase = 430000;
    if (item.cat === 'Hiburan') dummyBase = 80000;
    if (item.cat === 'Tagihan') dummyBase = 350000;

    // Hitung pengeluaran asli + dummy base
    const spent = expensesByCategory[item.cat] + dummyBase;

    // Kalkulasi persentase
    const rawPct = (spent / item.limit) * 100;
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
    <div className="flex flex-col">
      {/* Forest Health Indicator Dinamis */}
      <div className="bg-[#e8f4ec] border border-[#b6dfc2] rounded-[24px] p-5 mb-8 flex items-center gap-5 shadow-sm">
        <div className="text-4xl bg-white p-3 rounded-2xl shadow-sm">🌳</div>
        <div className="flex-1">
          <div className="text-[14px] font-bold text-[#2A6A55] mb-2.5">Forest health · {forestHealth} / 100</div>
          <div className="h-2.5 bg-[#c8ebd4] rounded-full overflow-hidden mb-2 shadow-inner">
            <div className="h-full bg-[#2A6A55] rounded-full transition-all duration-500" style={{ width: `${forestHealth}%` }}></div>
          </div>
          <div className="text-[12px] font-medium text-[#2A6A55] opacity-80">+30 XP jika semua budget aman bulan ini</div>
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-50 mb-6">
        <div className="flex justify-between items-center mb-8">
          <div className="text-[16px] font-bold text-gray-800">Budget Mei 2026</div>
          <div className="text-[12px] font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full">20 hari berlalu</div>
        </div>

        {/* Looping data budget yang sudah dihitung otomatis */}
        {budgetData.map((item) => (
          <div key={item.cat} className="mb-5 last:mb-0">
            <div className="flex justify-between items-center mb-2.5">
              <div className="text-[14px] font-semibold text-gray-700 flex items-center gap-2.5">
                <span className="text-gray-400">{item.icon}</span> {item.cat}
              </div>
              <div className={`text-[13px] font-bold ${item.alert ? 'text-red-500' : 'text-gray-500'}`}>
                {item.spentText} / <span className="font-medium">{item.limitText}</span>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${item.color} transition-all duration-500`} style={{ width: item.pctText }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-50">
        <div className="flex justify-between items-center mb-3">
          <div className="text-[15px] font-bold text-gray-800">Proyeksi Akhir Bulan</div>
        </div>
        <div className="text-[13.5px] font-medium text-gray-500 leading-relaxed">
          Dengan pola pengeluaran saat ini, kamu akan <strong className="text-red-500">over budget Rp 95.000</strong> di kategori makanan. Kurangi makan di luar 2x minggu ini untuk tetap aman.
        </div>
      </div>
    </div>
  );
}