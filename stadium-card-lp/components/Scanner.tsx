"use client";

import { motion } from "framer-motion";
import { Scan, Smartphone } from "lucide-react";

export default function Scanner() {
    return (
        <section className="bg-stadium-black py-20 text-white relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

            <div className="mx-auto max-w-7xl px-4 relative z-10">
                <div className="flex flex-col items-center text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">
                        Magic Scan with <span className="text-neon-blue">Gemini</span>
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl">
                        出品は、写真を撮るだけ。AIが選手名、年度、グレードを3秒で解析。
                        面倒な入力作業は一切不要です。
                    </p>
                </div>

                <div className="flex justify-center">
                    <div className="relative w-[300px] h-[600px] rounded-[3rem] border-8 border-[#333] bg-[#000] shadow-2xl overflow-hidden">
                        {/* Phone Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#333] rounded-b-xl z-20" />

                        {/* Camera View */}
                        <div className="relative h-full w-full bg-gray-900 flex items-center justify-center">
                            {/* Card Object */}
                            <div className="w-48 h-72 bg-gray-800 rounded-lg border border-white/20 relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-gray-600 font-bold">CARD</span>
                                </div>
                            </div>

                            {/* Scanning Overlay */}
                            <motion.div
                                animate={{
                                    top: ["10%", "80%", "10%"]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                className="absolute left-0 right-0 h-1 bg-neon-blue shadow-[0_0_20px_rgba(0,240,255,1)] z-10 opacity-80"
                            />

                            {/* Recognition Box */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: [0, 1, 1, 0], scale: 1 }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    times: [0, 0.4, 0.8, 1]
                                }}
                                className="absolute p-4 top-2/3 bg-white/10 backdrop-blur-md rounded-xl border border-neon-blue/50 text-left w-64"
                            >
                                <div className="flex items-center gap-2 text-neon-blue text-xs font-bold mb-1">
                                    <Scan className="w-4 h-4" /> SCAN COMPLETE
                                </div>
                                <div className="text-white font-bold">Shohei Ohtani</div>
                                <div className="text-gray-300 text-sm">2024 Chrome Reference</div>
                                <div className="text-neon-blue text-lg font-bold mt-1">PSA 10 GEM MT</div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
