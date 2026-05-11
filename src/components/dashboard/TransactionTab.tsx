"use client";

import { useState } from "react";
import { TrendingUp, Mail, Utensils, ShoppingBag, Car, Landmark, Plus } from "lucide-react";
import { useAppStore } from "@/src/store/useAppStore";

// Fungsi bantuan untuk memilih ikon berdasarkan kategori
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Makanan': return <Utensils className="w-5 h-5" />;
    case 'Transport': return <Car className="w-5 h-5" />;
    case 'Belanja': return <ShoppingBag className="w-5 h-5" />;
    default: return <Plus className="w-5 h-5" />;
  }
};

export default function TransactionTab() {
  const [txType, setTxType] = useState("keluar");
  const [txCat, setTxCat] = useState('Makanan');

  // State baru untuk input form
  const [txTitle, setTxTitle] = useState("");
  const [txAmount, setTxAmount] = useState("");

  // Ambil fungsi dan data dari Zustand
  const { addTransaction, transactions } = useAppStore();

  // Fungsi menyimpan transaksi
  const handleAddTransaction = () => {
    if (!txTitle || !txAmount) return; // Cegah simpan jika kosong

    // Bersihkan format input menjadi angka murni
    const cleanAmount = parseInt(txAmount.replace(/[^0-9]/g, ""));
    if (isNaN(cleanAmount)) return;

    const newTx = {
      id: Math.random().toString(36).substr(2, 9),
      title: txTitle,
      amount: cleanAmount,
      category: txCat,
      type: txType === "masuk" ? "income" : "expense" as "income" | "expense",
      date: new Date().toISOString(),
    };

    // Simpan ke Zustand
    addTransaction(newTx);

    // Reset form
    setTxTitle("");
    setTxAmount("");
  };

  // Format angka saat mengetik nominal
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, "");
    if (numericValue) {
      setTxAmount(parseInt(numericValue).toLocaleString('id-ID'));
    } else {
      setTxAmount("");
    }
  };

  return (
    <div className="flex flex-col">
      {/* Row 1: Pemasukan & Pengeluaran — ukuran sama, info sekunder */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-white p-4 rounded-[16px] border border-gray-100">
          <p className="text-[11px] font-semibold text-gray-500 mb-1">Pemasukan</p>
          <p className="text-[22px] font-semibold text-[#2A6A55]">4.5jt</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Mei 2026</p>
        </div>
        <div className="bg-white p-4 rounded-[16px] border border-gray-100">
          <p className="text-[11px] font-semibold text-gray-500 mb-1">Pengeluaran</p>
          <p className="text-[22px] font-semibold text-[#d44c4c]">3.2jt</p>
          <p className="text-[10px] text-gray-500 mt-0.5">72% dari target</p>
        </div>
      </div>

      {/* Row 2: Saving Rate — hero card full width, paling penting */}
      <div className="bg-[#2A6A55] p-5 rounded-[20px] mb-3">
        <p className="text-[11px] font-medium text-emerald-200 mb-1">Saving Rate bulan ini</p>
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-2">
            <p className="text-[40px] font-bold text-white leading-none">28%</p>
            <TrendingUp className="w-5 h-5 text-emerald-300 mb-1" />
          </div>
          <span className="text-[11px] text-emerald-300 bg-emerald-800/30 px-3 py-1 rounded-full">
            🌱 Taman tumbuh
          </span>
        </div>
        {/* Progress bar menuju saving rate ideal 30% */}
        <div className="mt-3 h-1.5 bg-emerald-800/30 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-300 rounded-full" style={{ width: '93%' }} />
        </div>
        <p className="text-[10px] text-emerald-300/70 mt-1">93% menuju target 30%</p>
      </div>

      {/* Row 3: Sisa Budget — actionable, medium emphasis */}
      <div className="bg-orange-50 border border-orange-100 p-4 rounded-[16px] mb-3">
        <p className="text-[11px] font-semibold text-orange-700 mb-1">Sisa Budget</p>
        <div className="flex items-center justify-between">
          <p className="text-[26px] font-bold text-orange-600">800rb</p>
          <span className="text-[11px] font-semibold text-orange-700 bg-orange-100 px-3 py-1 rounded-full">
            ⏳ 6 hari tersisa
          </span>
        </div>
      </div>

      {/* Add Transaction Section */}
      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-50 mb-6">
        <div className="text-[11px] font-bold text-gray-500 mb-4 uppercase tracking-widest">Catat Transaksi</div>
        <div className="flex bg-[#f2f6f3] p-1.5 rounded-xl mb-6">
          {['Keluar', 'Masuk', 'Transfer'].map((type) => (
            <button
              key={type}
              onClick={() => setTxType(type.toLowerCase())}
              className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all ${txType === type.toLowerCase()
                ? "bg-white text-[#2A6A55] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex gap-4 mb-6 border-b border-gray-100 pb-3">
          <input
            type="text"
            value={txTitle}
            onChange={(e) => setTxTitle(e.target.value)}
            placeholder="Nama transaksi..."
            className="flex-1 text-[16px] font-medium text-gray-800 bg-transparent outline-none placeholder-gray-400"
          />
          <div className="flex items-center w-1/3">
            <span className="text-[24px] font-bold text-gray-500 mr-1">Rp</span>
            <input
              type="text"
              value={txAmount}
              onChange={handleAmountChange}
              placeholder="0"
              className="w-full text-[24px] text-left font-bold text-gray-800 bg-transparent outline-none placeholder-gray-400"
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          {['Makanan', 'Transport', 'Belanja', 'Hiburan', 'Tagihan', 'Lainnya'].map((tag) => (
            <button
              key={tag}
              onClick={() => setTxCat(tag)}
              className={`px-5 py-2 rounded-full text-[13px] border transition-colors ${txCat === tag
                ? 'border-[#2A6A55] bg-[#e8f4ec] text-[#2A6A55] font-semibold'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <button
          onClick={handleAddTransaction}
          className="w-full bg-[#2a6a55] text-white py-3.5 rounded-xl font-medium hover:bg-[#235846] transition-colors shadow-sm"
        >
          + Simpan Transaksi
        </button>
      </div>

      {/* Gmail Sync Notification (Tetap sama) */}
      <div className="bg-[#e8f4ec] border border-[#b6dfc2] rounded-[16px] p-4 mb-8 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-[#3ab564] shrink-0 shadow-[0_0_8px_rgba(58,181,100,0.6)]"></div>
        <span className="text-[13px] font-medium text-[#2A6A55] flex-1">Gmail sync aktif · 3 transaksi baru terdeteksi</span>
        <button className="text-[12px] font-semibold text-[#2A6A55] bg-[#c8ebd4] py-1 px-3.5 rounded-full hover:bg-[#b6dfc2] transition-colors">
          Review
        </button>
      </div>

      {/* Recent Transactions */}
      <div>
        <p className="text-[11px] font-bold text-gray-500 tracking-widest mb-4">HARI INI</p>
        <div className="space-y-3 mb-6">

          {/* Loop Transaksi Baru dari Zustand */}
          {transactions.map((tx) => (
            <div key={tx.id} className="bg-white p-4 rounded-[20px] flex items-center justify-between shadow-sm border border-gray-50 hover:border-green-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center ${tx.type === 'income' ? 'bg-[#e8f4ec] text-[#2A6A55]' : 'bg-orange-50 text-orange-500'
                  }`}>
                  {getCategoryIcon(tx.category)}
                </div>
                <div>
                  <p className="text-[15px] font-bold text-gray-800">{tx.title}</p>
                  <p className="text-[12px] font-medium text-gray-500 mt-0.5 flex items-center gap-2">
                    Baru saja <span className={`px-2 py-0.5 rounded-md text-[10px] ${tx.type === 'income' ? 'bg-[#e8f4ec] text-[#2A6A55]' : 'bg-orange-50 text-orange-600'
                      }`}>Manual</span>
                  </p>
                </div>
              </div>
              <p className={`text-[15px] font-bold ${tx.type === 'income' ? 'text-[#2A6A55]' : 'text-[#d44c4c]'}`}>
                {tx.type === 'income' ? '+ ' : '- '} Rp {tx.amount.toLocaleString('id-ID')}
              </p>
            </div>
          ))}

          {/* Placeholder Transaksi Statis (Dari Mockup) */}
          <div className="bg-white p-4 rounded-[20px] flex items-center justify-between shadow-sm border border-gray-50 hover:border-green-100 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-[14px] bg-orange-50 flex items-center justify-center text-orange-600">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-gray-800">GoPay – Grab Food</p>
                <p className="text-[12px] font-medium text-gray-500 mt-0.5 flex items-center gap-2">
                  12:34 PM <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-md text-[10px]">Gmail auto</span>
                </p>
              </div>
            </div>
            <p className="text-[15px] font-bold text-[#d44c4c]">- Rp 48.000</p>
          </div>

        </div>

        {/* Transaksi Kemarin dan 1 Mei (Tetap sama, disingkat untuk fokus) */}
        <p className="text-[11px] font-bold text-gray-500 tracking-widest mb-4">KEMARIN</p>
        <div className="space-y-3 mb-6">
          <div className="bg-white p-4 rounded-[20px] flex items-center justify-between shadow-sm border border-gray-50 hover:border-green-100 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-[14px] bg-pink-50 flex items-center justify-center text-pink-600">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-gray-800">Shopee – BCA</p>
                <p className="text-[12px] font-medium text-gray-500 mt-0.5 flex items-center gap-2">
                  20:01 PM <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-md text-[10px]">Gmail auto</span>
                </p>
              </div>
            </div>
            <p className="text-[15px] font-bold text-[#d44c4c]">- Rp 215.000</p>
          </div>
        </div>

      </div>
    </div >
  );
}