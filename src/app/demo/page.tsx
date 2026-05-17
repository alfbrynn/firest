"use client";

import { useEffect } from "react";
import DashboardPanel from "@/src/components/dashboard/DashboardPanel";
import PixiCanvas from "@/src/components/game/PixiCanvas";
import { Bell, Settings, Leaf } from "lucide-react";
import { useAppStore } from "@/src/store/useAppStore";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/utils/supabase/client";
import Link from "next/link";

export default function DemoPage() {
    const { loadDemoData } = useAppStore();
    const router = useRouter();

    useEffect(() => {
        // Load data dummy ke dalam global store
        loadDemoData();
    }, [loadDemoData]);


    return (
        <main className="flex flex-col h-screen w-full overflow-hidden bg-background text-foreground font-sans">
            {/* Demo Banner */}
            <div className="bg-primary px-4 py-2 flex flex-col sm:flex-row items-center justify-between text-white text-xs sm:text-sm font-semibold z-50 gap-2 shrink-0">
                <div className="flex items-center gap-3">
                    <Link href="/" className="bg-white/20 hover:bg-white/35 text-white px-3 py-1 rounded-lg transition-colors flex items-center gap-1 font-bold">
                        Beranda
                    </Link>
                    <span>Ini adalah mode demo — silakan masuk atau daftar untuk menyimpan progres nyata Anda.</span>
                </div>
                <Link
                    href="/login"
                    className="mt-2 sm:mt-0 bg-white text-primary px-4 py-1 rounded-full font-bold shadow-sm hover:bg-gray-100 transition-colors"
                >
                    Masuk
                </Link>
            </div>

            {/* Navbar */}
            <header className="flex justify-between items-center px-4 sm:px-8 py-4 z-20 relative bg-background border-b border-gray-100 dark:border-gray-800 shadow-sm lg:shadow-none shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-[#a8e0cb] dark:bg-[#1a5c44] p-1.5 sm:p-2 rounded-xl">
                        <Leaf className="w-5 h-5 text-emerald-900 dark:text-emerald-100 fill-emerald-900 dark:fill-emerald-100" />
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-primary">Firest</span>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 hidden md:block border-l border-gray-200 dark:border-gray-800 pl-3">Financial Rainforest</span>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 text-muted-foreground">
                    <span title="Hanya tersedia setelah login" className="cursor-not-allowed opacity-50 hidden sm:block">
                        <Bell className="w-5 h-5" />
                    </span>

                    <span title="Hanya tersedia setelah login" className="cursor-not-allowed opacity-50">
                        <Settings className="w-5 h-5" />
                    </span>

                    {/* FOTO PROFIL & NAMA MOCK */}
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 pr-1 sm:pr-4 pl-1 sm:pl-1.5 py-1 sm:py-1.5 rounded-full border border-gray-100 dark:border-gray-700 shrink-0 opacity-80">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-white dark:bg-gray-700 shrink-0">
                            <img
                                src={`https://ui-avatars.com/api/?name=Demo+User&background=2A6A55&color=fff`}
                                alt="Demo Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-sm font-bold text-foreground hidden sm:block">
                            Demo User
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden relative">

                {/* Panel Kiri (Canvas) - Mobile: Sticky 60vh, Desktop: 60% width */}
                <section className="w-full lg:w-[60%] h-[60vh] lg:h-full shrink-0 sticky lg:relative top-0 z-0">
                    <PixiCanvas />
                </section>

                {/* Panel Kanan (Dashboard) - Mobile: overlaps canvas, Desktop: 40% width */}
                <section className="w-full lg:w-[40%] min-h-[60vh] lg:h-full relative z-10 shrink-0 bg-slate-50 dark:bg-gray-950 shadow-[0_-15px_40px_rgba(0,0,0,0.1)] lg:shadow-none lg:border-l border-gray-100 dark:border-gray-800 rounded-t-[2.5rem] lg:rounded-none overflow-hidden">
                    <DashboardPanel />
                </section>

            </div>
        </main>
    );
}
