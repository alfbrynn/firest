import DashboardPanel from "@/src/components/dashboard/DashboardPanel";
import PixiCanvas from "@/src/components/game/PixiCanvas";
import { Bell, Settings, Leaf } from "lucide-react";
import { useAppStore } from "@/src/store/useAppStore";

export default function Home() {
  const { xp, level } = useAppStore();
  return (
    <main className="flex flex-col h-screen w-full overflow-hidden bg-white">
      {/* Navbar */}
      <header className="flex justify-between items-center px-8 py-4 z-10 relative bg-white">
        <div className="flex items-center gap-3">
          <div className="bg-[#a8e0cb] p-2 rounded-xl">
            <Leaf className="w-5 h-5 text-emerald-900 fill-emerald-900" />
          </div>
          <span className="text-2xl font-bold text-[#2A6A55]">Firest</span>
        </div>
        <div className="flex items-center gap-5 text-gray-600">
          <Bell className="w-5 h-5 cursor-pointer hover:text-gray-900 transition-colors" />
          <Settings className="w-5 h-5 cursor-pointer hover:text-gray-900 transition-colors" />
          <div className="w-8 h-8 rounded-full overflow-hidden cursor-pointer border border-gray-200">
            <img src="https://ui-avatars.com/api/?name=U&background=2A6A55&color=fff" alt="User" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Game / Visual Sanctuary (60%) */}
        <section className="w-[60%] h-full relative">
          <PixiCanvas />
        </section>

        {/* Right Side: Dashboard (40%) */}
        <section className="w-[40%] h-full relative">
          <DashboardPanel />
        </section>
      </div>
    </main>
  );
}