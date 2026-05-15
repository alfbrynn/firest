import { useState, useEffect } from "react";
import { User, Shield, Bell, Mail, Sun, Moon, Monitor, ChevronRight, Check, RefreshCw, Link as LinkIcon } from "lucide-react";
import { createClient } from "@/src/utils/supabase/client";

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

export default function SettingsMenuList() {
    const [currentTheme, setCurrentTheme] = useState<"light" | "dark" | "system">("system");
    const [isThemeOpen, setIsThemeOpen] = useState(false);
    const [isSyncOpen, setIsSyncOpen] = useState(false);
    const [isGmailConnected, setIsGmailConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    
    const supabase = createClient();

    useEffect(() => {
        const checkConnection = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Cek metadata atau tabel profil (asumsi ada field is_gmail_connected)
                const connected = user.app_metadata?.provider === 'google' || user.user_metadata?.is_gmail_connected;
                setIsGmailConnected(!!connected);
            }
        };

        const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null;
        if (savedTheme) {
            setCurrentTheme(savedTheme);
        }
        checkConnection();
    }, [supabase]);

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
            {settingsMenu.map((item) => {
                const isThemeItem = item.id === "theme";
                const isSyncItem = item.id === "sync";
                
                return (
                    <div key={item.id} className="flex flex-col">
                        <div
                            onClick={() => {
                                if (isThemeItem) setIsThemeOpen(!isThemeOpen);
                                if (isSyncItem) setIsSyncOpen(!isSyncOpen);
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
                                <ChevronRight className={`w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-all ${(isThemeItem && isThemeOpen) || (isSyncItem && isSyncOpen) ? 'rotate-90 text-primary' : 'group-hover:translate-x-1'}`} />
                            </div>
                        </div>

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