"use client";

import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-red rounded-lg animate-glow-pulse" />
                    <span className="text-2xl font-display font-bold tracking-tighter">
                        STADIUM <span className="text-neon-blue">CARD</span>
                    </span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <button className="px-6 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-neon-blue transition-all duration-300 transform hover:scale-105 active:scale-95">
                        Beta Access
                    </button>
                </div>

                {/* Mobile Toggle */}
                <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden glass border-b border-white/10 p-6 flex flex-col gap-4"
                >
                    <button className="w-full py-4 bg-white text-black font-bold rounded-xl active:bg-neon-blue">
                        Beta Access
                    </button>
                </motion.div>
            )}
        </nav>
    );
};
