import { Sparkles } from "lucide-react";

interface ProfileHeroCardProps {
    fullName: string;
    email: string;
    avatarUrl: string;
}

export default function ProfileHeroCard({ fullName, email, avatarUrl }: ProfileHeroCardProps) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-[16px] p-4 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-sm mb-0 relative overflow-hidden">

            {/* Dekorasi halus di pojok */}
            <div className="absolute right-0 top-0 w-32 h-32 bg-[#e8f4ec]/60 dark:bg-emerald-950/20 rounded-full blur-2xl translate-x-1/2 -translate-y-1/3 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 sm:gap-5">

                {/* Foto Profil */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border-[2px] border-[#e8f4ec] dark:border-emerald-950/50 shadow-xs shrink-0 bg-gray-50 dark:bg-gray-800">
                    <img
                        src={avatarUrl}
                        alt="Profile avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2A6A55&color=fff`;
                        }}
                    />
                </div>

                {/* Info Profil */}
                <div className="text-center sm:text-left flex-1">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-0.5">
                        <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight">{fullName}</h2>
                        <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    </div>

                    <p className="text-[11px] font-medium text-muted-foreground mb-2">{email}</p>

                    {/* Badge Akun Google */}
                    <div className="inline-flex items-center justify-start gap-1.5 text-[9px] uppercase font-bold tracking-wider bg-[#e8f4ec] dark:bg-emerald-950/40 text-[#2A6A55] dark:text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-100/50 dark:border-emerald-900/30 whitespace-nowrap w-fit mx-auto sm:mx-0">
                        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Akun Google Terhubung
                    </div>
                </div>

            </div>
        </div>
    );
}