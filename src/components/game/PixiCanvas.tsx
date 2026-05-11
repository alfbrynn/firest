"use client";

import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { Viewport } from "pixi-viewport";
import { useAppStore } from "@/src/store/useAppStore";
import { Flame, Heart, Zap, Info } from "lucide-react";

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
    const [showHint, setShowHint] = useState(true);

    const nextXp = getNextLevelXp(xp);
    const progressPercent = xp >= 3000 ? 100 : Math.round((xp / nextXp) * 100);

    useEffect(() => {
        // Hide hint after 5 seconds
        const timer = setTimeout(() => setShowHint(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined" || !canvasRef.current) return;

        const app = new PIXI.Application();
        const config = getLevelConfig(level);
        let isDestroyed = false;

        const initPixi = async () => {
            await app.init({
                backgroundAlpha: 0, // Transparan agar gradient CSS terlihat
                resizeTo: canvasRef.current!,
                antialias: true,
                resolution: window.devicePixelRatio || 1,
            });

            if (isDestroyed) {
                try {
                    app.destroy(true, { children: true });
                } catch (e) {}
                return;
            }

            if (canvasRef.current) {
                canvasRef.current.appendChild(app.canvas);
            }

            // Inisialisasi Pixi-Viewport untuk Pan & Zoom
            const viewport = new Viewport({
                screenWidth: app.screen.width,
                screenHeight: app.screen.height,
                worldWidth: app.screen.width * 2,
                worldHeight: app.screen.height * 2,
                events: app.renderer.events,
            });

            app.stage.addChild(viewport);

            viewport
                .drag()
                .pinch()
                .wheel()
                .decelerate()
                .clampZoom({ minScale: 0.5, maxScale: 3 });

            const uniqueTreeSrcs = [...new Set(config.trees.filter(t => t !== null).map(t => t.src))];

            const [bgTexture, ...treeTextures] = await Promise.all([
                PIXI.Assets.load('/assets/land.png').catch(() => null),
                ...uniqueTreeSrcs.map(src => PIXI.Assets.load(src).catch(() => null))
            ]);

            const textureMap: Record<string, any> = {};
            uniqueTreeSrcs.forEach((src, index) => {
                textureMap[src] = treeTextures[index];
            });

            const mainContainer = new PIXI.Container();
            viewport.addChild(mainContainer);

            const gapX = 400;
            const gapY = 200;

            for (let row = 0; row < config.gridSize; row++) {
                for (let col = 0; col < config.gridSize; col++) {
                    const islandGroup = new PIXI.Container();

                    islandGroup.x = (col - row) * gapX;
                    islandGroup.y = (col + row) * gapY;

                    if (bgTexture) {
                        const island = new PIXI.Sprite(bgTexture);
                        island.anchor.set(0.5);
                        islandGroup.addChild(island);
                    }

                    const index = row * config.gridSize + col;
                    const treeData = config.trees[index];

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
            // Center vertikal dengan pas (tidak terlalu ke bawah-kiri)
            mainContainer.x = app.screen.width / 2;
            mainContainer.y = app.screen.height / 2;
        };

        initPixi();

        return () => {
            isDestroyed = true;
            if (app.renderer) {
                try {
                    app.destroy(true, { children: true });
                } catch (e) {
                    console.warn("Pixi cleanup warning:", e);
                }
            }
        };
    }, [level]);

    return (
        <div className="w-full h-full relative bg-gradient-to-b from-background to-[#dcece3] dark:to-slate-950/20 group cursor-grab active:cursor-grabbing overflow-hidden">
            <div ref={canvasRef} className="absolute inset-0 z-0" />

            {/* Hint Tooltip */}
            <div className={`absolute top-6 left-1/2 -translate-x-1/2 z-10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50 dark:border-gray-800/50 flex items-center gap-2 transition-opacity duration-1000 pointer-events-none ${showHint ? 'opacity-100' : 'opacity-0'}`}>
                <Info className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-primary">Scroll untuk zoom, drag untuk pan area taman</span>
            </div>

            {/* Status Card Overlay - Pindah ke bawah */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-fit transition-transform hover:scale-105 duration-300">
                <div className="bg-white/70 dark:bg-gray-900/75 backdrop-blur-md px-6 py-3.5 rounded-[20px] shadow-lg border border-white/50 dark:border-white/5 flex items-center gap-6 pointer-events-auto">

                    <div className="flex items-center gap-3 shrink-0">
                        <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#e8f4ec] to-[#d1ebd9] dark:from-emerald-950/40 dark:to-emerald-900/40 flex items-center justify-center text-xl shadow-sm border border-white dark:border-gray-800">
                            🌱
                        </div>
                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-0.5">Status</p>
                            <p className="text-[14px] font-black text-primary leading-none">{level}</p>
                        </div>
                    </div>

                    <div className="w-[1px] h-8 bg-gray-300/40 shrink-0"></div>

                    <div className="w-[160px] flex flex-col justify-center">
                        <div className="flex justify-between text-[10px] font-bold mb-1.5">
                            <span className="text-muted-foreground flex items-center gap-1">
                                <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                Growth XP
                            </span>
                            <span className="text-primary">{xp} / {nextXp}</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200/60 dark:bg-gray-850 rounded-full overflow-hidden shadow-inner">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-400 to-primary rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="w-[1px] h-8 bg-gray-300/40 shrink-0"></div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-foreground">
                            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                            Health {forestHealth}%
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-foreground">
                            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                            7 Hari Streak
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}