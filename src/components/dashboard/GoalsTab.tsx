"use client";

import { useState } from "react";
import { Zap, Plus, X } from "lucide-react";

export default function GoalsTab() {
  // 1. Ubah data statis dari mockup Anda menjadi State Array
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: "Laptop Baru",
      icon: "💻",
      targetDate: "Agustus 2026",
      monthsLeft: 3,
      collected: 2400000,
      target: 8000000,
      color: "bg-blue-500",
      bgLight: "bg-blue-50",
      autoAlloc: "Rp 600rb",
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
      bgLight: "bg-orange-50",
      autoAlloc: "Rp 300rb",
    }
  ]);

  // 2. State untuk mengontrol tampilan Form Tambah Goal
  const [showForm, setShowForm] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");

  // 3. Fungsi untuk menyimpan Goal baru ke dalam layar
  const handleAddGoal = () => {
    if (!newGoalTitle || !newGoalTarget) return;

    // Bersihkan format input menjadi angka murni
    const targetNum = parseInt(newGoalTarget.replace(/[^0-9]/g, ""));
    if (isNaN(targetNum)) return;

    const newGoal = {
      id: Date.now(),
      title: newGoalTitle,
      icon: "🎯", // Ikon default untuk goal baru
      targetDate: "TBD", // Untuk MVP kita buat TBD (To Be Determined)
      monthsLeft: 12,
      collected: 0,
      target: targetNum,
      color: "bg-emerald-500",
      bgLight: "bg-emerald-50",
      autoAlloc: "Atur nanti",
    };

    setGoals([...goals, newGoal]); // Tambahkan ke daftar
    setShowForm(false); // Tutup form
    setNewGoalTitle(""); // Reset input
    setNewGoalTarget("");
  };

  // Helper untuk format angka ke Rupiah
  const formatRp = (num: number) => num.toLocaleString("id-ID");

  return (
    <div className="flex flex-col space-y-4">

      {/* Looping semua data Goals */}
      {goals.map((goal) => {
        // Hitung persentase progress bar (maksimal 100%)
        const pct = Math.min((goal.collected / goal.target) * 100, 100);

        return (
          <div key={goal.id} className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-50">
            <div className="flex items-center gap-4 mb-5">
              <div className={`w-14 h-14 rounded-[16px] ${goal.bgLight} flex items-center justify-center text-3xl shrink-0`}>
                {goal.icon}
              </div>
              <div>
                <div className="text-[16px] font-bold text-gray-800">{goal.title}</div>
                <div className="text-[12px] font-medium text-gray-400 mt-1">
                  Target: {goal.targetDate} · {goal.monthsLeft} bulan lagi
                </div>
              </div>
            </div>
            <div className="flex justify-between text-[12px] font-semibold text-gray-400 mb-2.5">
              <span>Terkumpul</span>
              <span className="text-gray-700">Rp {formatRp(goal.collected)} / {formatRp(goal.target)}</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4 shadow-inner">
              <div className={`h-full rounded-full ${goal.color} transition-all duration-500`} style={{ width: `${pct}%` }}></div>
            </div>
            <div className="text-[12px] font-medium text-gray-500 flex items-center gap-1.5 bg-gray-50 py-2 px-3 rounded-xl w-fit">
              <Zap className="w-3.5 h-3.5 text-gray-400" />
              Auto-alokasi <span className="text-[#2A6A55] font-bold">{goal.autoAlloc}/bln</span> dari sisa budget
            </div>
          </div>
        );
      })}

      {/* Render Form Tambah Goal jika showForm bernilai TRUE */}
      {showForm ? (
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#c8e6c9]">
          <div className="flex justify-between items-center mb-4">
            <div className="text-[14px] font-bold text-gray-800">Target Baru</div>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-red-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Nama Goal (cth: Dana Darurat)"
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
            className="w-full mb-3 text-[14px] bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#2A6A55] transition-colors"
          />
          <input
            type="text"
            placeholder="Target Dana (Rp)"
            value={newGoalTarget}
            onChange={(e) => setNewGoalTarget(e.target.value)}
            className="w-full mb-4 text-[14px] bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#2A6A55] transition-colors"
          />
          <button
            onClick={handleAddGoal}
            className="w-full bg-[#2A6A55] text-white py-2.5 rounded-xl text-[13px] font-bold hover:bg-[#235846] transition-colors shadow-sm"
          >
            Simpan Goal
          </button>
        </div>
      ) : (
        /* Render Tombol Tambah Goal jika showForm bernilai FALSE */
        <div
          onClick={() => setShowForm(true)}
          className="bg-transparent border-2 border-dashed border-[#c8e6c9] rounded-[24px] cursor-pointer hover:bg-white hover:shadow-sm transition-all group"
        >
          <div className="text-center py-6 text-gray-400 group-hover:text-[#2A6A55] flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#f2f6f3] group-hover:bg-[#e8f4ec] flex items-center justify-center mb-2 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <div className="text-[13px] font-bold">Tambah Goal Baru</div>
          </div>
        </div>
      )}

    </div>
  );
}