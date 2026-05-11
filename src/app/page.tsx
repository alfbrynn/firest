// src/app/page.tsx
import Link from "next/link";
import { Leaf } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-[#F7F9F7] flex flex-col items-center justify-center text-center p-6">
      <div className="w-20 h-20 bg-gradient-to-br from-[#2A6A55] to-[#174031] rounded-3xl flex items-center justify-center shadow-xl mb-6">
        <Leaf className="w-10 h-10 text-white fill-white/20" />
      </div>
      <h1 className="text-5xl font-black text-gray-800 tracking-tight mb-4">
        Selamat Datang di <span className="text-[#2A6A55]">Firest</span>
      </h1>
      <p className="text-lg text-gray-500 mb-10 max-w-md">
        Gamifikasi finansial yang mengubah setiap transaksimu menjadi hutan virtual yang menenangkan.
      </p>
      <Link
        href="/login"
        className="bg-[#2A6A55] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#1f4e3f] hover:shadow-lg transition-all"
      >
        Mulai Perjalananmu
      </Link>
    </div>
  );
}