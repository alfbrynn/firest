"use client";

import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { useAppStore } from "@/src/store/useAppStore";

// Pusat pohon utama
const getMainTree = (level: string) => {
    switch (level.toLowerCase()) {
        case 'seedling': return '🌱';
        case 'sprout': return '🌿';
        case 'sapling': return '🌲';
        case 'forest': return '🌳';
        case 'rainforest': return '🌴';
        case 'ecosystem': return '🏞️';
        default: return '🌲';
    }
};

// Fungsi memunculkan elemen dekorasi berdasarkan level
const getDecoration = (level: string, row: number, col: number) => {
    const lvl = level.toLowerCase();
    // Tidak ada dekorasi jika masih bibit/tunas/sapling
    if (lvl === 'seedling' || lvl === 'sprout' || lvl === 'sapling') return null;

    // Level Forest: Tambah bunga di sudut
    if (lvl === 'forest') {
        if (row === 1 && col === 1) return '🌸';
        if (row === 3 && col === 3) return '🌼';
    }

    // Level Rainforest: Bunga dan semak belukar
    if (lvl === 'rainforest') {
        if ((row === 1 && col === 1) || (row === 3 && col === 1)) return '🌺';
        if ((row === 1 && col === 3) || (row === 3 && col === 3)) return '🌿';
        if (row === 0 && col === 4) return '🍄';
    }

    // Level Ecosystem: Penuh kehidupan (Batu, bunga, jamur, burung)
    if (lvl === 'ecosystem') {
        if (row === 0 && col === 1) return '🍄';
        if (row === 1 && col === 1) return '🌺';
        if (row === 1 && col === 3) return '🦆';
        if (row === 2 && col === 4) return '🪨';
        if (row === 3 && col === 1) return '🪴';
        if (row === 3 && col === 3) return '🌻';
        if (row === 4 && col === 2) return '🦋';
    }

    return null;
};

export default function PixiCanvas() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const { level } = useAppStore();

    useEffect(() => {
        if (typeof window === "undefined" || !canvasRef.current) return;

        const app = new PIXI.Application();

        const initPixi = async () => {
            await app.init({
                width: canvasRef.current?.clientWidth || 800,
                height: canvasRef.current?.clientHeight || 600,
                backgroundColor: 0xF7F9F7,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true,
                resizeTo: canvasRef.current!,
            });

            if (canvasRef.current) {
                canvasRef.current.appendChild(app.canvas);
            }

            const gridContainer = new PIXI.Container();
            app.stage.addChild(gridContainer);

            const gridSize = 5;
            const tileWidth = 100;
            const tileHeight = 50;

            for (let row = 0; row < gridSize; row++) {
                for (let col = 0; col < gridSize; col++) {

                    const xIso = (col - row) * (tileWidth / 2);
                    const yIso = (col + row) * (tileHeight / 2);

                    const tile = new PIXI.Graphics();
                    tile.moveTo(0, -tileHeight / 2);
                    tile.lineTo(tileWidth / 2, 0);
                    tile.lineTo(0, tileHeight / 2);
                    tile.lineTo(-tileWidth / 2, 0);

                    const isEven = (row + col) % 2 === 0;
                    tile.fill(isEven ? 0xE8F0E4 : 0xDFEAD9);
                    tile.stroke({ width: 1, color: 0xB6DFC2 });

                    tile.x = xIso;
                    tile.y = yIso;
                    gridContainer.addChild(tile);

                    // 1. Render Pohon Utama di Tengah (Row 2, Col 2)
                    if (row === 2 && col === 2) {
                        const treeVisual = getMainTree(level);
                        const mainTree = new PIXI.Text({
                            text: treeVisual,
                            style: { fontSize: level === 'ecosystem' ? 80 : 70 } // Ekosistem ukurannya lebih besar
                        });
                        mainTree.anchor.set(0.5, 1);
                        mainTree.x = xIso;
                        mainTree.y = yIso + (tileHeight / 4);
                        gridContainer.addChild(mainTree);
                    }
                    // 2. Render Dekorasi di petak lain
                    else {
                        const decorVisual = getDecoration(level, row, col);
                        if (decorVisual) {
                            const decor = new PIXI.Text({
                                text: decorVisual,
                                style: { fontSize: 35 }
                            });
                            decor.anchor.set(0.5, 1);
                            decor.x = xIso;
                            decor.y = yIso + (tileHeight / 4);
                            gridContainer.addChild(decor);
                        }
                    }
                }
            }

            // Posisikan tengah
            gridContainer.x = app.screen.width / 2;
            gridContainer.y = (app.screen.height / 2) - (gridSize * tileHeight / 4) + 50;
        };

        initPixi();

        return () => {
            app.destroy(true, { children: true });
        };
    }, [level]); // Render ulang kanvas setiap kali level berubah

    return (
        <div className="w-full h-full">
            <div
                ref={canvasRef}
                className="w-full h-full bg-[#F7F9F7] rounded-none overflow-hidden shadow-[inset_0_4px_20px_rgba(0,0,0,0.03)] border-2 border-white relative"
            >
                {/* Indikator Level Melayang di dalam Kanvas */}
                <div className="absolute top-6 left-6 z-10 flex flex-col gap-3">
                    <div className="bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl shadow-sm border border-white flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-2xl">
                            {getMainTree(level)}
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Level Anda</p>
                            <p className="text-lg font-black text-gray-800 leading-none">{level}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}