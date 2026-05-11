"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/src/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import ProfileHeroCard from "@/src/components/settings/ProfileHeroCard";
import SettingsMenuList from "@/src/components/settings/SettingsMenuList";
import LogoutButton from "@/src/components/settings/LogoutButton";

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
            } else {
                router.push("/login");
            }
            setIsLoading(false);
        };
        checkUser();
    }, [router, supabase]);

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await supabase.auth.signOut();
            router.push("/login");
        } catch (error) {
            console.error("Gagal logout:", error);
            alert("Gagal keluar. Silakan coba lagi.");
        } finally {
            setIsLoggingOut(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen w-full bg-[#F7F9F7] flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-4 border-[#2A6A55] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium animate-pulse">Memuat pengaturan...</p>
            </div>
        );
    }

    const metadata = user?.user_metadata || {};
    const fullName = metadata.full_name || metadata.name || user?.email || "User";
    const userAvatar = metadata.avatar_url || metadata.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2A6A55&color=fff`;

    return (
        <div className="min-h-screen w-full bg-background text-foreground relative overflow-x-hidden font-sans">
            {/* Dekorasi Background Ambient */}
            <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-200/20 dark:bg-emerald-900/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-orange-100/25 dark:bg-orange-950/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* PERBAIKAN SPASI: Mengurangi pt-12 sm:pt-20 ke pt-6 sm:pt-10, serta pb-16 ke pb-12 */}
            <div className="relative z-10 max-w-2xl mx-auto px-6 pt-6 pb-12 sm:pt-10">

                {/* PERBAIKAN SPASI HEADER: Mengurangi mb-12 sm:mb-16 ke mb-6 sm:mb-8 */}
                <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
                    <Link
                        href="/dashboard"
                        className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold text-sm bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md w-fit shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Kembali ke Taman
                    </Link>

                    {/* Judul Halaman */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Pengaturan</h1>
                        <div className="bg-[#e8f4ec] dark:bg-emerald-950/40 p-2 sm:p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 shrink-0">
                            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                    </div>
                </div>

                {/* Container Konten Utama */}
                <div className="flex flex-col gap-6">
                    {/* Profile Hero Card */}
                    <ProfileHeroCard
                        fullName={fullName}
                        email={user?.email || ""}
                        avatarUrl={userAvatar}
                    />

                    {/* Settings Menu List */}
                    <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-[24px] border border-gray-100 dark:border-gray-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-2">
                        <SettingsMenuList />
                    </div>

                    {/* Logout Button */}
                    <div className="mt-2">
                        <LogoutButton
                            isLoggingOut={isLoggingOut}
                            onLogout={handleLogout}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}