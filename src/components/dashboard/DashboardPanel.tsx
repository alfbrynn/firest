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
      
      {/* Top Navigation Tabs (Sticky/Fixed Top) */}
      <div className="px-8 pt-8 shrink-0">
        <nav className="flex w-full space-x-2 mb-8">
          {[
            { id: 'transaksi', label: 'Transaksi', icon: <BookText className="w-4 h-4" /> },
            { id: 'budget', label: 'Budget', icon: <Wallet className="w-4 h-4" /> },
            { id: 'goals', label: 'Goals', icon: <Target className="w-4 h-4" /> },
            { id: 'insights', label: 'Insights', icon: <LineChart className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold rounded-lg transition-all ${activeTab === tab.id
                ? "bg-[#c9e8d8] text-[#24634b]"
                : "text-gray-500 hover:bg-white/60"
                }`}
            >
              {activeTab === tab.id && tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-8 pb-8 relative">
        {activeTab === 'transaksi' && <TransactionTab />}
        {activeTab === 'budget' && <BudgetTab />}
        {activeTab === 'goals' && <GoalsTab />}
        {activeTab === 'insights' && <InsightTab />}
      </div>

    </div>
  );
}