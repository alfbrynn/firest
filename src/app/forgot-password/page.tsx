"use client";

import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { createClient } from "@/src/utils/supabase/client";
import { useState } from "react";
import AuthLayout from "@/src/components/auth/AuthLayout";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    const supabase = createClient();

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });
            if (error) throw error;
            setIsSubmitted(true);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <AuthLayout 
                title="Cek Email Kamu" 
                subtitle="Kami telah mengirimkan tautan pemulihan kata sandi ke email Anda."
            >
                <div className="flex flex-col items-center gap-4 py-2 w-full">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center animate-bounce-slow">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-[11px] text-center text-muted-foreground leading-relaxed px-4">
                        Jika email <strong>{email}</strong> terdaftar, Anda akan menerima petunjuk untuk mereset password dalam beberapa menit.
                    </p>
                    <Link 
                        href="/login" 
                        className="w-full bg-primary text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-[0.98] text-sm cursor-pointer"
                    >
                        Kembali ke Login
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout 
            title="Lupa Password?" 
            subtitle="Jangan khawatir! Masukkan email Anda dan kami akan mengirimkan tautan untuk mereset password."
            error={error}
            isLoading={isLoading}
        >
            <form onSubmit={handleResetPassword} className="w-full flex flex-col gap-3">
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="email"
                        placeholder="Masukkan Email Anda"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-2 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-xs font-medium"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50 text-sm cursor-pointer"
                >
                    {isLoading ? (
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                        <><Mail className="w-3.5 h-3.5" /> Kirim Link Pemulihan</>
                    )}
                </button>
            </form>

            <Link
                href="/login"
                className="mt-4 text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
            >
                Tiba-tiba ingat? <span className="text-primary">Masuk sekarang</span>
            </Link>
        </AuthLayout>
    );
}
