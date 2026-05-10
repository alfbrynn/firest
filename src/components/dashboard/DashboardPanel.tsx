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
    <div className="w-full h-full bg-[#f2f6f3] flex flex-col overflow-hidden">

      {/* Right Side Header/Navbar (Fixed Top) */}
      <div className="px-8 py-6 bg-[#f2f6f3]/80 backdrop-blur-md border-b border-gray-200/50 shrink-0 z-10 flex items-center justify-center">
        <nav className="flex w-full space-x-3"> {/* Jarak antar tab diperlebar ke space-x-3 */}
          {[
            { id: 'transaksi', label: 'Transaksi', icon: <BookText className="w-5 h-5" /> }, // Icon diperbesar ke w-5
            { id: 'budget', label: 'Budget', icon: <Wallet className="w-5 h-5" /> },
            { id: 'goals', label: 'Goals', icon: <Target className="w-5 h-5" /> },
            { id: 'insights', label: 'Insights', icon: <LineChart className="w-5 h-5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-3 py-3.5 text-[14px] font-bold rounded-xl transition-all ${activeTab === tab.id
                ? "bg-white text-[#24634b] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100"
                : "text-gray-400 hover:bg-white/40 hover:text-gray-600"
                }`}
            >
              {/* Icon tetap muncul meski tidak active agar nav tidak terlihat kosong */}
              <span className={activeTab === tab.id ? "text-[#24634b]" : "text-gray-400"}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Scrollable Tab Content Container */}
      <div
        className="flex-1 overflow-y-auto px-8 py-8 relative"
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