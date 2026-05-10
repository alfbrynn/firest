"use client";

import { TreePine, Star, Flower2 } from "lucide-react";

export default function PixiCanvas() {
    return (
        <div className="w-full h-full bg-[#f8faf9] relative p-6">
            {/* Top Left Status Cards */}
            <div className="absolute top-6 left-6 flex flex-col gap-3 z-10">
                <div className="bg-white rounded-[20px] p-3 flex items-center gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] w-48">
                    <div className="bg-[#f2d8b8] w-12 h-12 rounded-full flex items-center justify-center text-[#8c5a2b]">
                        <TreePine className="w-6 h-6 fill-[#8c5a2b]" />
                    </div>
                    <div>
                        <p className="text-[11px] text-gray-500 font-medium">Level</p>
                        <p className="font-semibold text-gray-800 text-lg leading-tight">Sapling</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl px-4 py-2.5 flex items-center gap-2 shadow-[0_2px_10px_rgba(0,0,0,0.02)] w-40">
                    <Star className="w-4 h-4 text-[#2A6A55] fill-[#2A6A55]" />
                    <span className="text-sm font-semibold text-gray-800">XP: 1,240</span>
                </div>
            </div>

            {/* Center Placeholder Card */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="bg-white rounded-[32px] w-[340px] h-[340px] flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                    <div className="bg-[#eaf1ec] p-5 rounded-2xl mb-6">
                        <Flower2 className="w-10 h-10 text-[#8aa99c]" />
                    </div>
                    <h2 className="text-[22px] font-semibold text-[#303c34]">PixiJS Isometric Garden</h2>
                    <p className="text-[15px] text-gray-500 mt-2">Canvas Placeholder</p>
                </div>
            </div>
        </div>
    );
}