"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/src/utils/supabase/client";
import DashboardPanel from "@/src/components/dashboard/DashboardPanel";
import PixiCanvas from "@/src/components/game/PixiCanvas";
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
            {/* Toast Notifications */}
            <ToastManager />

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

function ToastManager() {
    const { activeToast, clearToast } = useAppStore();

    useEffect(() => {
        if (activeToast && activeToast.type !== 'levelUp' && activeToast.type !== 'onboarding') {
            const timer = setTimeout(() => {
                clearToast();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [activeToast, clearToast]);

    if (!activeToast) return null;

    const { message, type, subtext } = activeToast;

    if (type === 'levelUp') {
        return (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-gradient-to-b from-amber-50 to-amber-100 dark:from-gray-900 dark:to-gray-800 w-full max-w-md p-8 rounded-[36px] shadow-[0_25px_60px_rgba(245,158,11,0.2)] border-2 border-amber-400 dark:border-amber-500/30 text-center relative overflow-hidden animate-in zoom-in-95 duration-300">
                    <div className="absolute -top-10 -left-10 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none animate-pulse"></div>
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl pointer-events-none animate-pulse"></div>

                    <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/20 border-4 border-white dark:border-gray-800 animate-bounce">
                        <span className="text-4xl">👑</span>
                    </div>

                    <h2 className="text-3xl font-extrabold text-amber-900 dark:text-amber-300 tracking-tight leading-tight mb-2">
                        {message}
                    </h2>
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-6 px-4">
                        {subtext}
                    </p>

                    <button
                        onClick={clearToast}
                        className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black py-4 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer text-sm tracking-wide"
                    >
                        Luar Biasa! ✨
                    </button>
                </div>
            </div>
        );
    }

    if (type === 'onboarding') {
        return (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white dark:bg-gray-900 w-full max-w-sm p-6 rounded-[28px] shadow-2xl border border-emerald-500/20 dark:border-emerald-500/10 text-center relative overflow-hidden animate-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 dark:border-emerald-900/30">
                        <span className="text-3xl">🌱</span>
                    </div>
                    <h3 className="text-xl font-black text-foreground mb-2">{message}</h3>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-6 px-2">
                        {subtext}
                    </p>
                    <button
                        onClick={clearToast}
                        className="w-full bg-primary hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 cursor-pointer text-xs"
                    >
                        Mulai Jelajahi
                    </button>
                </div>
            </div>
        );
    }

    let icon = "✨";
    let bgStyle = "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-foreground";
    let iconBg = "bg-primary/10 text-primary";

    if (type === 'warning') {
        icon = "⚠️";
        bgStyle = "bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/20 text-rose-950 dark:text-rose-200";
        iconBg = "bg-rose-500/10 text-rose-500";
    } else if (type === 'streak') {
        icon = "🔥";
        bgStyle = "bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/20 text-orange-950 dark:text-orange-200";
        iconBg = "bg-orange-500/10 text-orange-500";
    } else if (type === 'success') {
        icon = "✅";
        bgStyle = "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/20 text-emerald-950 dark:text-emerald-200";
        iconBg = "bg-emerald-500/10 text-emerald-500";
    }

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[120] w-full max-w-sm px-4 animate-in slide-in-from-top-4 duration-300">
            <div className={`flex items-start gap-3 p-4 rounded-2xl shadow-xl border ${bgStyle} relative overflow-hidden`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold ${iconBg}`}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0 pr-4">
                    <h4 className="text-xs font-bold leading-tight">{message}</h4>
                    {subtext && <p className="text-[10px] opacity-80 mt-1 font-medium leading-normal">{subtext}</p>}
                </div>
                <button
                    onClick={clearToast}
                    className="absolute top-3 right-3 text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100 transition-opacity text-xs font-bold"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}