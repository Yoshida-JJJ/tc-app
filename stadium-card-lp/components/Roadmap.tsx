"use client";

import { motion } from "framer-motion";

export const Roadmap = () => {
    const steps = [
        {
            title: "Connected Infrastructure",
            date: "COMING SOON",
            desc: "Vaulting開始。物理カードのデジタルツイン化と、秒速取引インフラを一般公開。",
            status: "active"
        },
        {
            title: "DeFi Fusion",
            date: "FUTURE VISION",
            desc: "カードNFTを担保とした資産流動化（レンディング）の実装。眠れる資産を資本へ。",
            status: "upcoming"
        },
        {
            title: "Social Impulse",
            date: "FUTURE VISION",
            desc: "TikTok/Instagramライブコマース完全統合。SNSの熱狂をそのまま取引へ昇華。",
            status: "upcoming"
        }
    ];

    return (
        <section id="roadmap" className="py-24 bg-stadium-black relative">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-4xl md:text-5xl font-display font-extrabold mb-16 text-center">
                    Evolution Waiting
                </h2>

                <div className="relative border-l-2 border-white/10 ml-4 md:ml-0 md:flex md:border-l-0 md:border-t-2 md:pt-12 gap-8">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="relative mb-12 md:mb-0 md:flex-1 pl-8 md:pl-0"
                        >
                            {/* Dot */}
                            <div className={`absolute top-0 -left-[9px] md:top-[-49px] md:left-0 w-4 h-4 rounded-full border-2 bg-stadium-black ${step.status === 'active' ? 'border-neon-blue' : 'border-white/20'}`}>
                                {step.status === 'active' && <div className="absolute inset-0 rounded-full bg-neon-blue animate-ping opacity-50" />}
                            </div>

                            <div className="text-neon-blue text-sm font-bold mb-2 uppercase tracking-widest">{step.date}</div>
                            <h4 className="text-2xl font-bold mb-4">{step.title}</h4>
                            <p className="text-gray-400 leading-relaxed text-sm md:text-base">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
