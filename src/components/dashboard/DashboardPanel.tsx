"use client";

import { useState } from "react";
import { BookText, Wallet, Target, LineChart } from "lucide-react";
import TransactionTab from "./TransactionTab";
import BudgetTab from "./BudgetTab";
import GoalsTab from "./GoalsTab";
import InsightTab from "./InsightTab";
import { useAppStore } from "@/src/store/useAppStore";

export default function DashboardPanel() {
  const [activeTab, setActiveTab] = useState("transaksi");

  return (
    <div className="w-full h-auto lg:h-full bg-slate-50 dark:bg-gray-950 flex flex-col lg:overflow-hidden">

      {/* Right Side Header/Navbar (Fixed Top) */}
      <div className="px-4 sm:px-8 py-4 sm:py-6 bg-slate-50/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 shrink-0 sticky top-0 z-20 flex items-center justify-center">
        <nav className="flex w-full space-x-1 sm:space-x-3 overflow-x-auto hide-scrollbar pb-1 sm:pb-0">
          {[
            { id: 'transaksi', label: 'Transaksi', icon: <BookText className="w-4 h-4 sm:w-5 sm:h-5" /> },
            { id: 'budget', label: 'Budget', icon: <Wallet className="w-4 h-4 sm:w-5 sm:h-5" /> },
            { id: 'goals', label: 'Goals', icon: <Target className="w-4 h-4 sm:w-5 sm:h-5" /> },
            { id: 'insights', label: 'Insights', icon: <LineChart className="w-4 h-4 sm:w-5 sm:h-5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[90px] sm:min-w-0 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 py-2.5 sm:py-3.5 text-[11px] sm:text-[14px] font-bold rounded-xl transition-all ${activeTab === tab.id
                ? "bg-white dark:bg-gray-900 text-primary shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-800"
                : "text-muted-foreground hover:bg-white/40 dark:hover:bg-gray-800/40 hover:text-foreground"
                }`}
            >
              {/* Icon tetap muncul meski tidak active agar nav tidak terlihat kosong */}
              <span className={activeTab === tab.id ? "text-primary" : "text-muted-foreground"}>
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