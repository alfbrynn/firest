"use client";

import { useState } from "react";
import { Sparkles, Target, Leaf, Mail, CheckCircle2, ChevronRight, X } from "lucide-react";
import { completeTutorialAction } from "@/src/app/actions/userActions";
import { useAppStore } from "@/src/store/useAppStore";

export default function TutorialOverlay() {
    const { completeTutorial } = useAppStore();
    const [step, setStep] = useState(0);
    const [isClosing, setIsClosing] = useState(false);

    const handleComplete = async () => {
        setIsClosing(true);
        setTimeout(() => {
            completeTutorial();
            completeTutorialAction(); // Panggil backend secara diam-diam
        }, 300);
    };

    const steps = [
        {
            title: "Selamat Datang di Firest: Financial Rainforest! 🌱",
            desc: "Mari kita mulai perjalanan finansialmu. Firest bukan sekadar pencatat keuangan biasa, tapi ekosistem untuk membantumu mencapai impian.",
            icon: <Sparkles className="w-8 h-8 text-emerald-500" />
        },
        {
            title: "1. Pay Yourself First",
            desc: "Di tab Goals, tentukan 1 impian utama dan sisihkan uangmu di awal bulan. Sisa uangmu akan otomatis menjadi batas budget belanja bulanan.",
            icon: <Target className="w-8 h-8 text-blue-500" />
        },
        {
            title: "2. Hutan Virtualmu",
            desc: "Jika kamu hemat, hutanmu akan dipenuhi pepohonan hijau dan hewan lucu. Tapi hati-hati, jika kamu boros, pohonmu akan layu dan mengering!",
            icon: <Leaf className="w-8 h-8 text-emerald-600" />
        },
        {
            title: "3. Sinkronisasi Otomatis",
            desc: "Malas mencatat manual? Hubungkan akun Gmail-mu di tab Transaksi, dan Firest akan otomatis mencatat pengeluaran dari e-wallet-mu.",
            icon: <Mail className="w-8 h-8 text-orange-500" />
        }
    ];

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
            <div className="bg-white dark:bg-gray-900 w-full max-w-md p-8 rounded-[32px] shadow-2xl border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100 dark:bg-gray-800">
                    <div 
                        className="h-full bg-primary transition-all duration-300" 
                        style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                    />
                </div>

                <div className="flex justify-between items-start mb-6 mt-2">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-gray-800 flex items-center justify-center shadow-inner">
                        {steps[step].icon}
                    </div>
                    <button onClick={handleComplete} className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1">
                        Lewati <X className="w-3 h-3" />
                    </button>
                </div>

                <h3 className="text-2xl font-black text-foreground mb-3 leading-tight">{steps[step].title}</h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-8 h-20">
                    {steps[step].desc}
                </p>

                <div className="flex gap-3">
                    {step > 0 && (
                        <button 
                            onClick={() => setStep(step - 1)}
                            className="px-6 py-4 rounded-2xl font-bold text-muted-foreground bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            Kembali
                        </button>
                    )}
                    <button 
                        onClick={() => {
                            if (step === steps.length - 1) {
                                handleComplete();
                            } else {
                                setStep(step + 1);
                            }
                        }}
                        className="flex-1 bg-primary text-white font-black py-4 rounded-2xl shadow-lg hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {step === steps.length - 1 ? (
                            <>Mulai Sekarang <CheckCircle2 className="w-5 h-5" /></>
                        ) : (
                            <>Lanjut <ChevronRight className="w-5 h-5" /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
