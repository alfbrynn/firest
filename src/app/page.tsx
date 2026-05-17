import Link from "next/link";
import { Leaf, Sparkles, Lock, ArrowRight, Target, BookText, LineChart, ShieldAlert, Award, Compass, HelpCircle, ChevronDown, CheckCircle2, ShieldCheck, Trophy, Landmark } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-background relative overflow-hidden font-sans text-foreground">

      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-emerald-200/20 dark:bg-emerald-900/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-orange-100/20 dark:bg-orange-950/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[-5%] w-[700px] h-[700px] bg-blue-100/20 dark:bg-blue-950/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-100/20 dark:bg-emerald-950/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Fixed Glassmorphic Navbar */}
      <header className="fixed top-0 left-0 z-50 w-full border-b border-gray-100/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
        <nav className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="bg-[#a8e0cb] dark:bg-[#1a5c44] p-1.5 rounded-lg">
              <Leaf className="w-5 h-5 text-emerald-900 dark:text-emerald-100 fill-emerald-900 dark:fill-emerald-100" />
            </div>
            <span className="text-lg sm:text-xl font-black text-primary tracking-tight">Firest</span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1 hidden md:block border-l border-gray-200 dark:border-gray-800 pl-2.5">Financial Rainforest</span>
          </div>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="text-xs font-bold text-white bg-primary hover:bg-emerald-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all px-4 py-2 rounded-lg shadow-xs"
            >
              Masuk
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 min-h-[85vh] lg:min-h-screen pt-32 pb-20 lg:pt-36 lg:pb-24 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 xl:gap-24">

        {/* Kiri: Copywriting & CTA */}
        <div className="flex-1 text-center lg:text-left w-full">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-100/50 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-800/30 text-primary text-[10px] font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
            Financial Rainforest Ecosystem
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-4xl xl:text-5xl font-black text-foreground tracking-tight leading-[1.15] mb-4 max-w-xl mx-auto lg:mx-0">
            Amankan Tabunganmu, Tumbuhkan <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-emerald-500">Hutan Virtualmu.</span>
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground mb-6 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Aplikasi pencatat keuangan interaktif khusus mahasiswa. Gunakan metode <i>Pay Yourself First</i>, nikmati pencatatan otomatis instan lewat integrasi email transaksi, dan pantau kesehatan finansial lewat ekosistem hutan virtualmu.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-6">
            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-sm hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95 w-full sm:w-auto cursor-pointer"
            >
              Coba Demo
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-slate-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-foreground px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-100 dark:hover:bg-gray-800 hover:-translate-y-0.5 transition-all active:scale-95 w-full sm:w-auto"
            >
              Mulai Petualangan
            </Link>
          </div>

          {/* Security Badge */}
          <div className="flex items-start lg:items-center justify-center lg:justify-start gap-2.5 text-xs text-muted-foreground bg-white/45 dark:bg-gray-900/40 backdrop-blur-md p-3 rounded-xl border border-gray-200/10 dark:border-gray-800/20 max-w-md mx-auto lg:mx-0">
            <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 lg:mt-0" />
            <p className="text-left leading-normal">
              <strong className="text-foreground">Privasi & Keamanan Terjamin.</strong> Menggunakan Supabase Auth. Integrasi email bersifat opsional dengan akses terbatas <i>Read-Only</i>.
            </p>
          </div>
        </div>

        {/* Kanan: Visual Mockup Dashboard */}
        <div className="flex-1 w-full max-w-xl lg:max-w-none relative mt-8 lg:mt-0">
          <div className="absolute inset-0 bg-linear-to-tr from-emerald-400/10 to-orange-300/10 dark:from-emerald-900/10 dark:to-orange-900/10 rounded-4xl blur-2xl transform rotate-3"></div>

          <div className="relative bg-white/60 dark:bg-gray-900/65 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-4xl shadow-[0_20px_60px_rgba(0,0,0,0.05)] p-5 sm:p-6 overflow-hidden">
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
              <div className="flex-1 bg-linear-to-b from-emerald-100/30 to-background dark:to-gray-950 rounded-2xl h-44 sm:h-52 border border-emerald-500/10 flex items-center justify-center relative overflow-hidden">
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
                  <div className="h-4 w-full bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
                <div className="bg-primary rounded-xl p-3 shadow-sm h-full flex flex-col justify-end">
                  <div className="h-2 w-10 bg-white/50 rounded-full mb-1.5"></div>
                  <div className="h-3 w-16 bg-white/90 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Fake Notification Popup */}
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

      {/* 3 Langkah Fitur */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">

          {/* Fitur 1 */}
          <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-gray-200/20 dark:border-gray-800/20 hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-5">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">1. Pay Yourself First</h3>
            <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">Amankan target tabunganmu di awal bulan secara otomatis dari total pemasukan. Sisa dana bersih langsung dikonversi menjadi batas aman nyawa budget-mu.</p>
          </div>

          {/* Fitur 2 */}
          <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-gray-200/20 dark:border-gray-800/20 hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mb-5">
              <BookText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">2. Pencatatan Anti Ribet</h3>
            <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">Gunakan fitur integrasi Gmail otomatis yang super hemat kuota (sistem mesin hibrida Regex), didukung formulir penginputan manual yang instan dan fleksibel.</p>
          </div>

          {/* Fitur 3 */}
          <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-gray-200/20 dark:border-gray-800/20 hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-5">
              <Leaf className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">3. Ekosistem Edukatif</h3>
            <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">Ubah kebiasaan burukmu. Kupu-kupu, lebah, dan kelinci animasi akan datang meramaikan hutan jika kamu hemat, dan taman akan berubah layu kecokelatan saat kamu boros.</p>
          </div>

        </div>
      </section>

      {/* Masalah vs Solusi Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mb-3">Kenapa Cara Lama Selalu Gagal?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-xs sm:text-sm">Mencatat keuangan tidak harus membosankan seperti mengisi tabel akuntansi yang kaku.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Sisi Kiri: Cara Lama */}
          <div className="bg-rose-50/20 dark:bg-rose-950/5 border border-rose-500/10 rounded-[28px] p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center mb-5">
                <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-lg font-bold text-rose-950 dark:text-rose-200 mb-4">Pencatatan Konvensional</h3>
              <ul className="space-y-3">
                <li className="flex gap-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Spreadsheet yang rumit dan melelahkan, membuat Anda malas mencatat setiap hari.</span>
                </li>
                <li className="flex gap-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Hanya deretan angka dingin tanpa visualisasi motivasi yang berarti.</span>
                </li>
                <li className="flex gap-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Tidak ada batasan budget harian yang tegas, sehingga pengeluaran selalu bocor.</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-rose-500/5 text-[10px] font-bold text-rose-600 uppercase tracking-widest">
              Hasil: Tabungan Selalu Habis
            </div>
          </div>

          {/* Sisi Kanan: Cara Firest */}
          <div className="bg-emerald-50/20 dark:bg-emerald-950/5 border border-emerald-500/10 rounded-[28px] p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-5">
                <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-250 mb-4">Ekosistem Firest</h3>
              <ul className="space-y-3">
                <li className="flex gap-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span>Otomatisasi asisten regex Gmail, deteksi transaksi e-wallet instan tanpa sentuhan jari.</span>
                </li>
                <li className="flex gap-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span>Visualisasi Hutan Rainforest virtual yang berevolusi sesuai dengan tingkat disiplin menabungmu.</span>
                </li>
                <li className="flex gap-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span>Aturan &quot;Pay Yourself First&quot; menjamin alokasi tabunganmu aman di awal bulan sebelum berbelanja.</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-emerald-500/5 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
              Hasil: Masa Depan Keuangan Terjaga
            </div>
          </div>
        </div>
      </section>

      {/* Tingkatan Level Hutan Virtual */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mb-3">Evolusi Financial Rainforest Anda</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-xs sm:text-sm">Makin tinggi tingkat disiplin menabungmu, makin rimbun ekosistem hutan yang mekar di layar HP-mu.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Level 1-2 */}
          <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-3xl p-5 relative overflow-hidden group">
            <div className="absolute top-[-10%] right-[-10%] w-20 h-20 bg-linear-to-br from-blue-400/10 to-transparent rounded-full blur-xl group-hover:scale-125 transition-all"></div>
            <span className="inline-block px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[9px] font-bold rounded-md uppercase tracking-wider mb-3">Benih Impian</span>
            <h4 className="text-lg font-bold text-foreground mb-1">Seedling & Sprout</h4>
            <p className="text-[10px] text-muted-foreground mb-3 font-bold uppercase tracking-wider">Level 1 - 4</p>
            <p className="text-xs text-muted-foreground leading-relaxed">Tahap awal menabung. Hutan virtual Anda berupa tanah lapang dengan bibit kecil. Anda harus membatasi pengeluaran agar bibit tidak layu.</p>
          </div>

          {/* Level 5-8 */}
          <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-3xl p-5 relative overflow-hidden group">
            <div className="absolute top-[-10%] right-[-10%] w-20 h-20 bg-linear-to-br from-emerald-400/10 to-transparent rounded-full blur-xl group-hover:scale-125 transition-all"></div>
            <span className="inline-block px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold rounded-md uppercase tracking-wider mb-3">Taman Bersemi</span>
            <h4 className="text-lg font-bold text-foreground mb-1">Sapling & Forest</h4>
            <p className="text-[10px] text-muted-foreground mb-3 font-bold uppercase tracking-wider">Level 5 - 8</p>
            <p className="text-xs text-muted-foreground leading-relaxed">Tunas tumbuh menjadi pohon rindang. Kupu-kupu, lebah madu, dan kelinci kecil mulai berdatangan meramaikan taman virtual Anda.</p>
          </div>

          {/* Level 9-12 */}
          <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-3xl p-5 relative overflow-hidden group">
            <div className="absolute top-[-10%] right-[-10%] w-20 h-20 bg-linear-to-br from-orange-400/10 to-transparent rounded-full blur-xl group-hover:scale-125 transition-all"></div>
            <span className="inline-block px-2.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[9px] font-bold rounded-md uppercase tracking-wider mb-3">Rimbar Raya Lestari</span>
            <h4 className="text-lg font-bold text-foreground mb-1">Rainforest & Ecosystem</h4>
            <p className="text-[10px] text-muted-foreground mb-3 font-bold uppercase tracking-wider">Level 9 - 12</p>
            <p className="text-xs text-muted-foreground leading-relaxed">Ekosistem hutan tropis raksasa yang makmur. Burung warna-warni hinggap di dahan besar. Selamat, kondisi keuangan Anda sudah mandiri!</p>
          </div>
        </div>
      </section>

      {/* Teknologi & Keamanan Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-20">
        <div className="bg-gray-50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-850 rounded-[32px] p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-5">
              <Compass className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Teknologi Hibrida yang Super Ringan & Privat</h3>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-5">
              Firest dirancang dari bawah ke atas dengan mengutamakan performa tanpa kompromi. Kami tidak menggunakan sistem server AI yang boros kuota dan lambat untuk memproses data transaksi Anda.
            </p>
            <div className="space-y-3">
              <div className="flex gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-foreground font-medium"><strong className="font-bold">Regex Parser Instan:</strong> Mesin parsing email kami memproses notifikasi bank secara instan (0.01 detik) langsung di browser Anda.</p>
              </div>
              <div className="flex gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-foreground font-medium"><strong className="font-bold">Supabase Row-Level Security (RLS):</strong> Akses data terkunci rapat. Pengguna lain sama sekali tidak dapat mengintip riwayat keuangan Anda.</p>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-850 shadow-xs">
              <Landmark className="w-6 h-6 text-blue-500 mb-3" />
              <h5 className="font-bold text-foreground text-sm mb-1">Akses Read-Only</h5>
              <p className="text-[11px] text-muted-foreground leading-relaxed">Akses Gmail opsional kami hanya mendeteksi email tanda terima digital, tidak bisa mengirim email atau merusak akun Anda.</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-850 shadow-xs">
              <Trophy className="w-6 h-6 text-amber-500 mb-3" />
              <h5 className="font-bold text-foreground text-sm mb-1">Fokus North Star</h5>
              <p className="text-[11px] text-muted-foreground leading-relaxed">Menghapus kerumitan banyak target. Dengan fokus pada satu impian tunggal, motivasi Anda meningkat hingga 200%.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pertanyaan yang Sering Diajukan (FAQ) Accordion Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mb-3">Pertanyaan yang Sering Diajukan</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-xs sm:text-sm">Mengenal lebih dekat ekosistem menabung tropis Financial Rainforest.</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3.5">
          {/* FAQ 1 */}
          <details className="group bg-white/40 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800/50 p-4 sm:p-5 cursor-pointer transition-all duration-300">
            <summary className="flex justify-between items-center gap-4 text-left font-bold text-foreground text-xs sm:text-sm">
              <span>Apakah data keuangan saya aman di Firest?</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground group-open:-rotate-180 transition-transform duration-300" />
            </summary>
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Sangat aman! Seluruh otentikasi dan data dienkripsi dengan standar industri melalui Supabase. Database kami dilengkapi kebijakan Row-Level Security (RLS) yang ketat, memastikan hanya Anda yang memiliki izin untuk membaca dan memodifikasi data riwayat transaksi sendiri.
            </p>
          </details>

          {/* FAQ 2 */}
          <details className="group bg-white/40 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800/50 p-4 sm:p-5 cursor-pointer transition-all duration-300">
            <summary className="flex justify-between items-center gap-4 text-left font-bold text-foreground text-xs sm:text-sm">
              <span>Apakah integrasi pembaca Gmail wajib digunakan?</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground group-open:-rotate-180 transition-transform duration-300" />
            </summary>
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Tidak, integrasi ini sepenuhnya opsional. Jika Anda tidak ingin menyinkronkan email, Anda tetap bisa menikmati fungsionalitas penuh aplikasi dan mencatat pengeluaran secara instan menggunakan formulir entri manual yang ramah pengguna di dasbor.
            </p>
          </details>

          {/* FAQ 3 */}
          <details className="group bg-white/40 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800/50 p-4 sm:p-5 cursor-pointer transition-all duration-300">
            <summary className="flex justify-between items-center gap-4 text-left font-bold text-foreground text-xs sm:text-sm">
              <span>Bagaimana kesehatan hutan virtual dihitung?</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground group-open:-rotate-180 transition-transform duration-300" />
            </summary>
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Kesehatan hutan dihitung secara matematis berdasarkan tingkat realisasi pengeluaran Anda. Jika total pengeluaran bulanan masih di bawah batas aman budget Anda, hutan akan berada dalam status hijau subur (100% sehat) dan memicu fauna berdatangan. Namun, jika budget jebol, kesehatan hutan menyusut dan memicu tampilan tanaman layu kecokelatan serta burung gagak bertengger.
            </p>
          </details>

          {/* FAQ 4 */}
          <details className="group bg-white/40 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800/50 p-4 sm:p-5 cursor-pointer transition-all duration-300">
            <summary className="flex justify-between items-center gap-4 text-left font-bold text-foreground text-xs sm:text-sm">
              <span>Apakah aplikasi ini sepenuhnya gratis?</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground group-open:-rotate-180 transition-transform duration-300" />
            </summary>
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Ya, 100% gratis! Firest dikembangkan sebagai proyek edukatif untuk membantu mahasiswa melatih kebiasaan menabung yang sehat sejak dini dengan cara yang sangat interaktif dan menyenangkan.
            </p>
          </details>
        </div>
      </section>

      {/* Sweep Call-To-Action (CTA) Footer Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-20">
        <div className="relative bg-emerald-950 dark:bg-gray-900 border border-emerald-800/30 rounded-[36px] p-6 sm:p-12 text-center overflow-hidden shadow-xl">
          {/* Decorative glowing gradient orbs */}
          <div className="absolute inset-0 bg-linear-to-tr from-emerald-500/10 to-transparent pointer-events-none"></div>
          <div className="absolute top-[-20%] left-[-20%] w-[350px] h-[350px] bg-emerald-400/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

          <div className="relative z-10 max-w-xl mx-auto">
            <div className="bg-emerald-900/50 border border-emerald-800 px-3.5 py-1 rounded-full inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">Mulai Perjalanan Keuanganmu</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight mb-4">
              Siap Membangun Ekosistem Keuangan Terbaikmu?
            </h3>
            <p className="text-emerald-200/70 text-xs sm:text-sm leading-relaxed mb-6 max-w-md mx-auto">
              Gabung sekarang dengan Firest secara gratis dan ubah cara menabungmu menjadi petualangan bertumbuh yang seru!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login"
                className="bg-primary hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl text-sm hover:shadow-md transition-all w-full sm:w-auto text-center cursor-pointer"
              >
                Daftar Akun Sekarang
              </Link>
              <Link
                href="/demo"
                className="bg-white/10 hover:bg-white/15 text-white font-bold px-6 py-3 rounded-xl text-sm border border-white/10 transition-all w-full sm:w-auto text-center cursor-pointer"
              >
                Coba Demo Dulu
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest pb-8">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-primary" />
            <span>Firest &copy; {new Date().getFullYear()}</span>
          </div>
          <span>Financial Rainforest for Students</span>
        </div>
      </section>

    </div>
  );
}