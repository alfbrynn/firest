import { Zap, Plus } from "lucide-react";

export default function GoalsTab() {
  return (
    <div className="flex flex-col space-y-4">
      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-50">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-[16px] bg-blue-50 flex items-center justify-center text-3xl shrink-0">💻</div>
          <div>
            <div className="text-[16px] font-bold text-gray-800">Laptop Baru</div>
            <div className="text-[12px] font-medium text-gray-400 mt-1">Target: Agustus 2026 · 3 bulan lagi</div>
          </div>
        </div>
        <div className="flex justify-between text-[12px] font-semibold text-gray-400 mb-2.5">
          <span>Terkumpul</span>
          <span className="text-gray-700">Rp 2.400.000 / 8.000.000</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4 shadow-inner">
          <div className="h-full rounded-full bg-blue-500" style={{width: '30%'}}></div>
        </div>
        <div className="text-[12px] font-medium text-gray-500 flex items-center gap-1.5 bg-gray-50 py-2 px-3 rounded-xl w-fit">
          <Zap className="w-3.5 h-3.5 text-gray-400" />
          Auto-alokasi <span className="text-[#2A6A55] font-bold">Rp 600rb/bln</span> dari sisa budget
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-50">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-[16px] bg-orange-50 flex items-center justify-center text-3xl shrink-0">✈️</div>
          <div>
            <div className="text-[16px] font-bold text-gray-800">Liburan Bali</div>
            <div className="text-[12px] font-medium text-gray-400 mt-1">Target: Desember 2026 · 7 bulan lagi</div>
          </div>
        </div>
        <div className="flex justify-between text-[12px] font-semibold text-gray-400 mb-2.5">
          <span>Terkumpul</span>
          <span className="text-gray-700">Rp 800.000 / 3.000.000</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4 shadow-inner">
          <div className="h-full rounded-full bg-orange-500" style={{width: '27%'}}></div>
        </div>
        <div className="text-[12px] font-medium text-gray-500 flex items-center gap-1.5 bg-gray-50 py-2 px-3 rounded-xl w-fit">
          <Zap className="w-3.5 h-3.5 text-gray-400" />
          Auto-alokasi <span className="text-[#2A6A55] font-bold">Rp 300rb/bln</span> dari sisa budget
        </div>
      </div>

      <div className="bg-transparent border-[2px] border-dashed border-[#c8e6c9] rounded-[24px] cursor-pointer hover:bg-white hover:shadow-sm transition-all group">
        <div className="text-center py-6 text-gray-400 group-hover:text-[#2A6A55] flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-[#f2f6f3] group-hover:bg-[#e8f4ec] flex items-center justify-center mb-2 transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <div className="text-[13px] font-bold">Tambah Goal Baru</div>
        </div>
      </div>
    </div>
  );
}
