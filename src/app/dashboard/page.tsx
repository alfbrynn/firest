"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/src/utils/supabase/client";
import DashboardPanel from "@/src/components/dashboard/DashboardPanel";
import PixiCanvas from "@/src/components/game/PixiCanvas";
import TutorialOverlay from "@/src/components/dashboard/TutorialOverlay";
import OnboardingOverlay from "@/src/components/dashboard/OnboardingOverlay";
import { Bell, Settings, Leaf } from "lucide-react";
import { useAppStore } from "@/src/store/useAppStore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
    const { fetchUserData, fullName, avatarUrl, isLoading, hasCompletedTutorial, monthlyIncomeTarget, isDemo } = useAppStore();
    const [user, setUser] = useState<any>(null);
    const [isChecking, setIsChecking] = useState(true); // Tambahkan state loading
    const router = useRouter();
    const supabase = createClient();



    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                setUser(session.user);
                setIsChecking(false);
            } else if (event === 'SIGNED_OUT') {
                router.push('/login');
            }
        });

        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                setIsChecking(false);
            } else {
                router.push('/login');
            }
        };

        checkUser();

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [router, supabase]);

    // Ambil data gamifikasi dan transaksi dari Supabase ketika user terdeteksi
    useEffect(() => {
        if (user?.id) {
            fetchUserData(user.id);
        }
    }, [user, fetchUserData]);

    // Jangan render dashboard jika user belum di-load (mencegah kedipan UI)
    if (!user || isChecking) {
        return (
            <div className="h-screen w-full bg-background flex flex-col items-center justify-center gap-4 text-foreground">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground font-medium animate-pulse">Menyiapkan taman Anda...</p>
            </div>
        );
    }

    return (
        <main className="flex flex-col h-screen w-full overflow-hidden bg-background text-foreground font-sans">
            {/* Tutorial Overlay */}
            {!isLoading && !hasCompletedTutorial && monthlyIncomeTarget > 0 && <TutorialOverlay />}

            {/* Onboarding Overlay */}
            {!isLoading && !isDemo && monthlyIncomeTarget === 0 && <OnboardingOverlay userId={user.id} />}

            {/* Navbar */}
            <header className="flex justify-between items-center px-4 sm:px-8 py-3 z-20 relative bg-background border-b border-gray-100 dark:border-gray-800 shadow-sm lg:shadow-none">
                <div className="flex items-center gap-2 sm:gap-2.5">
                    <div className="bg-[#a8e0cb] dark:bg-[#1a5c44] p-1.5 rounded-lg">
                        <Leaf className="w-4.5 h-4.5 text-emerald-900 dark:text-emerald-100 fill-emerald-900 dark:fill-emerald-100" />
                    </div>
                    <span className="text-lg sm:text-xl font-black text-primary tracking-tight">Firest</span>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 hidden md:block border-l border-gray-200 dark:border-gray-800 pl-2.5">Financial Rainforest</span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground">
                    <Link href="/notifications" className="relative group p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all">
                        <Bell className="w-4.5 h-4.5 cursor-pointer text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary rounded-full border border-background animate-pulse"></span>
                    </Link>

                    <Link href="/settings" title="Pengaturan" className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all">
                        <Settings className="w-4.5 h-4.5 cursor-pointer hover:text-foreground transition-colors" />
                    </Link>

                    {/* FOTO PROFIL & NAMA */}
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 pr-1.5 sm:pr-3.5 pl-1 sm:pl-1 py-0.5 sm:py-1 rounded-full border border-gray-100 dark:border-gray-700 shrink-0">
                        <div className="w-6 h-6 sm:w-7.5 sm:h-7.5 rounded-full overflow-hidden bg-white dark:bg-gray-700 shrink-0">
                            <img
                                src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2A6A55&color=fff`}
                                alt="User Avatar"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2A6A55&color=fff`;
                                }}
                            />
                        </div>
                        {/* Menampilkan nama depan user di sebelah foto */}
                        <span className="text-xs font-bold text-foreground hidden sm:block">
                            {fullName.split(' ')[0]}
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