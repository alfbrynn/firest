"use client";

import { useState } from "react";
import { TrendingUp, Mail, Utensils, ShoppingBag, Car, Landmark } from "lucide-react";

export default function TransactionTab() {
  const [txType, setTxType] = useState("masuk");
  const [txCat, setTxCat] = useState('Makanan');

  return (
    <div className="flex flex-col">
      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-50">
          <p className="text-[12px] font-medium text-gray-500 mb-2">Pemasukan</p>
          <p className="text-[28px] font-bold text-[#2A6A55]">4.5jt</p>
          <p className="text-[11px] text-gray-400 mt-1">Mei 2026</p>
        </div>
        <div className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-50">
          <p className="text-[12px] font-medium text-gray-500 mb-2">Pengeluaran</p>
          <p className="text-[28px] font-bold text-[#d44c4c]">3.2jt</p>
          <p className="text-[11px] text-gray-400 mt-1">72% dari target</p>
        </div>
        <div className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-50">
          <p className="text-[12px] font-medium text-gray-500 mb-2">Sisa Budget</p>
          <p className="text-[28px] font-bold text-orange-600">800rb</p>
          <p className="text-[11px] text-gray-400 mt-1">6 hari tersisa</p>
        </div>
        <div className="bg-[#a8e0cb] p-5 rounded-[20px] shadow-sm border border-[#9dd4c0]">
          <p className="text-[12px] font-medium text-[#2A6A55] mb-2">Saving Rate</p>
          <div className="flex items-center gap-2">
            <p className="text-[28px] font-bold text-[#2A6A55]">28%</p>
            <TrendingUp className="w-5 h-5 text-[#2A6A55]" />
          </div>
          <p className="text-[11px] text-[#2A6A55] mt-1 opacity-80">Taman tumbuh</p>
        </div>
      </div>

      {/* Add Transaction Section */}
      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-50 mb-6">
        <div className="text-[11px] font-bold text-gray-400 mb-4 uppercase tracking-widest">Catat Transaksi</div>
        <div className="flex bg-[#f2f6f3] p-1.5 rounded-xl mb-6">
            {['Keluar', 'Masuk', 'Transfer'].map((type) => (
              <button
                key={type}
                onClick={() => setTxType(type.toLowerCase())}
                className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all ${
                  txType === type.toLowerCase()
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
              placeholder="Nama transaksi..." 
              className="flex-1 text-[16px] font-medium text-gray-800 bg-transparent outline-none placeholder-gray-400"
            />
            <input 
              type="text" 
              placeholder="Rp 0" 
              className="w-1/3 text-[24px] text-right font-bold text-gray-800 bg-transparent outline-none placeholder-gray-300"
              readOnly
            />
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
            {['Makanan', 'Transport', 'Belanja', 'Hiburan', 'Tagihan', 'Lainnya'].map((tag) => (
                <button 
                  key={tag} 
                  onClick={() => setTxCat(tag)}
                  className={`px-5 py-2 rounded-full text-[13px] border transition-colors ${
                    txCat === tag 
                      ? 'border-[#2A6A55] bg-[#e8f4ec] text-[#2A6A55] font-semibold' 
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                    {tag}
                </button>
            ))}
        </div>

        <button className="w-full bg-[#2a6a55] text-white py-3.5 rounded-xl font-medium hover:bg-[#235846] transition-colors shadow-sm">
            + Simpan Transaksi
        </button>
      </div>

      <div className="bg-[#e8f4ec] border border-[#b6dfc2] rounded-[16px] p-4 mb-8 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-[#3ab564] shrink-0 shadow-[0_0_8px_rgba(58,181,100,0.6)]"></div>
        <span className="text-[13px] font-medium text-[#2A6A55] flex-1">Gmail sync aktif · 3 transaksi baru terdeteksi</span>
        <button className="text-[12px] font-semibold text-[#2A6A55] bg-[#c8ebd4] py-1 px-3.5 rounded-full hover:bg-[#b6dfc2] transition-colors">
          Review
        </button>
      </div>

      {/* Recent Transactions */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 tracking-widest mb-4">HARI INI</p>
        <div className="space-y-3 mb-6">
            <div className="bg-white p-4 rounded-[20px] flex items-center justify-between shadow-sm border border-gray-50 hover:border-green-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-[14px] bg-orange-50 flex items-center justify-center text-orange-600">
                        <Mail className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[15px] font-bold text-gray-800">GoPay – Grab Food</p>
                        <p className="text-[12px] font-medium text-gray-400 mt-0.5 flex items-center gap-2">
                          12:34 PM <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-md text-[10px]">Gmail auto</span>
                        </p>
                    </div>
                </div>
                <p className="text-[15px] font-bold text-[#d44c4c]">- Rp 48.000</p>
            </div>
            <div className="bg-white p-4 rounded-[20px] flex items-center justify-between shadow-sm border border-gray-50 hover:border-green-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-[14px] bg-orange-50 flex items-center justify-center text-orange-500">
                        <Utensils className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[15px] font-bold text-gray-800">Warung Bu Sari</p>
                        <p className="text-[12px] font-medium text-gray-400 mt-0.5 flex items-center gap-2">
                          11:10 AM <span className="bg-[#e8f4ec] text-[#2A6A55] px-2 py-0.5 rounded-md text-[10px]">Manual</span>
                        </p>
                    </div>
                </div>
                <p className="text-[15px] font-bold text-[#d44c4c]">- Rp 18.000</p>
            </div>
        </div>

        <p className="text-[11px] font-bold text-gray-400 tracking-widest mb-4">KEMARIN</p>
        <div className="space-y-3 mb-6">
            <div className="bg-white p-4 rounded-[20px] flex items-center justify-between shadow-sm border border-gray-50 hover:border-green-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-[14px] bg-pink-50 flex items-center justify-center text-pink-600">
                        <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[15px] font-bold text-gray-800">Shopee – BCA</p>
                        <p className="text-[12px] font-medium text-gray-400 mt-0.5 flex items-center gap-2">
                          20:01 PM <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-md text-[10px]">Gmail auto</span>
                        </p>
                    </div>
                </div>
                <p className="text-[15px] font-bold text-[#d44c4c]">- Rp 215.000</p>
            </div>
            <div className="bg-white p-4 rounded-[20px] flex items-center justify-between shadow-sm border border-gray-50 hover:border-green-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-[14px] bg-blue-50 flex items-center justify-center text-blue-600">
                        <Car className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[15px] font-bold text-gray-800">Grab – Perjalanan</p>
                        <p className="text-[12px] font-medium text-gray-400 mt-0.5 flex items-center gap-2">
                          07:42 AM <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-md text-[10px]">Gmail auto</span>
                        </p>
                    </div>
                </div>
                <p className="text-[15px] font-bold text-[#d44c4c]">- Rp 22.000</p>
            </div>
        </div>
        
        <p className="text-[11px] font-bold text-gray-400 tracking-widest mb-4">1 MEI</p>
        <div className="space-y-3">
            <div className="bg-white p-4 rounded-[20px] flex items-center justify-between shadow-sm border border-gray-50 hover:border-green-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-[14px] bg-[#e8f4ec] flex items-center justify-center text-[#2A6A55]">
                        <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[15px] font-bold text-gray-800">Uang saku / gaji Mei</p>
                        <p className="text-[12px] font-medium text-gray-400 mt-0.5 flex items-center gap-2">
                          08:00 AM <span className="bg-[#e8f4ec] text-[#2A6A55] px-2 py-0.5 rounded-md text-[10px]">Manual</span>
                        </p>
                    </div>
                </div>
                <p className="text-[15px] font-bold text-[#2A6A55]">+ Rp 4.500.000</p>
            </div>
        </div>

      </div>
    </div>
  );
}
