import { Utensils, Car, ShoppingBag, Gamepad2, Zap } from "lucide-react";

export default function BudgetTab() {
  return (
    <div className="flex flex-col">
      <div className="bg-[#e8f4ec] border border-[#b6dfc2] rounded-[24px] p-5 mb-8 flex items-center gap-5 shadow-sm">
        <div className="text-4xl bg-white p-3 rounded-2xl shadow-sm">🌳</div>
        <div className="flex-1">
          <div className="text-[14px] font-bold text-[#2A6A55] mb-2.5">Forest health · 72 / 100</div>
          <div className="h-2.5 bg-[#c8ebd4] rounded-full overflow-hidden mb-2 shadow-inner">
            <div className="h-full bg-[#2A6A55] rounded-full" style={{width: '72%'}}></div>
          </div>
          <div className="text-[12px] font-medium text-[#2A6A55] opacity-80">+30 XP jika semua budget aman bulan ini</div>
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-50 mb-6">
        <div className="flex justify-between items-center mb-8">
          <div className="text-[16px] font-bold text-gray-800">Budget Mei 2026</div>
          <div className="text-[12px] font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full">20 hari berlalu</div>
        </div>

        {[
          { cat: 'Makanan', icon: <Utensils className="w-4 h-4"/>, spent: '680rb', total: '800rb', pct: '85%', color: 'bg-orange-500', alert: false },
          { cat: 'Transportasi', icon: <Car className="w-4 h-4"/>, spent: '120rb', total: '300rb', pct: '40%', color: 'bg-green-500', alert: false },
          { cat: 'Belanja', icon: <ShoppingBag className="w-4 h-4"/>, spent: '430rb', total: '400rb', pct: '100%', color: 'bg-red-500', alert: true },
          { cat: 'Hiburan', icon: <Gamepad2 className="w-4 h-4"/>, spent: '80rb', total: '200rb', pct: '40%', color: 'bg-green-500', alert: false },
          { cat: 'Tagihan', icon: <Zap className="w-4 h-4"/>, spent: '350rb', total: '350rb', pct: '100%', color: 'bg-orange-500', alert: false },
        ].map((item) => (
          <div key={item.cat} className="mb-5 last:mb-0">
            <div className="flex justify-between items-center mb-2.5">
              <div className="text-[14px] font-semibold text-gray-700 flex items-center gap-2.5">
                <span className="text-gray-400">{item.icon}</span> {item.cat}
              </div>
              <div className={`text-[13px] font-bold ${item.alert ? 'text-red-500' : 'text-gray-500'}`}>
                {item.spent} / <span className="font-medium">{item.total}</span>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${item.color}`} style={{width: item.pct}}></div>
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
