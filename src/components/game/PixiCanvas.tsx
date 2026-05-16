"use client";

import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { Viewport } from "pixi-viewport";
import { useAppStore } from "@/src/store/useAppStore";
import { Flame, Heart, Zap, Info } from "lucide-react";

// 1. DAFTAR ASET POHON & HEWAN
const treeAssetMap: Record<string, any> = {
    'tree_1': { src: '/assets/tree/tree_1.png', scale: 0.22 },
    'tree_2': { src: '/assets/tree/tree_2.png', scale: 0.38 },
    'tree_3': { src: '/assets/tree/tree_3.png', scale: 0.65 },
    'tree_4': { src: '/assets/tree/tree_4.png', scale: 0.85 },
    'tree_5': { src: '/assets/tree/tree_5.png', scale: 1.1 },
    'tree_6': { src: '/assets/tree/tree_6.png', scale: 1.4 },
    'tree_dry_1': { src: '/assets/tree-dry/tree_dry_1.png', scale: 0.3 },
    'tree_dry_2': { src: '/assets/tree-dry/tree_dry_2.png', scale: 0.5 },
    'tree_dry_3': { src: '/assets/tree-dry/tree_dry_3.png', scale: 0.8 },
    'tree_dry_4': { src: '/assets/tree-dry/tree_dry_4.png', scale: 1.2 },
};

const animalAssets = {
    bee: '/assets/animal/bee.png',
    butterfly: '/assets/animal/butterfly.png',
    bird: '/assets/animal/bird.png',
    crow: '/assets/animal/crow.png',
    rabbit: '/assets/animal/rabbit.png'
};

const getNextLevelXp = (currentXp: number) => {
    const currentLevelNum = Math.floor(currentXp / 500) + 1;
    return currentLevelNum * 500;
};

export default function PixiCanvas() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const { level, levelNumber, xp, forestHealth, currentStreak, forestGrid } = useAppStore();
    const [showHint, setShowHint] = useState(true);

    const nextXp = getNextLevelXp(xp);
    const progressPercent = xp >= 6000 ? 100 : Math.round(((xp % 500) / 500) * 100);

    useEffect(() => {
        const timer = setTimeout(() => setShowHint(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined" || !canvasRef.current || forestGrid.length === 0) return;

        const app = new PIXI.Application();
        let isDestroyed = false;

        const initPixi = async () => {
            await app.init({
                backgroundAlpha: 0,
                resizeTo: canvasRef.current!,
                antialias: true,
                resolution: window.devicePixelRatio || 1,
            });

            if (isDestroyed) {
                try { app.destroy(true, { children: true }); } catch (e) {}
                return;
            }

            if (canvasRef.current) canvasRef.current.appendChild(app.canvas);

            const viewport = new Viewport({
                screenWidth: app.screen.width,
                screenHeight: app.screen.height,
                worldWidth: app.screen.width * 2,
                worldHeight: app.screen.height * 2,
                events: app.renderer.events,
            });

            app.stage.addChild(viewport);
            viewport.drag().pinch().wheel().decelerate().clampZoom({ minScale: 0.4, maxScale: 3 });

            // 1. Tentukan Hewan yang muncul berdasarkan forestHealth global
            const isHealthyGlobal = forestHealth > 50;
            const treeLevelGlobal = Math.min(6, Math.max(1, Math.ceil(levelNumber / 2)));
            
            let activeAnimals: string[] = [];
            if (!isHealthyGlobal) {
                activeAnimals = ['crow'];
            } else if (treeLevelGlobal <= 3) {
                activeAnimals = ['bee', 'butterfly'];
            } else {
                activeAnimals = ['bee', 'butterfly', 'bird'];
            }

            // 2. Load Assets (Semua yang ada di grid + hewan)
            const uniqueTreeTypesInGrid = Array.from(new Set(forestGrid.map(t => t.item_type)));
            // Juga tambahkan versi dry jika health rendah untuk fallback
            const dryTypes = ['tree_dry_1', 'tree_dry_2', 'tree_dry_3', 'tree_dry_4'];
            
            const airAnimalSrcs = activeAnimals.map(name => (animalAssets as any)[name]);
            const rabbitSrc = animalAssets.rabbit;

            const assetPromises: Promise<any>[] = [
                PIXI.Assets.load('/assets/land.png').catch(() => null),
                PIXI.Assets.load(rabbitSrc).catch(() => null),
                ...airAnimalSrcs.map(src => PIXI.Assets.load(src).catch(() => null))
            ];

            // Map untuk menyimpan texture pohon
            const loadedTreeTextures: Record<string, PIXI.Texture> = {};
            
            // Load all unique healthy trees
            const healthyPromises = uniqueTreeTypesInGrid.map(async (type) => {
                const tex = await PIXI.Assets.load(treeAssetMap[type].src).catch(() => null);
                if (tex) loadedTreeTextures[type] = tex;
            });

            // Load all dry trees for variety
            const dryPromises = dryTypes.map(async (type) => {
                const tex = await PIXI.Assets.load(treeAssetMap[type].src).catch(() => null);
                if (tex) loadedTreeTextures[type] = tex;
            });

            const [bgTexture, rabbitTexture, ...airAnimalTextures] = await Promise.all(assetPromises);
            await Promise.all([...healthyPromises, ...dryPromises]);

            if (isDestroyed) return;

            const mainContainer = new PIXI.Container();
            viewport.addChild(mainContainer);

            const gapX = 400;
            const gapY = 200;

            const sortedGrid = [...forestGrid].sort((a, b) => (a.grid_x + a.grid_y) - (b.grid_x + b.grid_y));

            sortedGrid.forEach((tile, index) => {
                const islandGroup = new PIXI.Container();
                islandGroup.x = (tile.grid_x - tile.grid_y) * gapX;
                islandGroup.y = (tile.grid_x + tile.grid_y) * gapY;

                if (bgTexture) {
                    const island = new PIXI.Sprite(bgTexture);
                    island.anchor.set(0.5);
                    islandGroup.addChild(island);
                }

                // LOGIKA VARIASI POHON:
                // Gunakan item_type dari tile, tapi jika statusnya 'dry' atau health global sangat rendah (<30), 
                // ganti ke versi dry secara acak/proporsional.
                let finalTreeType = tile.item_type;
                if (tile.status === 'dry' || (forestHealth < 40 && Math.random() > (forestHealth/100))) {
                    const dryLevel = Math.min(4, Math.max(1, Math.ceil(parseInt(tile.item_type.split('_')[1]) / 1.5)));
                    finalTreeType = `tree_dry_${dryLevel}`;
                }

                const treeData = treeAssetMap[finalTreeType];
                const treeTex = loadedTreeTextures[finalTreeType];

                if (treeTex) {
                    const tree = new PIXI.Sprite(treeTex);
                    tree.anchor.set(0.5, 1);
                    tree.y = 20;
                    tree.scale.set(treeData.scale);
                    islandGroup.addChild(tree);

                    // Animasi Pohon Bernapas (Berhenti jika kering agar terasa "mati")
                    if (!finalTreeType.includes('dry')) {
                        let elapsed = Math.random() * 10;
                        app.ticker.add((ticker) => {
                            elapsed += ticker.deltaTime * 0.02;
                            tree.skew.x = Math.sin(elapsed * 2) * 0.02;
                            tree.scale.set(treeData.scale * (1 + Math.sin(elapsed) * 0.01));
                        });
                    } else {
                        // Pohon kering hanya bergoyang sangat pelan tertiup angin
                        let elapsed = Math.random() * 10;
                        app.ticker.add((ticker) => {
                            elapsed += ticker.deltaTime * 0.01;
                            tree.skew.x = Math.sin(elapsed) * 0.01;
                        });
                    }
                }

                // A. HEWAN DARAT (Kelinci) - Hanya muncul di sekitar pohon sehat
                if (isHealthyGlobal && !finalTreeType.includes('dry') && rabbitTexture) {
                    // Probabilitas kelinci muncul (30%)
                    if (Math.random() > 0.7) {
                        const rabbit = new PIXI.Sprite(rabbitTexture);
                        rabbit.anchor.set(0.5, 1);
                        const baseX = (Math.random() > 0.5 ? -70 : 70) + (Math.random() * 20);
                        const baseY = 80 + (Math.random() * 20);
                        rabbit.x = baseX;
                        rabbit.y = baseY;
                        rabbit.scale.set(0.12);
                        islandGroup.addChild(rabbit);

                        let t = Math.random() * 10;
                        app.ticker.add((ticker) => {
                            t += ticker.deltaTime * 0.05;
                            rabbit.x = baseX + Math.cos(t * 0.5) * 15;
                            rabbit.y = baseY - Math.abs(Math.sin(t * 2.5)) * 25;
                            const jumpFactor = Math.abs(Math.sin(t * 2.5));
                            rabbit.scale.y = 0.12 * (1 - jumpFactor * 0.1);
                            rabbit.scale.x = 0.12 * (1 + jumpFactor * 0.05);
                        });
                    }
                }

                // B. HEWAN UDARA
                if (activeAnimals.length > 0) {
                    activeAnimals.forEach((animalName, aIndex) => {
                        const tex = airAnimalTextures[activeAnimals.indexOf(animalName)];
                        if (tex) {
                            const animal = new PIXI.Sprite(tex);
                            animal.anchor.set(0.5);
                            const angle = (aIndex / activeAnimals.length) * Math.PI * 2;
                            const dist = animalName === 'bird' ? 120 + Math.random() * 60 : 70 + Math.random() * 40;
                            let baseX = Math.cos(angle) * dist;
                            let baseY = -60;

                            if (animalName === 'bird') baseY = -220 - Math.random() * 80;
                            else if (animalName === 'crow') baseY = -140 - Math.random() * 50;
                            else baseY = -40 - Math.random() * 30;

                            // Adjust altitude based on tree level
                            const levelNum = parseInt(tile.item_type.split('_')[1]) || 1;
                            const treeHeightOffset = (levelNum - 1) * 45;
                            baseY -= treeHeightOffset;
                            
                            animal.x = baseX;
                            animal.y = baseY;
                            animal.scale.set(0.09);
                            islandGroup.addChild(animal);

                            let time = Math.random() * 100;
                            app.ticker.add((ticker) => {
                                time += ticker.deltaTime * 0.05;
                                animal.x = baseX + Math.sin(time * 0.7) * 35;
                                animal.y = baseY + Math.sin(time) * 15;
                                animal.rotation = Math.sin(time * 0.7) * 0.1;
                                const wingSpeed = animalName === 'bee' ? 12 : animalName === 'butterfly' ? 6 : 8;
                                const flap = 1 + Math.sin(time * wingSpeed) * 0.15;
                                animal.scale.y = 0.09 * flap;
                            });
                        }
                    });
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