"use client";

import { useState } from "react";
import { BookText, Wallet, Target, LineChart, Leaf } from "lucide-react";
import TransactionTab from "./TransactionTab";
import BudgetTab from "./BudgetTab";
import GoalsTab from "./GoalsTab";
import InsightTab from "./InsightTab";
import { useAppStore } from "@/src/store/useAppStore";

export default function DashboardPanel() {
  const [activeTab, setActiveTab] = useState("transaksi");

  return (
    <div className="w-full h-auto lg:h-full bg-slate-50 dark:bg-gray-950 flex flex-col lg:overflow-hidden relative overflow-hidden">

      {/* 1. Ambient Glow Backdrops (WOW visual factor) */}
      <div className="absolute top-[-10%] right-[-15%] w-80 h-80 rounded-full bg-emerald-400/15 dark:bg-emerald-500/5 blur-3xl pointer-events-none animate-glow-pulse" />
      <div className="absolute bottom-[20%] left-[-15%] w-96 h-96 rounded-full bg-primary/10 dark:bg-primary/5 blur-3xl pointer-events-none animate-glow-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 rounded-full bg-[#a8e0cb]/15 dark:bg-[#1a5c44]/5 blur-3xl pointer-events-none animate-glow-pulse" style={{ animationDelay: '4s' }} />

      {/* 2. Floating Forest Leaves (Bridging left and right visual identity) */}
      <div className="absolute top-24 right-6 text-emerald-500/20 dark:text-emerald-400/15 pointer-events-none animate-float-slow select-none z-0">
        <Leaf className="w-8 h-8 fill-emerald-500/10 dark:fill-emerald-400/5" />
      </div>
      <div className="absolute bottom-48 left-6 text-emerald-500/15 dark:text-emerald-400/10 pointer-events-none animate-float-slower select-none z-0">
        <Leaf className="w-6 h-6 rotate-45 fill-emerald-500/5 dark:fill-emerald-400/2" />
      </div>
      <div className="absolute top-1/2 right-12 text-emerald-600/10 dark:text-emerald-500/5 pointer-events-none animate-float-slower select-none z-0" style={{ animationDelay: '3.5s' }}>
        <Leaf className="w-5 h-5 -rotate-12 fill-emerald-600/5 dark:fill-emerald-500/2" />
      </div>

      {/* 3. Floating Micro-Particles */}
      <div className="absolute top-1/3 left-1/4 w-1.5 h-1.5 rounded-full bg-emerald-400/40 dark:bg-emerald-300/30 blur-[0.5px] pointer-events-none animate-particle-1" />
      <div className="absolute top-2/3 right-1/3 w-1 h-1 rounded-full bg-primary/40 dark:bg-emerald-400/20 blur-[0.5px] pointer-events-none animate-particle-2" />
      <div className="absolute bottom-1/4 left-1/2 w-2 h-2 rounded-full bg-emerald-300/30 dark:bg-emerald-500/10 blur-[0.5px] pointer-events-none animate-particle-3" />

      {/* Right Side Header/Navbar (Fixed Top) */}
      <div className="px-3 sm:px-4 py-3 sm:py-4 bg-slate-50/70 dark:bg-gray-950/75 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shrink-0 sticky top-0 z-20 flex items-center justify-center">
        <nav className="flex w-full space-x-1 sm:space-x-2 overflow-x-auto hide-scrollbar pb-1 sm:pb-0 relative z-10">
          {[
            { id: 'transaksi', label: 'Transaksi', icon: <BookText className="w-4 h-4" /> },
            { id: 'budget', label: 'Anggaran', icon: <Wallet className="w-4 h-4" /> },
            { id: 'goals', label: 'Target', icon: <Target className="w-4 h-4" /> },
            { id: 'insights', label: 'Analisis', icon: <LineChart className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[75px] sm:min-w-0 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 text-[10px] sm:text-xs font-black rounded-xl transition-all duration-300 active:scale-[0.97] ${activeTab === tab.id
                ? "bg-white dark:bg-gray-900 text-primary shadow-[0_4px_16px_rgba(42,106,85,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)] border border-primary/10 dark:border-primary/20 scale-[1.02]"
                : "text-muted-foreground hover:bg-white/40 dark:hover:bg-gray-800/40 hover:text-foreground"
                }`}
            >
              {/* Icon tetap muncul meski tidak active agar nav tidak terlihat kosong */}
              <span className={activeTab === tab.id ? "text-primary scale-110 transition-transform" : "text-muted-foreground"}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Scrollable Tab Content Container */}
      <div
        className="flex-1 lg:overflow-y-auto px-4 sm:px-8 py-6 sm:py-8 relative"
        style={{ scrollbarGutter: "stable" }}
      >
        {activeTab === 'transaksi' && <TransactionTab />}
        {activeTab === 'budget' && <BudgetTab />}
        {activeTab === 'goals' && <GoalsTab />}
        {activeTab === 'insights' && <InsightTab />}
      </div>

    </div>
  );
}