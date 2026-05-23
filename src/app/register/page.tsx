"use client";

import { Mail, Lock, UserPlus, ShieldCheck } from "lucide-react";
import { createClient } from "@/src/utils/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/src/components/auth/AuthLayout";
import Link from "next/link";

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const supabase = createClient();
    const router = useRouter();

    const validatePassword = (pass: string) => {
        const minLength = pass.length >= 8;
        const hasUpper = /[A-Z]/.test(pass);
        const hasLower = /[a-z]/.test(pass);
        const hasNumber = /[0-9]/.test(pass);
        
        return minLength && hasUpper && hasLower && hasNumber;
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // 1. Validasi Kecocokan Password
        if (password !== confirmPassword) {
            setError("Konfirmasi kata sandi tidak cocok.");
            return;
        }

        // 2. Validasi Kekuatan Password
        if (!validatePassword(password)) {
            setError("Kata sandi harus minimal 8 karakter dengan kombinasi huruf besar, kecil, dan angka.");
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName || email.split('@')[0]
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
            alert("Registrasi berhasil! Silakan cek email Anda untuk verifikasi.");
            router.push("/login");
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout 
            title="Daftar Akun" 
            subtitle="Buat akun baru untuk memulai perjalanan finansialmu."
            error={error}
            isLoading={isLoading}
        >
            <form onSubmit={handleRegister} className="w-full flex flex-col gap-2.5">
                <div className="relative group animate-in fade-in slide-in-from-top-2">
                    <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Nama Lengkap"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-11 pr-4 py-2 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-xs font-medium"
                    />
                </div>

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
                        type="password"
                        placeholder="Kata Sandi"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-2 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-xs font-medium"
                    />
                </div>

                <div className="relative group">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="password"
                        placeholder="Konfirmasi Kata Sandi"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-2 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-xs font-medium"
                    />
                </div>

                <div className="px-1">
                    <p className="text-[9px] text-muted-foreground font-medium flex items-center gap-1.5">
                        <span className={`w-1 h-1 rounded-full ${password.length >= 8 ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                        Minimal 8 karakter
                    </p>
                    <p className="text-[9px] text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                        <span className={`w-1 h-1 rounded-full ${(/[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password)) ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                        Kombinasi Huruf Besar, Kecil, & Angka
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50 mt-2 text-sm cursor-pointer"
                >
                    {isLoading ? (
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                        <><UserPlus className="w-3.5 h-3.5" /> Daftar Sekarang</>
                    )}
                </button>
            </form>

            <Link
                href="/login"
                className="mt-4 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
            >
                Sudah punya akun? Masuk
            </Link>
        </AuthLayout>
    );
}
