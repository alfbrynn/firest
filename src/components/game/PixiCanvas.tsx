"use client";

import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { useAppStore } from "@/src/store/useAppStore";
import { Flame, Heart, Zap } from "lucide-react";

// 1. DAFTAR ASET POHON UNTUK DIGUNAKAN ULANG
const t1 = { src: '/assets/tree_1.png', scale: 0.2 };  // Seedling
const t2 = { src: '/assets/tree_2.png', scale: 0.35 }; // Sprout
const t3 = { src: '/assets/tree_3.png', scale: 0.6 };  // Sapling
const t4 = { src: '/assets/tree_4.png', scale: 0.8 };  // Forest
const t5 = { src: '/assets/tree_5.png', scale: 1.0 };  // Rainforest
const t6 = { src: '/assets/tree_6.png', scale: 1.3 };  // Ecosystem

// 2. LOGIKA PERTUMBUHAN BERTAHAP
const getLevelConfig = (level: string) => {
    switch (level.toLowerCase()) {
        case 'seedling':
            return { gridSize: 1, globalScale: 0.25, trees: [t1] };
        case 'sprout':
            return { gridSize: 1, globalScale: 0.25, trees: [t2] };
        case 'sapling':
            return { gridSize: 1, globalScale: 0.25, trees: [t3] };
        case 'forest':
            // Grid 2x2 (4 pulau): 1 Besar, 1 Bibit Baru, 2 Kosong
            return { gridSize: 2, globalScale: 0.18, trees: [t4, t1, null, null] };
        case 'rainforest':
            // Grid 2x2 (4 pulau): 1 Sangat Besar, 1 Sedang, 1 Bibit, 1 Kosong
            return { gridSize: 2, globalScale: 0.15, trees: [t5, t3, t1, null] };
        case 'ecosystem':
            // Grid 3x3 (9 pulau): Pertumbuhan berjenjang dari paling besar ke kecil
            return { gridSize: 3, globalScale: 0.12, trees: [t6, t5, t4, t3, t2, t1, null, null, null] };
        default:
            return { gridSize: 1, globalScale: 0.25, trees: [t3] };
    }
};

const getNextLevelXp = (currentXp: number) => {
    if (currentXp < 500) return 500;
    if (currentXp < 1000) return 1000;
    if (currentXp < 1500) return 1500;
    if (currentXp < 2000) return 2000;
    if (currentXp < 3000) return 3000;
    return currentXp;
};

export default function PixiCanvas() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const { level, xp, forestHealth } = useAppStore();

    const nextXp = getNextLevelXp(xp);
    const progressPercent = xp >= 3000 ? 100 : Math.round((xp / nextXp) * 100);

    useEffect(() => {
        if (typeof window === "undefined" || !canvasRef.current) return;

        const app = new PIXI.Application();
        const config = getLevelConfig(level);

        const initPixi = async () => {
            await app.init({
                background: '#F7F9F7',
                resizeTo: canvasRef.current!,
                antialias: true,
                resolution: window.devicePixelRatio || 1,
            });

            if (canvasRef.current) {
                canvasRef.current.appendChild(app.canvas);
            }

            // 3. LOAD ASET SECARA CERDAS (Hanya load gambar yang dibutuhkan di level ini)
            const uniqueTreeSrcs = [...new Set(config.trees.filter(t => t !== null).map(t => t.src))];

            const [bgTexture, ...treeTextures] = await Promise.all([
                PIXI.Assets.load('/assets/land.png').catch(() => null),
                ...uniqueTreeSrcs.map(src => PIXI.Assets.load(src).catch(() => null))
            ]);

            // Simpan texture pohon dalam dictionary agar mudah dipanggil
            const textureMap: Record<string, any> = {};
            uniqueTreeSrcs.forEach((src, index) => {
                textureMap[src] = treeTextures[index];
            });

            const mainContainer = new PIXI.Container();
            app.stage.addChild(mainContainer);

            // Jarak Antarpulau (Jika gambar Anda sudah di-resize ke ~800px, angka ini seharusnya pas)
            const gapX = 400;
            const gapY = 200;

            for (let row = 0; row < config.gridSize; row++) {
                for (let col = 0; col < config.gridSize; col++) {
                    const islandGroup = new PIXI.Container();

                    // Rumus posisi isometrik
                    islandGroup.x = (col - row) * gapX;
                    islandGroup.y = (col + row) * gapY;

                    // Gambar Tanah
                    if (bgTexture) {
                        const island = new PIXI.Sprite(bgTexture);
                        island.anchor.set(0.5);
                        islandGroup.addChild(island);
                    }

                    // Tentukan pohon mana yang tumbuh di pulau ini berdasarkan urutan
                    const index = row * config.gridSize + col;
                    const treeData = config.trees[index];

                    // Gambar Pohon (Hanya jika ada datanya / tidak null)
                    if (treeData && textureMap[treeData.src]) {
                        const tree = new PIXI.Sprite(textureMap[treeData.src]);
                        tree.anchor.set(0.5, 1);
                        tree.y = 20;
                        tree.scale.set(treeData.scale);
                        islandGroup.addChild(tree);

                        let elapsed = Math.random() * 10;
                        app.ticker.add((ticker) => {
                            elapsed += ticker.deltaTime;
                            tree.skew.x = Math.sin(elapsed * 0.04) * 0.02;
                            const breath = 1 + Math.sin(elapsed * 0.02) * 0.01;
                            tree.scale.set(treeData.scale * breath);
                        });
                    }

                    mainContainer.addChild(islandGroup);
                }
            }

            mainContainer.scale.set(config.globalScale);
            mainContainer.x = app.screen.width / 2;
            mainContainer.y = (app.screen.height / 2) + 40;
        };

        initPixi();

        return () => {
            app.destroy(true, { children: true });
        };
    }, [level]);

    return (
        <div className="w-full h-full relative bg-[#F7F9F7]">
            <div ref={canvasRef} className="absolute inset-0 z-0" />

            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 w-fit">
                <div className="bg-white/85 backdrop-blur-xl px-6 py-3.5 rounded-[20px] shadow-sm border border-gray-100 flex items-center gap-6">

                    <div className="flex items-center gap-3 shrink-0">
                        <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#e8f4ec] to-[#d1ebd9] flex items-center justify-center text-xl shadow-sm border border-white">
                            🌱
                        </div>
                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">Status</p>
                            <p className="text-[14px] font-black text-[#2A6A55] leading-none">{level}</p>
                        </div>
                    </div>

                    <div className="w-[1px] h-8 bg-gray-200/60 shrink-0"></div>

                    <div className="w-[160px] flex flex-col justify-center">
                        <div className="flex justify-between text-[10px] font-bold mb-1.5">
                            <span className="text-gray-500 flex items-center gap-1">
                                <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                Growth XP
                            </span>
                            <span className="text-[#2A6A55]">{xp} / {nextXp}</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-400 to-[#2A6A55] rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="w-[1px] h-8 bg-gray-200/60 shrink-0"></div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600">
                            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                            Health {forestHealth}%
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600">
                            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                            7 Hari Streak
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}