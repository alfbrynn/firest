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
        <div className="min-h-screen w-full bg-[#F7F9F7] relative overflow-x-hidden">
            {/* Dekorasi Background Ambient */}
            <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-200/30 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-orange-100/40 rounded-full blur-3xl pointer-events-none"></div>

            {/* PERBAIKAN SPASI: Menambahkan pt-12 sm:pt-20 (Jarak atas) dan pb-16 (Jarak bawah) */}
            <div className="relative z-10 max-w-2xl mx-auto px-6 pt-12 pb-16 sm:pt-20">

                {/* PERBAIKAN SPASI HEADER: Menambahkan mb-12 sm:mb-16 (Jarak ke kotak profil) */}
                <div className="flex items-center justify-between gap-4 mb-12 sm:mb-16">
                    <Link
                        href="/dashboard"
                        className="group flex items-center gap-2 text-gray-500 hover:text-[#2A6A55] transition-colors font-bold text-sm bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md w-fit shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Kembali ke Taman
                    </Link>

                    {/* Judul Halaman */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <h1 className="text-xl sm:text-2xl font-black text-gray-800 tracking-tight">Pengaturan</h1>
                        <div className="bg-[#e8f4ec] p-2 sm:p-2.5 rounded-xl border border-emerald-100 shrink-0">
                            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-[#2A6A55]" />
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
                    <div className="bg-white/90 backdrop-blur-xl rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-2">
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