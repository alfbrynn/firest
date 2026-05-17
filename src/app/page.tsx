import Link from "next/link";
import { Leaf, Sparkles, Lock, ArrowRight, Target, BookText, LineChart } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-background relative overflow-hidden font-sans text-foreground">

      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[700px] h-[700px] bg-emerald-200/20 dark:bg-emerald-900/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-orange-100/30 dark:bg-orange-950/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Fixed Glassmorphic Navbar (Stays in place at the top of the viewport) */}
      <header className="fixed top-0 left-0 z-50 w-full border-b border-gray-100/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
        <nav className="max-w-[1800px] mx-auto px-8 sm:px-16 lg:px-24 xl:px-32 2xl:px-40 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#a8e0cb] dark:bg-[#1a5c44] p-2 rounded-xl">
              <Leaf className="w-6 h-6 text-emerald-900 dark:text-emerald-100 fill-emerald-900 dark:fill-emerald-100" />
            </div>
            <span className="text-2xl font-black text-primary tracking-tight">Firest</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1.5 hidden md:block border-l border-gray-200 dark:border-gray-800 pl-3">Financial Rainforest</span>
          </div>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors bg-white/40 dark:bg-gray-900/40 backdrop-blur-md px-4 py-2 rounded-xl border border-gray-150 dark:border-gray-800"
            >
              Masuk / Daftar
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section - Diperlebar dan gap ditingkatkan agar konten lebih menyebar ke sisi kiri/kanan */}
      <main className="relative z-10 max-w-[1800px] mx-auto px-8 sm:px-16 lg:px-24 xl:px-32 2xl:px-40 pt-28 pb-20 lg:pt-36 lg:pb-32 flex flex-col lg:flex-row items-center gap-12 lg:gap-32 xl:gap-48">

        {/* Kiri: Copywriting & CTA */}
        <div className="flex-1 text-center lg:text-left w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/50 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-800/30 text-primary text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-4 h-4" />
            Smart Financial Gamification
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-black text-foreground tracking-tight leading-[1.1] mb-6 max-w-2xl mx-auto lg:mx-0">
            Amankan Tabunganmu, Tumbuhkan <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">Hutan Virtualmu.</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Aplikasi pencatat keuangan interaktif untuk mahasiswa. Terapkan metode <i>Pay Yourself First</i>, nikmati pencatatan otomatis lewat email transaksi, dan pantau kesehatan finansialmu lewat ekosistem hutan virtual.
          </p>

          <Link
            href="/demo"
            className="inline-flex items-center justify-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-1 transition-all active:scale-95 mb-6 w-full sm:w-auto cursor-pointer"
          >
            Coba Demo
            <ArrowRight className="w-5 h-5" />
          </Link>

          {/* Security Badge */}
          <div className="flex items-start lg:items-center justify-center lg:justify-start gap-3 text-sm text-muted-foreground bg-white/45 dark:bg-gray-900/40 backdrop-blur-md p-4 rounded-xl border border-gray-200/20 dark:border-gray-800/40 max-w-md mx-auto lg:mx-0">
            <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 lg:mt-0" />
            <p className="text-left leading-tight">
              <strong className="text-foreground">Privasi & Keamanan Terjamin.</strong> Data Anda dienkripsi dengan Supabase Auth. Integrasi Gmail bersifat opsional dengan akses terbatas <i>Read-Only</i>.
            </p>
          </div>
        </div>

        {/* Kanan: Visual Mockup Dashboard */}
        <div className="flex-1 w-full max-w-xl lg:max-w-none relative mt-8 lg:mt-0">
          {/* Efek glow di belakang mockup */}
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/10 to-orange-300/10 dark:from-emerald-900/10 dark:to-orange-900/10 rounded-[2rem] blur-2xl transform rotate-3"></div>

          {/* Glassmorphism Mockup Card */}
          <div className="relative bg-white/60 dark:bg-gray-900/65 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] p-5 sm:p-6 overflow-hidden">
            {/* Header Mockup */}
            <div className="flex justify-between items-center mb-6 sm:mb-8 border-b border-gray-100/50 dark:border-gray-800/50 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                </div>
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
              </div>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800"></div>
              </div>
            </div>

            {/* Body Mockup */}
            <div className="flex gap-4">
              {/* Fake Canvas (Kiri) */}
              <div className="flex-1 bg-gradient-to-b from-emerald-100/30 to-background dark:to-gray-950 rounded-2xl h-44 sm:h-52 border border-emerald-500/10 flex items-center justify-center relative overflow-hidden">
                <Leaf className="w-16 h-16 text-emerald-200 dark:text-emerald-800/30" />
                <div className="absolute top-4 right-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  🦋 Thriving
                </div>
                <div className="absolute bottom-4 bg-white/90 dark:bg-gray-950/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold text-primary shadow-sm">
                  Kesehatan Hutan: 100%
                </div>
              </div>

              {/* Fake Dashboard Panel (Kanan) */}
              <div className="w-1/3 flex flex-col gap-3">
                <div className="bg-white/80 dark:bg-gray-950/40 rounded-xl p-3 shadow-sm border border-emerald-100 dark:border-emerald-900/30 h-20">
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Gudang Tabungan</div>
                  <div className="h-4 w-full bg-emerald-500 rounded-full"></div>
                </div>
                <div className="bg-primary rounded-xl p-3 shadow-sm h-full flex flex-col justify-end">
                  <div className="h-2 w-10 bg-white/50 rounded-full mb-1.5"></div>
                  <div className="h-3 w-16 bg-white/90 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Fake Notification Popup - Diubah dari OCR menjadi Notifikasi Transaksi Instan */}
            <div className="absolute bottom-6 right-2 sm:right-[-10px] md:right-[-10px] bg-white dark:bg-gray-950 rounded-xl p-3 shadow-xl border border-gray-100/50 dark:border-gray-800/50 flex items-center gap-3 animate-bounce shadow-emerald-900/5">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/50 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="pr-4 sm:pr-6">
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Auto-Sync Instan</p>
                <p className="text-xs sm:text-sm font-bold text-foreground">QRIS Mandiri Berhasil (Rp 15rb)</p>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* 3 Langkah Fitur - Kontainer diperlebar agar seimbang dengan hero section */}
      <section className="relative z-10 max-w-[1800px] mx-auto px-8 sm:px-16 lg:px-24 xl:px-32 2xl:px-40 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 xl:gap-12">

          {/* Fitur 1 */}
          <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-gray-200/20 dark:border-gray-800/20 hover:shadow-lg hover:-translate-y-1 transition-all">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6">
              <Target className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">1. Pay Yourself First</h3>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">Amankan target tabunganmu di awal bulan secara otomatis dari total pemasukan. Sisa dana bersih langsung dikonversi menjadi batas aman nyawa budget-mu.</p>
          </div>

          {/* Fitur 2 - Diubah dari OCR menjadi Pencatatan Fleksibel */}
          <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-gray-200/20 dark:border-gray-800/20 hover:shadow-lg hover:-translate-y-1 transition-all">
            <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mb-6">
              <BookText className="w-7 h-7 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">2. Pencatatan Anti Ribet</h3>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">Gunakan fitur integrasi Gmail otomatis yang super hemat kuota (sistem mesin hibrida Regex), didukung formulir penginputan manual yang instan dan fleksibel.</p>
          </div>

          {/* Fitur 3 */}
          <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-gray-200/20 dark:border-gray-800/20 hover:shadow-lg hover:-translate-y-1 transition-all">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-6">
              <Leaf className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">3. Ekosistem Edukatif</h3>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">Ubah kebiasaan burukmu. Kupu-kupu, lebah, dan kelinci animasi akan datang meramaikan hutan jika kamu hemat, dan taman akan berubah layu kecokelatan saat kamu boros.</p>
          </div>

        </div>
      </section>

    </div>
  );
}