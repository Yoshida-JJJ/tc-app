"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ButtonProps {
    children: ReactNode;
    variant?: "primary" | "outline" | "neon";
    className?: string;
    onClick?: () => void;
}

export const Button = ({ children, variant = "primary", className = "", onClick }: ButtonProps) => {
    const variants = {
        primary: "bg-white text-black hover:bg-gray-200",
        outline: "border border-white/20 hover:bg-white/10 text-white",
        neon: "bg-transparent border border-neon-blue text-neon-blue hover:bg-neon-blue/10 neon-border-blue",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`px-8 py-4 rounded-xl font-bold transition-all duration-300 ${variants[variant]} ${className}`}
        >
            {children}
        </motion.button>
    );
};
