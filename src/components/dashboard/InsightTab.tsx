import { TrendingUp, Leaf, AlertTriangle, Clock, Calendar } from "lucide-react";

export default function InsightTab() {
  return (
    <div className="flex flex-col space-y-5">
      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-50">
        <div className="text-[11px] font-bold text-gray-400 mb-5 uppercase tracking-widest">Pekan Ini</div>
        
        <div className="flex items-start gap-4 py-4 border-b border-gray-50 first:pt-0">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-[13.5px] font-medium text-gray-500 leading-[1.6] flex-1 pt-0.5">
            <strong className="font-bold text-gray-800">Pengeluaran makanan naik 34%</strong> dibanding minggu lalu. Sebagian besar dari Grab Food di jam makan siang.
          </div>
        </div>

        <div className="flex items-start gap-4 py-4 border-b border-gray-50">
          <div className="w-10 h-10 rounded-xl bg-[#e8f4ec] flex items-center justify-center shrink-0">
            <Leaf className="w-5 h-5 text-[#2A6A55]" />
          </div>
          <div className="text-[13.5px] font-medium text-gray-500 leading-[1.6] flex-1 pt-0.5">
            <strong className="font-bold text-gray-800">Transportasi sangat hemat</strong> minggu ini — kamu sudah aman sampai akhir bulan untuk kategori ini.
          </div>
        </div>

        <div className="flex items-start gap-4 py-4 pb-0">
          <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-pink-600" />
          </div>
          <div className="text-[13.5px] font-medium text-gray-500 leading-[1.6] flex-1 pt-0.5">
            Budget <strong className="font-bold text-gray-800">belanja sudah terlampaui</strong> Rp 30.000. Taman sedikit layu — tahan dulu 10 hari.
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-50">
        <div className="text-[11px] font-bold text-gray-400 mb-5 uppercase tracking-widest">Pola Pengeluaran</div>
        
        <div className="flex items-start gap-4 py-4 border-b border-gray-50 first:pt-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-[13.5px] font-medium text-gray-500 leading-[1.6] flex-1 pt-0.5">
            Kamu paling sering belanja di <strong className="font-bold text-gray-800">Shopee antara pukul 20–23</strong>. Coba pause notifikasi promo di jam itu.
          </div>
        </div>

        <div className="flex items-start gap-4 py-4 pb-0">
          <div className="w-10 h-10 rounded-xl bg-[#e8f4ec] flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-[#2A6A55]" />
          </div>
          <div className="text-[13.5px] font-medium text-gray-500 leading-[1.6] flex-1 pt-0.5">
            3 bulan terakhir, pengeluaran selalu lebih rendah di <strong className="font-bold text-gray-800">minggu ke-3</strong>. Jadikan referensi untuk nabung lebih.
          </div>
        </div>
      </div>
    </div>
  );
}
