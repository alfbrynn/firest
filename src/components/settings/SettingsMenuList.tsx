import { User, Shield, Bell, Mail, Sun, ChevronRight } from "lucide-react";

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
        // Ikon Mail kita beri warna hijau khas Firest karena ini fitur unggulan kita
        icon: <Mail className="w-5 h-5 text-[#2A6A55]" />,
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

export default function SettingsMenuList() {
    return (
        <div className="flex flex-col gap-1">
            {settingsMenu.map((item, index) => (
                <div
                    key={index}
                    className="group flex items-center justify-between p-4 hover:bg-gray-50/80 transition-all cursor-pointer rounded-[16px] active:scale-[0.99]"
                >
                    <div className="flex items-center gap-4 min-w-0">
                        {/* Box Icon dengan efek hover */}
                        <div className="w-11 h-11 rounded-[14px] bg-gray-50/50 border border-gray-100 group-hover:bg-white group-hover:shadow-sm transition-all flex items-center justify-center shrink-0">
                            {item.icon}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[15px] font-bold text-gray-800 leading-tight mb-1 group-hover:text-[#2A6A55] transition-colors">{item.title}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[220px] sm:max-w-md">{item.desc}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        {item.badge && (
                            <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider bg-[#e8f4ec] text-[#2A6A55] px-2.5 py-1.5 rounded-lg border border-emerald-100/50">
                                {/* Efek titik menyala (pulse) khusus untuk badge "Aktif" */}
                                {item.badge === "Aktif" && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                )}
                                {item.badge}
                            </span>
                        )}
                        {/* Ikon panah bergeser sedikit saat di-hover */}
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400 group-hover:translate-x-1 transition-all" />
                    </div>
                </div>
            ))}
        </div>
    );
}