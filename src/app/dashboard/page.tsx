"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/src/utils/supabase/client";
import DashboardPanel from "@/src/components/dashboard/DashboardPanel";
import PixiCanvas from "@/src/components/game/PixiCanvas";
import { Bell, Settings, Leaf } from "lucide-react";
import { useAppStore } from "@/src/store/useAppStore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
    const { fetchUserData, isLoading } = useAppStore();
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

    // Ambil data gamifikasi dan transaksi dari Supabase ketika user terdeteksi
    useEffect(() => {
        if (user?.id) {
            fetchUserData(user.id);
        }
    }, [user, fetchUserData]);

    // === TAMBAHKAN KODE INI DI SINI ===
    // Auto-Sync Gmail di Latar Belakang
    useEffect(() => {
        if (user?.id) {
            const runBackgroundSync = async () => {
                // 1. Cek kapan terakhir kali kita melakukan sync
                const lastSync = localStorage.getItem('last_gmail_sync');
                const now = new Date().getTime();

                // Set batas waktu cooldown (misal: 1 jam = 3600000 milidetik)
                // Untuk masa testing, kita buat 15 menit saja (15 * 60 * 1000 = 900000)
                const COOLDOWN_TIME = 15 * 60 * 1000;

                if (lastSync && (now - parseInt(lastSync)) < COOLDOWN_TIME) {
                    console.log("Menunggu cooldown. Sinkronisasi Gmail ditunda sementara.");
                    return; // Hentikan proses, jangan panggil API
                }

                try {
                    console.log("Mengecek struk baru di Gmail...");
                    const response = await fetch("/api/sync-gmail", { method: "POST" });

                    if (response.ok) {
                        // 2. Jika sukses, catat waktu sekarang di memori browser
                        localStorage.setItem('last_gmail_sync', now.toString());

                        const data = await response.json();
                        console.log(data.message);

                        // Jika ada transaksi masuk, update layar
                        if (data.message.includes("Berhasil sinkronisasi")) {
                            fetchUserData(user.id);
                        }
                    }
                } catch (error) {
                    console.error("Gagal auto-sync Gmail:", error);
                }
            };

            runBackgroundSync();
        }
    }, [user?.id, fetchUserData]);
    // ==================================

    // Hentikan rendering (tampilkan loading) selama proses pengecekan URL
    if (isChecking) {
        return (
            <div className="h-screen w-full bg-background flex flex-col items-center justify-center gap-4 text-foreground">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground font-medium animate-pulse">Menyiapkan taman Anda...</p>
            </div>
        );
    }



    // Ekstrak data profil seaman mungkin
    const metadata = user?.user_metadata || {};
    // Fallback: full_name -> name -> email -> "User"
    const fallbackName = metadata.full_name || metadata.name || user?.email || "User";
    const userAvatar = metadata.avatar_url || metadata.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=2A6A55&color=fff`;

    // Jangan render dashboard jika user belum di-load (mencegah kedipan UI)
    if (!user) return <div className="h-screen w-full bg-background flex items-center justify-center text-foreground">Memuat...</div>;

    return (
        <main className="flex flex-col h-screen w-full overflow-hidden bg-background text-foreground font-sans">
            {/* Navbar */}
            <header className="flex justify-between items-center px-4 sm:px-8 py-4 z-20 relative bg-background border-b border-gray-100 dark:border-gray-800 shadow-sm lg:shadow-none">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-[#a8e0cb] dark:bg-[#1a5c44] p-1.5 sm:p-2 rounded-xl">
                        <Leaf className="w-5 h-5 text-emerald-900 dark:text-emerald-100 fill-emerald-900 dark:fill-emerald-100" />
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-primary">Firest</span>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 text-muted-foreground">
                    <Bell className="w-5 h-5 cursor-pointer hover:text-foreground transition-colors hidden sm:block" />

                    <Link href="/settings" title="Pengaturan">
                        <Settings className="w-5 h-5 cursor-pointer hover:text-foreground transition-colors" />
                    </Link>

                    {/* FOTO PROFIL & NAMA */}
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 pr-1 sm:pr-4 pl-1 sm:pl-1.5 py-1 sm:py-1.5 rounded-full border border-gray-100 dark:border-gray-700 shrink-0">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-white dark:bg-gray-700 shrink-0">
                            <img
                                src={userAvatar}
                                alt="User Avatar"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=2A6A55&color=fff`;
                                }}
                            />
                        </div>
                        {/* Menampilkan nama depan user di sebelah foto */}
                        <span className="text-sm font-bold text-foreground hidden sm:block">
                            {fallbackName.split(' ')[0]}
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