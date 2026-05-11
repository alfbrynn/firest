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
    const { xp, level } = useAppStore();
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
            <header className="flex justify-between items-center px-8 py-4 z-10 relative bg-background border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="bg-[#a8e0cb] dark:bg-[#1a5c44] p-2 rounded-xl">
                        <Leaf className="w-5 h-5 text-emerald-900 dark:text-emerald-100 fill-emerald-900 dark:fill-emerald-100" />
                    </div>
                    <span className="text-2xl font-bold text-primary">Firest</span>
                </div>

                <div className="flex items-center gap-4 text-muted-foreground">
                    <Bell className="w-5 h-5 cursor-pointer hover:text-foreground transition-colors" />
                    
                    <Link href="/settings" title="Pengaturan">
                        <Settings className="w-5 h-5 cursor-pointer hover:text-foreground transition-colors" />
                    </Link>

                    {/* FOTO PROFIL & NAMA */}
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 pr-4 pl-1.5 py-1.5 rounded-full border border-gray-100 dark:border-gray-700 shrink-0">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-white dark:bg-gray-700 shrink-0">
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
            <div className="flex flex-1 overflow-hidden">
                <section className="w-[60%] h-full relative">
                    <PixiCanvas />
                </section>

                <section className="w-[40%] h-full relative">
                    <DashboardPanel />
                </section>
            </div>
        </main>
    );
}