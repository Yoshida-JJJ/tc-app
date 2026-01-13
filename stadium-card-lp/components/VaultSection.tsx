"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Box, ArrowRightLeft } from "lucide-react";

export const VaultSection = () => {
    const features = [
        {
            icon: <Box className="text-neon-blue" />,
            title: "Safe Vaulting",
            desc: "鑑定・保管庫（ボールト）へ預け入れ。物理カードを厳重に保護。"
        },
        {
            icon: <Zap className="text-neon-blue" />,
            title: "Digital Twin",
            desc: "即座にNFT化。所有権をブロックチェーン上で管理可能に。"
        },
        {
            icon: <ArrowRightLeft className="text-neon-blue" />,
            title: "Instant Trade",
            desc: "物理配送不要。秒速・低コストでのボーダレスな売買。"
        },
        {
            icon: <Shield className="text-neon-blue" />,
            title: "Zero Risk",
            desc: "輸送紛失リスクを排除。資産価値の透明性を100%保証。"
        }
    ];

    return (
        <section className="py-32 bg-stadium-black relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:w-1/2"
                    >
                        <h2 className="text-neon-blue font-display font-bold tracking-[0.2em] mb-4 uppercase text-sm">Web3 x Logistics</h2>
                        <h3 className="text-4xl md:text-6xl font-display font-extrabold mb-8 leading-tight tracking-tighter">
                            Connected Collectibles:<br />
                            <span className="text-white">所有の概念を書き換える。</span>
                        </h3>
                        <p className="text-xl text-gray-400 mb-10 leading-relaxed font-light">
                            物理カードを預ける。それだけで、資産は自由に羽ばたくインフラとなります。<br /><br />
                            「物理的制約」という枷を取り払い、すべてのトレカに圧倒的な「流動性」と「透明性」を。既存産業とWeb3を繋ぐ架け橋が、ここにあります。
                        </p>
                    </motion.div>

                    <div className="lg:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="glass p-8 rounded-3xl border border-white/5 hover:border-neon-blue/30 transition-all group"
                            >
                                <div className="mb-4 p-3 rounded-xl bg-white/5 w-fit group-hover:bg-neon-blue/10 transition-colors">
                                    {f.icon}
                                </div>
                                <h4 className="text-xl font-bold mb-2">{f.title}</h4>
                                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
