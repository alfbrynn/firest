"use client";

import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { useAppStore } from "@/src/store/useAppStore";

// 1. UPDATE SKALA POHON (Lebih Besar!)
const getLevelConfig = (level: string) => {
    switch (level.toLowerCase()) {
        case 'seedling':
            return { src: '/assets/tree_1.png', treeScale: 0.2, islands: 1, globalScale: 0.25 };
        case 'sprout':
            return { src: '/assets/tree_2.png', treeScale: 0.35, islands: 1, globalScale: 0.25 };
        case 'sapling':
            return { src: '/assets/tree_3.png', treeScale: 0.6, islands: 1, globalScale: 0.25 };
        case 'forest':
            return { src: '/assets/tree_4.png', treeScale: 0.8, islands: 2, globalScale: 0.18 };
        case 'rainforest':
            return { src: '/assets/tree_5.png', treeScale: 1.0, islands: 2, globalScale: 0.15 };
        case 'ecosystem':
            return { src: '/assets/tree_6.png', treeScale: 1.3, islands: 3, globalScale: 0.12 };
        default:
            return { src: '/assets/tree_1.png', treeScale: 0.2, islands: 1, globalScale: 0.25 };
    }
};

export default function PixiCanvas() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const { level } = useAppStore();

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

            // Update nama file menjadi land.png
            const [bgTexture, treeTexture] = await Promise.all([
                PIXI.Assets.load('/assets/land.png').catch(() => null),
                PIXI.Assets.load(config.src).catch(() => null)
            ]);

            const mainContainer = new PIXI.Container();
            app.stage.addChild(mainContainer);

            const gapX = 350;
            const gapY = 175;

            for (let row = 0; row < config.islands; row++) {
                for (let col = 0; col < config.islands; col++) {
                    const islandGroup = new PIXI.Container();
                    islandGroup.x = (col - row) * gapX;
                    islandGroup.y = (col + row) * gapY;

                    if (bgTexture) {
                        const island = new PIXI.Sprite(bgTexture);
                        island.anchor.set(0.5);
                        islandGroup.addChild(island);
                    }

                    if (treeTexture) {
                        const tree = new PIXI.Sprite(treeTexture);
                        tree.anchor.set(0.5, 1);

                        // Atur posisi Y pohon agar menempel di tanah (bisa disesuaikan jika kurang pas)
                        tree.y = 20;
                        tree.scale.set(config.treeScale);
                        islandGroup.addChild(tree);

                        let elapsed = Math.random() * 10;
                        app.ticker.add((ticker) => {
                            elapsed += ticker.deltaTime;
                            tree.skew.x = Math.sin(elapsed * 0.04) * 0.02;
                            const breath = 1 + Math.sin(elapsed * 0.02) * 0.01;
                            tree.scale.set(config.treeScale * breath);
                        });
                    }

                    mainContainer.addChild(islandGroup);
                }
            }

            mainContainer.scale.set(config.globalScale);

            // 2. TURUNKAN POSISI TAMAN KE TENGAH BAWAH
            mainContainer.x = app.screen.width / 2;
            // Menambah +120 pixel agar posisi tanah lebih ke bawah, menyisakan ruang langit yang luas
            mainContainer.y = (app.screen.height / 2) + 120;
        };

        initPixi();

        return () => {
            app.destroy(true, { children: true });
        };
    }, [level]);

    return (
        <div className="w-full h-full relative bg-[#F7F9F7]">
            <div ref={canvasRef} className="absolute inset-0 z-0" />

            <div className="absolute top-12 left-12 z-10">
                <div className="bg-white/90 backdrop-blur-md px-5 py-3.5 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-[14px] bg-[#e8f4ec] flex items-center justify-center text-xl font-bold text-[#2A6A55]">
                        🌱
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Status Taman</p>
                        <p className="text-[16px] font-black text-[#2A6A55] leading-none">{level}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}