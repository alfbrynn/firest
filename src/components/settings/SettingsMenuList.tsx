import { useState, useEffect } from "react";
import { User, Shield, Bell, Mail, Sun, Moon, Monitor, ChevronRight, Check, RefreshCw, Link as LinkIcon } from "lucide-react";
import { createClient } from "@/src/utils/supabase/client";
import Link from "next/link";

const settingsMenu = [
    {
        id: "profile",
        icon: <User className="w-5 h-5 text-emerald-600" />,
        title: "Detail Profil",
        desc: "Ubah nama, avatar, dan informasi personal Anda",
        badge: "Lengkap"
    },
    {
        id: "security",
        icon: <Shield className="w-5 h-5 text-blue-600" />,
        title: "Keamanan Akun",
        desc: "Kelola kata sandi dan proteksi otentikasi dua faktor"
    },
    {
        id: "notification",
        icon: <Bell className="w-5 h-5 text-amber-500" />,
        title: "Notifikasi",
        desc: "Sesuaikan peringatan pengeluaran & pengingat budget harian"
    },
    {
        id: "sync",
        icon: <Mail className="w-5 h-5 text-primary" />,
        title: "Sinkronisasi Otomatis",
        desc: "Atur sambungan otomatis ke inbox Gmail Anda",
    },
    {
        id: "theme",
        icon: <Sun className="w-5 h-5 text-rose-500" />,
        title: "Tema & Tampilan",
        desc: "Beralih antara Mode Terang, Gelap, atau Sistem otomatis"
    }
];

import { updateNotifPreferencesAction, getUserPreferencesAction } from "@/src/app/actions/userActions";

export default function SettingsMenuList() {
    const [currentTheme, setCurrentTheme] = useState<"light" | "dark" | "system">("system");
    const [isThemeOpen, setIsThemeOpen] = useState(false);
    const [isSyncOpen, setIsSyncOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSecurityOpen, setIsSecurityOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [showDevModal, setShowDevModal] = useState(false);
    
    const [isGmailConnected, setIsGmailConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    // State untuk Notifikasi (Asli dari DB)
    const [notifSettings, setNotifSettings] = useState({
        spending: true,
        budget: true,
        ai: true
    });
    
    const supabase = createClient();

    useEffect(() => {
        const checkConnection = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const connected = user.app_metadata?.provider === 'google' || user.user_metadata?.is_gmail_connected;
                setIsGmailConnected(!!connected);
                
                // Ambil preferensi notifikasi
                const prefResult = await getUserPreferencesAction();
                if (prefResult.success && prefResult.data) {
                    setNotifSettings({
                        spending: prefResult.data.notif_spending_alert,
                        budget: prefResult.data.notif_budget_reminder,
                        ai: prefResult.data.notif_ai_insight
                    });
                }
            }
        };

        const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null;
        if (savedTheme) {
            setCurrentTheme(savedTheme);
        }
        checkConnection();
    }, [supabase]);

    const handleNotifToggle = async (id: 'spending' | 'budget' | 'ai') => {
        const newValue = !notifSettings[id];
        
        // Optimistic UI update
        setNotifSettings(prev => ({ ...prev, [id]: newValue }));

        // Update ke database
        const dbKey = id === 'spending' ? 'notif_spending_alert' : 
                      id === 'budget' ? 'notif_budget_reminder' : 
                      'notif_ai_insight';
        
        const result = await updateNotifPreferencesAction({ [dbKey]: newValue });
        
        if (!result.success) {
            // Revert jika gagal
            setNotifSettings(prev => ({ ...prev, [id]: !newValue }));
            alert("Gagal menyimpan preferensi: " + result.error);
        }
    };

    const handleThemeChange = (theme: "light" | "dark" | "system") => {
        setCurrentTheme(theme);
        localStorage.setItem("theme", theme);
        const root = document.documentElement;
        if (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
            root.classList.add("dark");
            root.classList.remove("light");
        } else {
            root.classList.add("light");
            root.classList.remove("dark");
        }
    };

    const handleConnectGmail = async () => {
        try {
            setIsConnecting(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    scopes: 'https://www.googleapis.com/auth/gmail.readonly',
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                    redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
                }
            });
            if (error) throw error;
        } catch (error: any) {
            console.error("Gagal koneksi Gmail:", error.message);
            alert("Gagal menghubungkan Gmail: " + error.message);
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <div className="flex flex-col gap-1">
            {/* Modal Fitur Dalam Pengembangan */}
            {showDevModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm animate-in fade-in duration-300" 
                        onClick={() => setShowDevModal(false)}
                    />
                    <div className="relative bg-white dark:bg-gray-900 w-full max-w-[340px] p-8 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white dark:border-gray-800 animate-in zoom-in-95 duration-200 text-center">
                        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <RefreshCw className="w-8 h-8 text-primary animate-spin-slow" />
                        </div>
                        <h3 className="text-xl font-black text-foreground mb-2">Segera Hadir!</h3>
                        <p className="text-sm font-medium text-muted-foreground mb-8 leading-relaxed">
                            Fitur ini sedang dalam tahap pengembangan intensif oleh tim Firest. Nantikan update serunya!
                        </p>
                        <button
                            onClick={() => setShowDevModal(false)}
                            className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/10"
                        >
                            Siap, Mengerti!
                        </button>
                    </div>
                </div>
            )}

            {settingsMenu.map((item) => {
                const isThemeItem = item.id === "theme";
                const isSyncItem = item.id === "sync";
                const isProfileItem = item.id === "profile";
                const isSecurityItem = item.id === "security";
                const isNotifItem = item.id === "notification";

                const isOpen = (isThemeItem && isThemeOpen) || 
                               (isSyncItem && isSyncOpen) ||
                               (isProfileItem && isProfileOpen) ||
                               (isSecurityItem && isSecurityOpen) ||
                               (isNotifItem && isNotifOpen);
                
                return (
                    <div key={item.id} className="flex flex-col">
                        <div
                            onClick={() => {
                                if (isThemeItem) setIsThemeOpen(!isThemeOpen);
                                if (isSyncItem) setIsSyncOpen(!isSyncOpen);
                                if (isProfileItem) setIsProfileOpen(!isProfileOpen);
                                if (isSecurityItem) setIsSecurityOpen(!isSecurityOpen);
                                if (isNotifItem) setIsNotifOpen(!isNotifOpen);
                            }}
                            className="group flex items-center justify-between p-4 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-all cursor-pointer rounded-[16px] active:scale-[0.99]"
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-11 h-11 rounded-[14px] bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 group-hover:bg-white dark:group-hover:bg-gray-800 group-hover:shadow-sm transition-all flex items-center justify-center shrink-0">
                                    {isThemeItem && currentTheme === "dark" ? (
                                        <Moon className="w-5 h-5 text-purple-400" />
                                    ) : isThemeItem && currentTheme === "system" ? (
                                        <Monitor className="w-5 h-5 text-rose-500" />
                                    ) : (
                                        item.icon
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[15px] font-bold text-foreground leading-tight mb-1 group-hover:text-primary transition-colors">
                                        {item.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate max-w-[220px] sm:max-w-md">
                                        {isSyncItem && isGmailConnected ? "Terhubung ke Gmail ✅" : item.desc}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                {isSyncItem && isGmailConnected && (
                                    <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider bg-[#e8f4ec] dark:bg-emerald-950/40 text-[#2A6A55] dark:text-emerald-400 px-2.5 py-1.5 rounded-lg border border-emerald-100/50 dark:border-emerald-900/30">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Aktif
                                    </span>
                                )}
                                <ChevronRight className={`w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-all ${isOpen ? 'rotate-90 text-primary' : 'group-hover:translate-x-1'}`} />
                            </div>
                        </div>

                        {/* Dropdown Profile */}
                        {isProfileItem && isProfileOpen && (
                            <div className="px-4 pb-5 pt-2 flex flex-col gap-4 border-t border-gray-100/40 dark:border-gray-800/20 bg-gray-50/30 dark:bg-gray-900/10 rounded-b-[16px] animate-fade-in">
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider block mb-2 px-1">Nama Tampilan</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="Masukkan nama baru..."
                                            className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        />
                                        <button className="bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-sm shadow-primary/10">Simpan</button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-3 px-1">Nama ini akan terlihat di dashboard dan avatar utama Anda.</p>
                                </div>
                            </div>
                        )}

                        {/* Dropdown Security */}
                        {isSecurityItem && isSecurityOpen && (
                            <div className="px-4 pb-5 pt-2 flex flex-col gap-4 border-t border-gray-100/40 dark:border-gray-800/20 bg-gray-50/30 dark:bg-gray-900/10 rounded-b-[16px] animate-fade-in">
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
                                    <button 
                                        onClick={() => setShowDevModal(true)}
                                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
                                    >
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm font-bold">Ganti Kata Sandi</span>
                                            <span className="text-[10px] text-muted-foreground">Terakhir diubah 3 bulan lalu</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    </button>
                                    <button 
                                        onClick={() => setShowDevModal(true)}
                                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
                                    >
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm font-bold">Otentikasi 2 Faktor (2FA)</span>
                                            <span className="text-[10px] text-rose-500 font-bold">Belum Aktif</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Dropdown Notifications */}
                        {isNotifItem && isNotifOpen && (
                            <div className="px-4 pb-5 pt-2 flex flex-col gap-4 border-t border-gray-100/40 dark:border-gray-800/20 bg-gray-50/30 dark:bg-gray-900/10 rounded-b-[16px] animate-fade-in">
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                                    {[
                                        { id: 'spending', label: 'Peringatan Pengeluaran', desc: 'Beri tahu jika jajan sudah mendekati limit.' },
                                        { id: 'budget', label: 'Pengingat Budget Harian', desc: 'Saran budget harian setiap pagi.' },
                                        { id: 'ai', label: 'Insight AI Mingguan', desc: 'Analisis mendalam setiap Senin.' }
                                    ].map((n) => (
                                        <div key={n.id} className="flex items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <p className="text-sm font-bold leading-tight">{n.label}</p>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">{n.desc}</p>
                                            </div>
                                            <button 
                                                onClick={() => handleNotifToggle(n.id as any)}
                                                className={`w-10 h-5.5 rounded-full transition-all relative ${notifSettings[n.id as keyof typeof notifSettings] ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
                                            >
                                                <div className={`absolute top-1 w-3.5 h-3.5 bg-white rounded-full transition-all ${notifSettings[n.id as keyof typeof notifSettings] ? 'right-1' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Dropdown Sync Gmail */}
                        {isSyncItem && isSyncOpen && (
                            <div className="px-4 pb-5 pt-2 flex flex-col gap-4 border-t border-gray-100/40 dark:border-gray-800/20 bg-gray-50/30 dark:bg-gray-900/10 rounded-b-[16px] animate-fade-in">
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <h4 className="text-sm font-black mb-1 flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4 text-primary" /> Auto-Sync Transaksi
                                    </h4>
                                    <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">
                                        Hubungkan Gmail Anda agar Firest bisa otomatis mencatat pengeluaran dari email bank & e-wallet.
                                    </p>
                                    
                                    <button
                                        onClick={handleConnectGmail}
                                        disabled={isConnecting || isGmailConnected}
                                        className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                                            isGmailConnected 
                                            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 cursor-default"
                                            : "bg-primary text-white hover:bg-emerald-700 active:scale-[0.98]"
                                        }`}
                                    >
                                        {isConnecting ? (
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        ) : isGmailConnected ? (
                                            <>✅ Gmail Sudah Terhubung</>
                                        ) : (
                                            <><LinkIcon className="w-4 h-4" /> Hubungkan Gmail Sekarang</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Dropdown Pilihan Tema */}
                        {isThemeItem && isThemeOpen && (
                            <div className="px-4 pb-4 pt-1 flex flex-col gap-2 border-t border-gray-100/40 dark:border-gray-800/20 bg-gray-50/30 dark:bg-gray-900/10 rounded-b-[16px] animate-fade-in">
                                {[
                                    { id: "light", label: "Mode Terang", icon: <Sun className="w-4 h-4" /> },
                                    { id: "dark", label: "Mode Gelap", icon: <Moon className="w-4 h-4" /> },
                                    { id: "system", label: "Sistem Otomatis (Laptop)", icon: <Monitor className="w-4 h-4" /> },
                                ].map((option) => {
                                    const isActive = currentTheme === option.id;
                                    return (
                                        <button
                                            key={option.id}
                                            onClick={() => handleThemeChange(option.id as any)}
                                            className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                                                isActive
                                                    ? "bg-primary/10 text-primary dark:bg-primary/20"
                                                    : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-gray-800/40 hover:text-foreground"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={isActive ? "text-primary" : "text-muted-foreground"}>
                                                    {option.icon}
                                                </span>
                                                {option.label}
                                            </div>
                                            {isActive && <Check className="w-4 h-4 text-primary" />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}