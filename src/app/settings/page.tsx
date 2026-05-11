"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/src/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
    ArrowLeft, 
    User, 
    Bell, 
    Mail, 
    Sun, 
    Shield, 
    LogOut, 
    ChevronRight,
    Sparkles
} from "lucide-react";

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
                <p className="text-gray-500 font-medium">Memuat pengaturan...</p>
            </div>
        );
    }

    const metadata = user?.user_metadata || {};
    const fullName = metadata.full_name || metadata.name || user?.email || "User";
    const userAvatar = metadata.avatar_url || metadata.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2A6A55&color=fff`;

    const settingsMenu = [
        {
            icon: <User className="w-5 h-5 text-emerald-600" />,
            title: "Detail Profil",
            desc: "Ubah nama, avatar, dan informasi personal Anda",
            badge: "Lengkap"
        },
        {
            icon: <Shield className="w-5 h-5 text-blue-600" />,
            title: "Keamanan Akun",
            desc: "Kelola kata sandi dan proteksi otentikasi dua faktor"
        },
        {
            icon: <Bell className="w-5 h-5 text-amber-500" />,
            title: "Notifikasi",
            desc: "Sesuaikan peringatan pengeluaran & pengingat budget harian"
        },
        {
            icon: <Mail className="w-5 h-5 text-indigo-500" />,
            title: "Sinkronisasi Otomatis",
            desc: "Atur sambungan otomatis ke inbox Gmail Anda",
            badge: "Aktif"
        },
        {
            icon: <Sun className="w-5 h-5 text-rose-500" />,
            title: "Tema & Tampilan",
            desc: "Beralih antara Mode Terang, Gelap, atau Sistem otomatis"
        }
    ];

    return (
        <div className="min-h-screen w-full bg-[#F7F9F7] py-12 px-6">
            <div className="max-w-2xl mx-auto">
                
                {/* Back Button */}
                <Link 
                    href="/dashboard" 
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-semibold text-sm mb-8 bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] w-fit"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Dashboard
                </Link>

                <h1 className="text-3xl font-black text-gray-800 tracking-tight mb-6">Pengaturan</h1>

                {/* Profile Hero Card */}
                <div className="bg-gradient-to-br from-[#2A6A55] to-[#174031] rounded-[28px] p-8 text-white shadow-xl shadow-emerald-950/10 mb-8 relative overflow-hidden">
                    <div className="absolute right-[-5%] top-[-5%] w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
                    <div className="absolute left-[-5%] bottom-[-5%] w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl"></div>

                    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/20 shadow-md bg-white/10 shrink-0">
                            <img 
                                src={userAvatar} 
                                alt="Profile avatar" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=ffffff&color=2A6A55`;
                                }}
                            />
                        </div>
                        <div className="text-center sm:text-left flex-1">
                            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                                <h2 className="text-2xl font-bold tracking-tight">{fullName}</h2>
                                <Sparkles className="w-4 h-4 text-emerald-300" />
                            </div>
                            <p className="text-sm text-emerald-200/80 font-medium mb-1">{user?.email}</p>
                            <span className="inline-block text-[10px] uppercase font-bold tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-md backdrop-blur-sm">
                                Akun Google Terhubung
                            </span>
                        </div>
                    </div>
                </div>

                {/* Settings Options List */}
                <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden mb-8">
                    {settingsMenu.map((item, index) => (
                        <div 
                            key={index} 
                            className={`flex items-center justify-between p-5 hover:bg-gray-50/75 transition-colors cursor-pointer ${
                                index !== settingsMenu.length - 1 ? 'border-b border-gray-100' : ''
                            }`}
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                                    {item.icon}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[15px] font-bold text-gray-800 leading-tight mb-1">{item.title}</p>
                                    <p className="text-xs text-gray-500 truncate max-w-sm sm:max-w-md">{item.desc}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 shrink-0">
                                {item.badge && (
                                    <span className="text-[10px] font-bold bg-[#e8f4ec] text-[#2A6A55] px-2.5 py-0.5 rounded-full border border-[#d1ebd9]">
                                        {item.badge}
                                    </span>
                                )}
                                <ChevronRight className="w-5 h-5 text-gray-300" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full bg-white hover:bg-red-50 text-red-600 border border-red-100 hover:border-red-200 py-4.5 rounded-[20px] font-bold text-base flex items-center justify-center gap-3 shadow-[0_4px_12px_rgba(220,38,38,0.02)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoggingOut ? (
                        <span className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                        <LogOut className="w-5 h-5" />
                    )}
                    {isLoggingOut ? "Keluar..." : "Keluar dari Akun"}
                </button>

            </div>
        </div>
    );
}
