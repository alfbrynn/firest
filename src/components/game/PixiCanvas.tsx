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

// 2. MAP ITEM TYPE KE ASSET POHON
const treeAssetMap: Record<string, any> = {
    'tree_1': t1,
    'tree_2': t2,
    'tree_3': t3,
    'tree_4': t4,
    'tree_5': t5,
    'tree_6': t6,
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
    const { level, xp, forestHealth, currentStreak, forestGrid } = useAppStore();
    const [showHint, setShowHint] = useState(true);

    const nextXp = getNextLevelXp(xp);
    const progressPercent = xp >= 3000 ? 100 : Math.round((xp / nextXp) * 100);

    useEffect(() => {
        // Hide hint after 5 seconds
        const timer = setTimeout(() => setShowHint(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined" || !canvasRef.current || forestGrid.length === 0) return;

        const app = new PIXI.Application();
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
                .clampZoom({ minScale: 0.5, maxScale: 3 })
                .clamp({
                    left: -app.screen.width * 0.3,
                    right: app.screen.width * 1.3,
                    top: -app.screen.height * 0.3,
                    bottom: app.screen.height * 1.3,
                    underflow: 'center'
                });

            // Cari semua asset unik yang perlu di-load dari grid aktif
            const uniqueTreeSrcs = [
                ...new Set(
                    forestGrid
                        .map(tile => treeAssetMap[tile.item_type])
                        .filter(Boolean)
                        .map(t => t.src)
                )
            ];

            const [bgTexture, ...treeTextures] = await Promise.all([
                PIXI.Assets.load('/assets/land.png').catch(() => null),
                ...uniqueTreeSrcs.map(src => PIXI.Assets.load(src).catch(() => null))
            ]);

            if (isDestroyed) return;

            const textureMap: Record<string, any> = {};
            uniqueTreeSrcs.forEach((src, index) => {
                textureMap[src] = treeTextures[index];
            });

            const mainContainer = new PIXI.Container();
            viewport.addChild(mainContainer);

            const gapX = 400;
            const gapY = 200;

            // Render dinamis setiap pulau dari Supabase (Sort berdasarkan kedalaman isometrik)
            const sortedGrid = [...forestGrid].sort((a, b) => {
                const depthA = a.grid_x + a.grid_y;
                const depthB = b.grid_x + b.grid_y;
                if (depthA === depthB) {
                    return a.grid_x - b.grid_x;
                }
                return depthA - depthB;
            });

            sortedGrid.forEach((tile) => {
                const islandGroup = new PIXI.Container();

                islandGroup.x = (tile.grid_x - tile.grid_y) * gapX;
                islandGroup.y = (tile.grid_x + tile.grid_y) * gapY;

                if (bgTexture) {
                    const island = new PIXI.Sprite(bgTexture);
                    island.anchor.set(0.5);
                    islandGroup.addChild(island);
                }

                const treeData = treeAssetMap[tile.item_type];

                if (treeData && textureMap[treeData.src]) {
                    const tree = new PIXI.Sprite(textureMap[treeData.src]);
                    tree.anchor.set(0.5, 1);
                    tree.y = 20;
                    tree.scale.set(treeData.scale);
                    islandGroup.addChild(tree);

                    let elapsed = Math.random() * 10;
                    if (app.ticker) {
                        app.ticker.add((ticker) => {
                            elapsed += ticker.deltaTime;
                            tree.skew.x = Math.sin(elapsed * 0.04) * 0.02;
                            const breath = 1 + Math.sin(elapsed * 0.02) * 0.01;
                            tree.scale.set(treeData.scale * breath);
                        });
                    }
                }

                mainContainer.addChild(islandGroup);
            });

            // Skala dinamis bergantung jumlah grid
            const coordList = forestGrid.map(f => Math.max(Math.abs(f.grid_x), Math.abs(f.grid_y)));
            const maxCoordVal = coordList.length > 0 ? Math.max(...coordList) : 0;
            const maxCoords = maxCoordVal + 1;
            const globalScale = maxCoords >= 3 ? 0.12 : maxCoords >= 2 ? 0.16 : 0.25;

            mainContainer.scale.set(globalScale);
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
    }, [forestGrid]);

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
                            {currentStreak} Hari Streak
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}