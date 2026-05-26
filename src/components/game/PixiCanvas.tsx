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
    const currentLevelNum = Math.floor(currentXp / 200) + 1;
    return currentLevelNum * 200;
};

const getTileUnlockLevel = (gridX: number, gridY: number): number => {
    if (gridX === 0 && gridY === 0) return 1;    // Tengah (Level 1)
    if (gridX === -1 && gridY === 0) return 6;   // Belakang-Kiri (Level 6)
    if (gridX === 0 && gridY === -1) return 7;   // Belakang-Kanan (Level 7)
    if (gridX === 0 && gridY === 1) return 8;    // Depan-Kiri (Level 8)
    if (gridX === 1 && gridY === 0) return 9;    // Depan-Kanan (Level 9)
    return 999;
};

export default function PixiCanvas() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const { level, levelNumber, xp, forestHealth, currentStreak, forestGrid, statusBarMessage, isStreakDead } = useAppStore();
    const [showHint, setShowHint] = useState(true);

    const nextXp = getNextLevelXp(xp);
    const progressPercent = xp >= 2200 ? 100 : Math.round(((xp % 200) / 200) * 100);

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
                PIXI.Assets.load('/assets/grass.png').catch(() => null),
                PIXI.Assets.load(rabbitSrc).catch(() => null),
                ...airAnimalSrcs.map(src => PIXI.Assets.load(src).catch(() => null))
            ];

            // Map untuk menyimpan texture pohon
            const loadedTreeTextures: Record<string, PIXI.Texture> = {};
            const healthyTypes = ['tree_1', 'tree_2', 'tree_3', 'tree_4', 'tree_5', 'tree_6'];
            const dryTypes = ['tree_dry_1', 'tree_dry_2', 'tree_dry_3', 'tree_dry_4'];

            const healthyPromises = healthyTypes.map(async (type) => {
                const tex = await PIXI.Assets.load(treeAssetMap[type].src).catch(() => null);
                if (tex) loadedTreeTextures[type] = tex;
            });

            const dryPromises = dryTypes.map(async (type) => {
                const tex = await PIXI.Assets.load(treeAssetMap[type].src).catch(() => null);
                if (tex) loadedTreeTextures[type] = tex;
            });

            const [bgTexture, grassTexture, rabbitTexture, ...airAnimalTextures] = await Promise.all(assetPromises);
            await Promise.all([...healthyPromises, ...dryPromises]);

            // Map textures to names
            const animalTextureMap: Record<string, PIXI.Texture> = {};
            airAnimalNames.forEach((name, i) => {
                if (airAnimalTextures[i]) animalTextureMap[name] = airAnimalTextures[i];
            });

            if (isDestroyed) return;

            const landLayer = new PIXI.Container();
            const grassLayer = new PIXI.Container();
            const treeLayer = new PIXI.Container();
            treeLayer.sortableChildren = true;

            const mainContainer = new PIXI.Container();
            mainContainer.addChild(landLayer);
            mainContainer.addChild(grassLayer);
            mainContainer.addChild(treeLayer);
            app.stage.addChild(mainContainer);

            // --- 1. GAMBAR TANAH UTAMA (Hanya 1 pulau di tengah) ---
            if (bgTexture) {
                const island = new PIXI.Sprite(bgTexture);
                island.anchor.set(0.5);
                island.x = 0;
                island.y = 0;
                landLayer.addChild(island);
            }

            // --- 1.5 GAMBAR RUMPUT DI ATAS TANAH (Rumput berayun) ---
            if (grassTexture) {
                const grass = new PIXI.Sprite(grassTexture);
                grass.anchor.set(0.5);
                grass.x = 0;
                grass.y = 0;
                grassLayer.addChild(grass);

                // Animasi rumput berayun ditiup angin lembut (mengikuti gaya ayunan tanaman)
                let elapsedGrass = Math.random() * 10;
                app.ticker.add((ticker) => {
                    elapsedGrass += ticker.deltaTime * 0.02;
                    grass.skew.x = Math.sin(elapsedGrass * 2) * 0.035; // Amplitudo diperbesar agar terlihat jelas
                });
            }

            // Pemetaan posisi pohon di atas pulau tunggal (0,0) agar menyebar secara rapi ke sudut-sudut pulau
            const getTreeOffset = (gridX: number, gridY: number) => {
                if (gridX === 0 && gridY === 0) return { x: 0, y: -10 };       // Tengah (Level 1)
                if (gridX === 1 && gridY === 0) return { x: 220, y: 70 };     // Depan-Kanan (Level 2)
                if (gridX === 0 && gridY === 1) return { x: -220, y: 70 };    // Depan-Kiri (Level 3)
                if (gridX === -1 && gridY === 0) return { x: -210, y: -90 };   // Belakang-Kiri (Level 4) - Digeser keluar sedikit agar lebih kelihatan peeking out
                if (gridX === 0 && gridY === -1) return { x: 210, y: -80 };    // Belakang-Kanan (Level 5) - Digeser keluar sedikit agar lebih kelihatan peeking out
                return { x: 0, y: 0 };
            };

            // Dapatkan ubin yang terbuka dan hitung ubin yang harus kering secara bertahap berdasarkan forestHealth
            const unlockedTiles = forestGrid.filter(t => levelNumber >= getTileUnlockLevel(t.grid_x, t.grid_y));
            const vulnerabilitySorted = [...unlockedTiles].sort((a, b) => {
                return getTileUnlockLevel(b.grid_x, b.grid_y) - getTileUnlockLevel(a.grid_x, a.grid_y);
            });

            let dryCount = 0;
            if (forestHealth < 100) {
                if (forestHealth >= 80) dryCount = 1;
                else if (forestHealth >= 60) dryCount = 2;
                else if (forestHealth >= 40) dryCount = 3;
                else if (forestHealth >= 20) dryCount = 4;
                else dryCount = 5;
            }
            const dryTiles = vulnerabilitySorted.slice(0, dryCount);

            const sortedGrid = [...forestGrid].sort((a, b) => {
                const offsetA = getTreeOffset(a.grid_x, a.grid_y);
                const offsetB = getTreeOffset(b.grid_x, b.grid_y);
                return offsetA.y - offsetB.y; // Urutkan dari belakang ke depan untuk rendering depth order
            });

            sortedGrid.forEach((tile) => {
                const offset = getTreeOffset(tile.grid_x, tile.grid_y);
                const posX = offset.x;
                const posY = offset.y;

                const unlockLevel = getTileUnlockLevel(tile.grid_x, tile.grid_y);
                const isLocked = levelNumber < unlockLevel;

                // --- 2. GAMBAR POHON & HEWAN (Hanya jika tile sudah terbuka) ---
                if (!isLocked) {
                    // 1. Logika Variasi Pohon
                    const isCenter = tile.grid_x === 0 && tile.grid_y === 0;
                    const tileUnlockLvl = getTileUnlockLevel(tile.grid_x, tile.grid_y);
                    const calculatedTreeLvl = isCenter 
                        ? Math.min(6, Math.max(1, levelNumber))
                        : Math.min(6, Math.max(1, levelNumber - tileUnlockLvl + 1));
                    
                    let finalTreeType = `tree_${calculatedTreeLvl}`;
                    
                    // Tentukan apakah pohon ini harus kering (isDry)
                    const isDry = isStreakDead || dryTiles.some(dt => dt.grid_x === tile.grid_x && dt.grid_y === tile.grid_y);

                    if (isDry) {
                        const dryLevel = Math.min(4, Math.max(1, Math.ceil(calculatedTreeLvl / 1.5)));
                        finalTreeType = `tree_dry_${dryLevel}`;
                    }

                    const treeData = treeAssetMap[finalTreeType];
                    const treeTex = loadedTreeTextures[finalTreeType];

                    if (treeTex) {
                        const tree = new PIXI.Sprite(treeTex);
                        tree.anchor.set(0.5, 1);
                        tree.x = posX;
                        tree.y = posY + 15; // Turunkan sedikit agar akar menancap pas di tanah
                        
                        // Skala yang sama rata untuk semua pohon agar seragam dan rapi
                        const posScaleFactor = 0.38;
                        tree.scale.set(treeData.scale * posScaleFactor);
                        
                        tree.zIndex = tree.y; // Urutan kedalaman berdasarkan posisi Y
                        treeLayer.addChild(tree);

                        if (!isDry) {
                            let elapsed = Math.random() * 10;
                            app.ticker.add((ticker) => {
                                elapsed += ticker.deltaTime * 0.02;
                                tree.skew.x = Math.sin(elapsed * 2) * 0.02;
                                tree.scale.set(treeData.scale * posScaleFactor * (1 + Math.sin(elapsed) * 0.01));
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
                        // Sesuaikan posisi agar tetap di atas pulau utama (skala offset lebih kecil agar tidak jatuh dari ubin tunggal)
                        const baseX = (Math.random() > 0.5 ? -35 : 35) + (Math.random() * 10);
                        const baseY = 25 + (Math.random() * 10);
                        rabbit.x = posX + baseX;
                        rabbit.y = posY + baseY;
                        rabbit.scale.set(0.08);
                        rabbit.zIndex = rabbit.y; // Urutan kedalaman relatif
                        treeLayer.addChild(rabbit);

                        let t = Math.random() * 10;
                        app.ticker.add((ticker) => {
                            t += ticker.deltaTime * 0.05;
                            rabbit.x = posX + baseX + Math.cos(t * 0.5) * 10;
                            rabbit.y = posY + baseY - Math.abs(Math.sin(t * 2.5)) * 15;
                            const jumpFactor = Math.abs(Math.sin(t * 2.5));
                            rabbit.scale.y = 0.08 * (1 - jumpFactor * 0.1);
                            rabbit.scale.x = 0.08 * (1 + jumpFactor * 0.05);
                        });
                    }

                    // B. HEWAN UDARA per-tile
                    tileAnimals.forEach((animalName, aIndex) => {
                        const tex = animalTextureMap[animalName];
                        if (tex) {
                            const animal = new PIXI.Sprite(tex);
                            animal.anchor.set(0.5);

                            const angle = (aIndex / tileAnimals.length) * Math.PI * 2;
                            const dist = animalName === 'bird' ? 80 + Math.random() * 40 : 45 + Math.random() * 25;
                            let baseX = Math.cos(angle) * dist;
                            let baseY = -40;

                            if (animalName === 'bird') baseY = -140 - Math.random() * 40;
                            else if (animalName === 'crow') baseY = -90 - Math.random() * 30;
                            else baseY = -25 - Math.random() * 20;

                            const levelNum = parseInt(finalTreeType.split('_').pop() || '1') || 1;
                            const treeHeightOffset = (levelNum - 1) * 25;
                            baseY -= treeHeightOffset;

                            animal.x = posX + baseX;
                            animal.y = posY + baseY;

                            // SKALA DINAMIS BERDASARKAN JENIS HEWAN
                            const baseScale = (animalName === 'bird' || animalName === 'crow') ? 0.08 : 0.04;
                            animal.scale.set(baseScale);
                            animal.zIndex = posY + 500; // Terbang di atas pohon
                            treeLayer.addChild(animal);

                            let time = Math.random() * 100;
                            app.ticker.add((ticker) => {
                                time += ticker.deltaTime * 0.05;
                                animal.x = posX + baseX + Math.sin(time * 0.7) * 20;
                                animal.y = posY + baseY + Math.sin(time) * 10;
                                animal.rotation = Math.sin(time * 0.7) * 0.1;
                                const wingSpeed = animalName === 'bee' ? 12 : animalName === 'butterfly' ? 6 : 8;
                                const flap = 1 + Math.sin(time * wingSpeed) * 0.15;
                                animal.scale.y = baseScale * flap;
                            });
                        }
                    });
                }
            });

            // Skala tetap optimal untuk 1 pulau tunggal agar terlihat premium & besar
            const globalScale = 0.65;
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
    }, [forestGrid, levelNumber, forestHealth, isStreakDead]);

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

                    <div className="w-[120px] flex flex-col justify-center relative">
                        {statusBarMessage && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs animate-bounce whitespace-nowrap z-50">
                                {statusBarMessage}
                            </div>
                        )}
                        <div className="flex justify-between text-[9px] font-bold mb-1">
                            <span className="text-muted-foreground flex items-center gap-0.5">
                                <Zap className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                                XP
                            </span>
                            <span className="text-primary">{xp}/{nextXp}</span>
                        </div>
                        <div className="h-1 w-full bg-gray-200/50 dark:bg-gray-850 rounded-full overflow-hidden shadow-inner">
                            <div
                                className="h-full bg-linear-to-r from-emerald-400 to-primary rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                        <p className="text-[7.5px] font-bold text-muted-foreground mt-1 text-center whitespace-nowrap">
                            Kamu butuh {nextXp - xp} XP lagi untuk naik level
                        </p>
                    </div>

                    <div className="w-px h-6 bg-gray-300/30 shrink-0"></div>

                    <div className="flex flex-col gap-1 shrink-0">
                        <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-foreground leading-none">
                            <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
                            Kesehatan {forestHealth}%
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