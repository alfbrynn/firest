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
            <div className="bg-primary px-4 py-3 sm:py-2.5 flex flex-col sm:flex-row items-center justify-between text-white text-xs sm:text-sm font-semibold z-50 gap-3 sm:gap-2 shrink-0 text-center sm:text-left shadow-md">
                {/* Mobile: Text on top. Desktop: Button and Text side-by-side */}
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    {/* Text is always on top on mobile, but next to button on desktop */}
                    <span className="order-1 sm:order-2 leading-relaxed sm:leading-normal font-bold">
                        Ini adalah mode demo — silakan masuk atau daftar untuk menyimpan progres nyata Anda.
                    </span>
                    
                    {/* Beranda Button - placed in button container below text on mobile, or on the left on desktop */}
                    <div className="order-2 sm:order-1 flex items-center justify-center gap-3 mt-1 sm:mt-0 w-full sm:w-auto">
                        <Link href="/" className="bg-white/20 hover:bg-white/35 text-white px-3.5 py-1 rounded-lg transition-all flex items-center gap-1 font-bold active:scale-95 shrink-0 text-[11px] sm:text-xs">
                            Beranda
                        </Link>
                        
                        {/* Masuk Button only shown in this container on mobile */}
                        <Link
                            href="/login"
                            className="inline-flex sm:hidden bg-white text-primary px-4 py-1 rounded-lg font-bold shadow-sm hover:bg-gray-100 transition-all active:scale-95 text-[11px]"
                        >
                            Masuk
                        </Link>
                    </div>
                </div>

                {/* Masuk Button only shown on desktop at the end */}
                <Link
                    href="/login"
                    className="hidden sm:inline-flex bg-white text-primary px-4 py-1.5 rounded-full font-bold shadow-sm hover:bg-gray-100 transition-all active:scale-95 text-xs"
                >
                    Masuk
                </Link>
            </div>

            {/* Navbar */}
            <header className="flex justify-between items-center px-4 sm:px-8 py-3 z-20 relative bg-background border-b border-gray-100 dark:border-gray-800 shadow-sm lg:shadow-none shrink-0">
                <div className="flex items-center gap-2 sm:gap-2.5">
                    <div className="bg-[#a8e0cb] dark:bg-[#1a5c44] p-1.5 rounded-lg">
                        <Leaf className="w-4.5 h-4.5 text-emerald-900 dark:text-emerald-100 fill-emerald-900 dark:fill-emerald-100" />
                    </div>
                    <span className="text-lg sm:text-xl font-black text-primary tracking-tight">Firest</span>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 hidden md:block border-l border-gray-200 dark:border-gray-800 pl-2.5">Financial Rainforest</span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground">
                    <span title="Hanya tersedia setelah login" className="cursor-not-allowed opacity-50 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all inline-flex">
                        <Bell className="w-4.5 h-4.5" />
                    </span>

                    <span title="Hanya tersedia setelah login" className="cursor-not-allowed opacity-50 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all inline-flex">
                        <Settings className="w-4.5 h-4.5" />
                    </span>

                    {/* FOTO PROFIL & NAMA MOCK */}
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 pr-1.5 sm:pr-3.5 pl-1 sm:pl-1 py-0.5 sm:py-1 rounded-full border border-gray-100 dark:border-gray-700 shrink-0 opacity-80">
                        <div className="w-6 h-6 sm:w-7.5 sm:h-7.5 rounded-full overflow-hidden bg-white dark:bg-gray-700 shrink-0">
                            <img
                                src={`https://ui-avatars.com/api/?name=Demo+User&background=2A6A55&color=fff`}
                                alt="Demo Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-xs font-bold text-foreground hidden sm:block">
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
