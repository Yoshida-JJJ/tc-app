"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type LiveMomentData = {
    id: string;
    player_name: string;
    type: "HOMERUN" | "BIG_PLAY" | "VICTORY" | "RECORD_BREAK" | "system_notice";
    title: string;
    description?: string;
    intensity: number; // 1-5
};

interface LiveMomentToastProps {
    data: LiveMomentData | null;
    onDismiss: () => void;
}

export default function LiveMomentToast({ data, onDismiss }: LiveMomentToastProps) {
    // Auto-dismiss logic is handled by parent or here. 
    // Let's handle generic auto-dismiss here as a backup? 
    // Actually, framer-motion exit animations work best when presence is controlled by parent.
    // relying on parent for `data` presence.

    if (!data) return null;

    // Determine colors based on intensity/type
    const isGold = data.intensity >= 4 || data.type === 'VICTORY' || data.type === 'RECORD_BREAK';

    // Base styles
    const containerClasses = isGold
        ? "bg-gradient-to-r from-brand-gold/90 to-brand-gold-glow/90 border-brand-gold text-brand-dark"
        : "bg-brand-dark-light/95 border-brand-blue/30 text-white backdrop-blur-xl";

    return (
        <AnimatePresence>
            <div className="fixed top-20 right-4 md:right-8 z-[100] w-full max-w-sm pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 100, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={`
                        pointer-events-auto p-4 rounded-xl border shadow-2xl overflow-hidden relative
                        ${containerClasses}
                    `}
                >
                    {/* Intensity Particles/Glow (Simplified CSS) */}
                    {isGold && (
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
                    )}
                    {data.intensity === 5 && (
                        <div className="absolute inset-0 animate-pulse bg-brand-gold/20 z-0" />
                    )}

                    <div className="relative z-10 flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border ${isGold ? 'border-brand-dark/20 bg-brand-dark/10' : 'border-white/10 bg-white/5'}`}>
                                {data.type.replace('_', ' ')}
                            </span>
                            <button onClick={onDismiss} className="opacity-60 hover:opacity-100">
                                ×
                            </button>
                        </div>

                        <h4 className={`font-heading font-bold text-lg leading-tight mt-1 ${isGold ? 'text-brand-dark' : 'text-white'}`}>
                            {data.title}
                        </h4>

                        <p className={`text-sm font-bold opacity-80 ${isGold ? 'text-brand-dark' : 'text-brand-platinum'}`}>
                            {data.player_name}
                        </p>

                        {data.description && (
                            <p className={`text-xs mt-1 leading-relaxed ${isGold ? 'text-brand-dark/80' : 'text-brand-platinum/60'}`}>
                                {data.description}
                            </p>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
