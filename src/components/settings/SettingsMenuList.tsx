import { useState, useEffect } from "react";
import { User, Shield, Bell, Mail, Sun, Moon, Monitor, ChevronRight, Check } from "lucide-react";

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
        // Ikon Mail kita beri warna hijau khas Firest karena ini fitur unggulan kita
        icon: <Mail className="w-5 h-5 text-primary" />,
        title: "Sinkronisasi Otomatis",
        desc: "Atur sambungan otomatis ke inbox Gmail Anda",
        badge: "Aktif"
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

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null;
        if (savedTheme) {
            setCurrentTheme(savedTheme);
        }
    }, []);

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

    return (
        <div className="flex flex-col gap-1">
            {settingsMenu.map((item) => {
                const isThemeItem = item.id === "theme";
                
                return (
                    <div key={item.id} className="flex flex-col">
                        <div
                            onClick={() => {
                                if (isThemeItem) {
                                    setIsThemeOpen(!isThemeOpen);
                                }
                            }}
                            className="group flex items-center justify-between p-4 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-all cursor-pointer rounded-[16px] active:scale-[0.99]"
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                {/* Box Icon dengan efek hover */}
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
                                        {isThemeItem 
                                            ? `Aktif: ${currentTheme === "dark" ? "Mode Gelap" : currentTheme === "light" ? "Mode Terang" : "Sistem"}` 
                                            : item.desc}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                {item.badge && (
                                    <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider bg-[#e8f4ec] dark:bg-emerald-950/40 text-[#2A6A55] dark:text-emerald-400 px-2.5 py-1.5 rounded-lg border border-emerald-100/50 dark:border-emerald-900/30">
                                        {item.badge === "Aktif" && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        )}
                                        {item.badge}
                                    </span>
                                )}
                                <ChevronRight className={`w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-all ${isThemeItem && isThemeOpen ? 'rotate-90 text-primary' : 'group-hover:translate-x-1'}`} />
                            </div>
                        </div>

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