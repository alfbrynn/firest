"use client";

import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/src/utils/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/src/components/auth/AuthLayout";
import Link from "next/link";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const supabase = createClient();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            router.push("/dashboard");
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Masuk ke Firest"
            subtitle="Financial Rainforest — Tumbuhkan kebiasaan finansialmu. Satu transaksi, satu benih."
            error={error}
            isLoading={isLoading}
        >
            <form onSubmit={handleLogin} className="w-full flex flex-col gap-2.5">
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="email"
                        placeholder="Email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-2 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-xs font-medium"
                    />
                </div>

                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Kata Sandi"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-12 py-2 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-xs font-medium"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>

                <div className="flex justify-end px-1">
                    <Link
                        href="/forgot-password"
                        className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors"
                    >
                        Lupa Kata Sandi?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary text-white font-bold py-2.5 rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50 mt-1 text-sm cursor-pointer"
                >
                    {isLoading ? (
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                        "Masuk"
                    )}
                </button>
            </form>

            <Link
                href="/register"
                className="mt-4 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
            >
                Belum punya akun? Daftar gratis
            </Link>
        </AuthLayout>
    );
}
