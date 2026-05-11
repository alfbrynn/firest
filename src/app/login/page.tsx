"use client";

import { Leaf, ArrowLeft } from "lucide-react";
import { createClient } from "@/src/utils/supabase/client";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true);

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    // SCOPE PENTING: Meminta izin untuk membaca Gmail
                    scopes: 'https://www.googleapis.com/auth/gmail.readonly',

                    // TAMBAHKAN INI: Agar dapat Refresh Token dari Google
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },

                    // Setelah login berhasil, arahkan ke callback
                    redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
                }
            });

            if (error) throw error;

        } catch (error: any) {
            console.error("Gagal login:", error.message);
            alert("Terjadi kesalahan saat login: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-background flex items-center justify-center relative overflow-hidden font-sans text-foreground">

            {/* Back Button */}
            <Link
                href="/"
                className="absolute top-6 left-6 z-20 bg-white/70 dark:bg-gray-800/70 hover:bg-white dark:hover:bg-gray-850 backdrop-blur-md p-3 rounded-full border border-gray-200/50 dark:border-gray-700/50 text-muted-foreground hover:text-foreground shadow-sm transition-all flex items-center gap-2 group"
            >
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                <span className="text-sm font-bold pr-1">Kembali</span>
            </Link>

            {/* Background Ornaments */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-200/20 dark:bg-emerald-900/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-100/30 dark:bg-orange-950/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-[420px] p-8">
                <div className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl p-10 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-white/20 dark:border-white/5 flex flex-col items-center text-center">

                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-gradient-end rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20 mb-6">
                        <Leaf className="w-8 h-8 text-white fill-white/20" />
                    </div>

                    <h1 className="text-3xl font-black text-foreground tracking-tight mb-2">Firest</h1>
                    <p className="text-sm font-medium text-muted-foreground mb-10 leading-relaxed">
                        Tumbuhkan kebiasaan finansialmu. <br />
                        Satu transaksi, satu benih.
                    </p>

                    {/* Tombol Login */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className={`w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm active:scale-[0.98]'
                            }`}
                    >
                        {isLoading ? (
                            <span className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        )}
                        {isLoading ? "Menghubungkan..." : "Lanjutkan dengan Google"}
                    </button>

                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-6 font-medium">
                        Dengan masuk, kamu menyetujui <span className="text-primary cursor-pointer hover:underline">Syarat & Ketentuan</span> kami.
                    </p>

                </div>
            </div>
        </div>
    );
}