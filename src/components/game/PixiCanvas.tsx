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
        let resizeObserver: ResizeObserver | null = null;

        const initPixi = async () => {
            await app.init({
                backgroundAlpha: 0,
                resizeTo: canvasRef.current!,
                antialias: true,
                resolution: window.devicePixelRatio || 1,
            });

            if (isDestroyed) {
                try { app.destroy(true, { children: true }); } catch (e) { }
                return;
            }

            if (canvasRef.current) {
                app.canvas.style.display = "block";
                app.canvas.style.position = "absolute";
                app.canvas.style.top = "0";
                app.canvas.style.left = "0";
                app.canvas.style.width = "100%";
                app.canvas.style.height = "100%";
                canvasRef.current.appendChild(app.canvas);
            }

            // We mount mainContainer directly to app.stage to ensure perfect native 1:1 pixel rendering,
            // bypassing pixi-viewport entirely to guarantee the tile land stays perfectly centered in the panel.

            // 1. Tentukan Hewan yang muncul (Load semua untuk digunakan per-tile)
            const airAnimalNames = ['bee', 'butterfly', 'bird', 'crow'];
            const airAnimalSrcs = airAnimalNames.map(name => (animalAssets as any)[name]);
            const rabbitSrc = animalAssets.rabbit;

            const assetPromises: Promise<any>[] = [
                PIXI.Assets.load('/assets/land.png').catch(() => null),
                PIXI.Assets.load(rabbitSrc).catch(() => null),
                ...airAnimalSrcs.map(src => PIXI.Assets.load(src).catch(() => null))
            ];

            // Map untuk menyimpan texture pohon
            const loadedTreeTextures: Record<string, PIXI.Texture> = {};
            const uniqueTreeTypesInGrid = Array.from(new Set(forestGrid.map(t => t.item_type)));
            const dryTypes = ['tree_dry_1', 'tree_dry_2', 'tree_dry_3', 'tree_dry_4'];

            const healthyPromises = uniqueTreeTypesInGrid.map(async (type) => {
                const tex = await PIXI.Assets.load(treeAssetMap[type].src).catch(() => null);
                if (tex) loadedTreeTextures[type] = tex;
            });

            const dryPromises = dryTypes.map(async (type) => {
                const tex = await PIXI.Assets.load(treeAssetMap[type].src).catch(() => null);
                if (tex) loadedTreeTextures[type] = tex;
            });

            const [bgTexture, rabbitTexture, ...airAnimalTextures] = await Promise.all(assetPromises);
            await Promise.all([...healthyPromises, ...dryPromises]);

            // Map textures to names
            const animalTextureMap: Record<string, PIXI.Texture> = {};
            airAnimalNames.forEach((name, i) => {
                if (airAnimalTextures[i]) animalTextureMap[name] = airAnimalTextures[i];
            });

            if (isDestroyed) return;

            const mainContainer = new PIXI.Container();
            app.stage.addChild(mainContainer);

            const gapX = 400;
            const gapY = 200;

            const sortedGrid = [...forestGrid].sort((a, b) => (a.grid_x + a.grid_y) - (b.grid_x + b.grid_y));

            sortedGrid.forEach((tile) => {
                const islandGroup = new PIXI.Container();
                islandGroup.x = (tile.grid_x - tile.grid_y) * gapX;
                islandGroup.y = (tile.grid_x + tile.grid_y) * gapY;

                if (bgTexture) {
                    const island = new PIXI.Sprite(bgTexture);
                    island.anchor.set(0.5);
                    islandGroup.addChild(island);
                }

                // 1. Logika Variasi Pohon
                let finalTreeType = tile.item_type;
                const isDry = tile.status === 'dry' || (forestHealth < 40 && Math.random() > (forestHealth / 100));

                if (isDry) {
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

                    if (!isDry) {
                        let elapsed = Math.random() * 10;
                        app.ticker.add((ticker) => {
                            elapsed += ticker.deltaTime * 0.02;
                            tree.skew.x = Math.sin(elapsed * 2) * 0.02;
                            tree.scale.set(treeData.scale * (1 + Math.sin(elapsed) * 0.01));
                        });
                    } else {
                        let elapsed = Math.random() * 10;
                        app.ticker.add((ticker) => {
                            elapsed += ticker.deltaTime * 0.01;
                            tree.skew.x = Math.sin(elapsed) * 0.01;
                        });
                    }
                }

                // 2. Tentukan Hewan per-tile berdasarkan status pohon
                let tileAnimals: string[] = [];
                if (isDry) {
                    tileAnimals = ['crow'];
                } else if (finalTreeType === 'tree_6') {
                    tileAnimals = ['bee', 'butterfly', 'bird'];
                } else {
                    tileAnimals = ['bee', 'butterfly'];
                }

                // A. HEWAN DARAT (Kelinci) - Muncul di pohon sehat (kecuali bibit)
                if (!isDry && finalTreeType !== 'tree_1' && rabbitTexture && Math.random() > 0.3) {
                    const rabbit = new PIXI.Sprite(rabbitTexture);
                    rabbit.anchor.set(0.5, 1);
                    // Sesuaikan posisi agar tetap di atas pulau land.png
                    const baseX = (Math.random() > 0.5 ? -80 : 80) + (Math.random() * 30);
                    const baseY = 60 + (Math.random() * 15);
                    rabbit.x = baseX;
                    rabbit.y = baseY;
                    rabbit.scale.set(0.10);
                    islandGroup.addChild(rabbit);

                    let t = Math.random() * 10;
                    app.ticker.add((ticker) => {
                        t += ticker.deltaTime * 0.05;
                        rabbit.x = baseX + Math.cos(t * 0.5) * 15;
                        rabbit.y = baseY - Math.abs(Math.sin(t * 2.5)) * 25;
                        const jumpFactor = Math.abs(Math.sin(t * 2.5));
                        rabbit.scale.y = 0.10 * (1 - jumpFactor * 0.1);
                        rabbit.scale.x = 0.10 * (1 + jumpFactor * 0.05);
                    });
                }

                // B. HEWAN UDARA per-tile
                tileAnimals.forEach((animalName, aIndex) => {
                    const tex = animalTextureMap[animalName];
                    if (tex) {
                        const animal = new PIXI.Sprite(tex);
                        animal.anchor.set(0.5);

                        const angle = (aIndex / tileAnimals.length) * Math.PI * 2;
                        const dist = animalName === 'bird' ? 120 + Math.random() * 60 : 70 + Math.random() * 40;
                        let baseX = Math.cos(angle) * dist;
                        let baseY = -60;

                        if (animalName === 'bird') baseY = -220 - Math.random() * 80;
                        else if (animalName === 'crow') baseY = -140 - Math.random() * 50;
                        else baseY = -40 - Math.random() * 30;

                        const levelNum = parseInt(finalTreeType.split('_').pop() || '1') || 1;
                        const treeHeightOffset = (levelNum - 1) * 45;
                        baseY -= treeHeightOffset;

                        animal.x = baseX;
                        animal.y = baseY;

                        // SKALA DINAMIS BERDASARKAN JENIS HEWAN
                        const baseScale = (animalName === 'bird' || animalName === 'crow') ? 0.10 : 0.05;
                        animal.scale.set(baseScale);
                        islandGroup.addChild(animal);

                        let time = Math.random() * 100;
                        app.ticker.add((ticker) => {
                            time += ticker.deltaTime * 0.05;
                            animal.x = baseX + Math.sin(time * 0.7) * 35;
                            animal.y = baseY + Math.sin(time) * 15;
                            animal.rotation = Math.sin(time * 0.7) * 0.1;
                            const wingSpeed = animalName === 'bee' ? 12 : animalName === 'butterfly' ? 6 : 8;
                            const flap = 1 + Math.sin(time * wingSpeed) * 0.15;
                            animal.scale.y = baseScale * flap;
                        });
                    }
                });

                mainContainer.addChild(islandGroup);
            });


            // Skala dinamis bergantung jumlah grid (Diperbesar/Zoom In agar terlihat lebih detail & premium)
            const coordList = forestGrid.map(f => Math.max(Math.abs(f.grid_x), Math.abs(f.grid_y)));
            const maxCoordVal = coordList.length > 0 ? Math.max(...coordList) : 0;
            const maxCoords = maxCoordVal + 1;
            const globalScale = maxCoords >= 3 ? 0.18 : maxCoords >= 2 ? 0.28 : 0.45;

            mainContainer.scale.set(globalScale);

            // Centering function that remains responsive to window resizing
            const centerMainContainer = () => {
                mainContainer.x = app.screen.width / 2;
                // Positioned slightly downward (+15) to sit perfectly above the bottom status card
                mainContainer.y = (app.screen.height / 2) + 15;
            };

            // Setup ResizeObserver to track NextJS DOM mount, Tailwind flex grid paints, and panel resizes
            resizeObserver = new ResizeObserver(() => {
                if (!isDestroyed && app.renderer) {
                    app.resize();
                    centerMainContainer();
                }
            });
            if (canvasRef.current) {
                resizeObserver.observe(canvasRef.current);
            }

            centerMainContainer();
            app.renderer.on('resize', centerMainContainer);
        };

        initPixi();

        return () => {
            isDestroyed = true;
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
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
        <div className="w-full h-full relative bg-linear-to-b from-background to-[#dcece3] dark:to-slate-950/20 overflow-hidden">
            <div ref={canvasRef} className="absolute inset-0 z-0" />

            {/* Status Card Overlay - Pindah ke bawah */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-fit transition-transform hover:scale-[1.02] duration-300">
                <div className="bg-white/75 dark:bg-gray-900/80 backdrop-blur-md px-4 py-2 rounded-xl shadow-md border border-white/40 dark:border-white/5 flex items-center gap-4 pointer-events-auto">

                    <div className="flex items-center gap-2 shrink-0">
                        <div className="w-7.5 h-7.5 rounded-lg bg-linear-to-br from-[#e8f4ec] to-[#d1ebd9] dark:from-emerald-950/40 dark:to-emerald-900/40 flex items-center justify-center text-sm shadow-xs border border-white dark:border-gray-800">
                            🌱
                        </div>
                        <div>
                            <p className="text-[8px] uppercase tracking-widest text-muted-foreground font-bold mb-0.5">Status</p>
                            <p className="text-xs font-black text-primary leading-none">{level}</p>
                        </div>
                    </div>

                    <div className="w-px h-6 bg-gray-300/30 shrink-0"></div>

                    <div className="w-[120px] flex flex-col justify-center">
                        <div className="flex justify-between text-[9px] font-bold mb-1">
                            <span className="text-muted-foreground flex items-center gap-0.5">
                                <Zap className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                                Growth XP
                            </span>
                            <span className="text-primary">{xp}/{nextXp}</span>
                        </div>
                        <div className="h-1 w-full bg-gray-200/50 dark:bg-gray-850 rounded-full overflow-hidden shadow-inner">
                            <div
                                className="h-full bg-linear-to-r from-emerald-400 to-primary rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="w-px h-6 bg-gray-300/30 shrink-0"></div>

                    <div className="flex flex-col gap-1 shrink-0">
                        <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-foreground leading-none">
                            <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
                            Health {forestHealth}%
                        </div>
                        <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-foreground leading-none">
                            <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                            {currentStreak} Hari Streak
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}