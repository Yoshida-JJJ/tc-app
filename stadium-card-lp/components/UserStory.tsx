"use client";

import { motion } from "framer-motion";
import { Clock, Zap, MessageSquare, TrendingUp } from "lucide-react";

export const UserStory = () => {
    const storySteps = [
        {
            time: "17:50",
            title: "予感：帰宅中のスタメン・デッキ",
            desc: "「本日のスタメン・デッキ」機能で、期待の若手選手をチェック。今夜、何かが起きる予感がする。直感に従い、数枚のカードを青田買いして試合に備える。",
            icon: <TrendingUp className="text-neon-blue" size={24} />,
            phase: "PREDICTION"
        },
        {
            time: "19:30",
            title: "熱狂：逆転満塁ホームランの瞬間",
            desc: "4番打者が放った白球が夜空を裂く！アプリが球団カラーに染まり、画面には『FEVER TIME』の文字。興奮のまま手持ちのサインカードを出品。取引が成立すると、そこには金色に輝く『Liveタグ』が自動で刻まれた。あの瞬間の記憶が、永遠の資産に変わる。",
            icon: <Zap className="text-orange-500" size={24} />,
            phase: "FEVER"
        },
        {
            time: "21:45",
            title: "余韻：ビクトリー・マーケットでの対話",
            desc: "試合終了後、勝利の興奮冷めやらぬマーケット。チャットには「今日のホームラン最高でしたね！」の声が飛び交う。売買は単なる取引を超え、ファン同士の深い絆へと変わっていく。",
            icon: <MessageSquare className="text-neon-blue" size={24} />,
            phase: "VICTORY"
        }
    ];

    return (
        <section className="py-32 bg-stadium-black relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-neon-red font-display font-bold tracking-[0.2em] mb-4 uppercase text-sm">Live Trading Experience</h2>
                    <h3 className="text-4xl md:text-6xl font-display font-extrabold mb-6 tracking-tighter leading-tight">
                        その瞬間が、永遠の価値になる。<br />
                        <span className="text-white/50">〜 あるナイターの夜 〜</span>
                    </h3>
                    <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
                        試合の熱狂を、資産に変えろ。そのカードには、あなただけのドラマが刻まれている。
                    </p>
                </div>

                <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-[39px] md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-neon-blue via-orange-500 to-neon-blue opacity-20" />

                    <div className="space-y-24">
                        {storySteps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: i * 0.2 }}
                                className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 relative`}
                            >
                                {/* Center Icon */}
                                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-20 h-20 rounded-full bg-stadium-black border-2 border-white/10 flex items-center justify-center z-10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                                    <div className="text-neon-blue">{step.icon}</div>
                                </div>

                                <div className={`w-full md:w-1/2 pl-24 md:pl-0 ${i % 2 === 0 ? 'md:pr-24 md:text-right' : 'md:pl-24 text-left'}`}>
                                    <div className="inline-block px-4 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Clock size={12} className="text-neon-blue" />
                                            <span className="text-xs font-bold tracking-widest text-white/70 uppercase">{step.time}</span>
                                        </div>
                                    </div>
                                    <h4 className="text-2xl md:text-3xl font-bold mb-4">{step.title}</h4>
                                    <p className="text-gray-400 leading-relaxed font-light">
                                        {step.desc}
                                    </p>
                                    {step.phase === "FEVER" && (
                                        <div className="mt-6 flex flex-wrap gap-3 justify-start md:justify-end">
                                            <div className="px-3 py-1 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-bold uppercase tracking-widest">Live Tag Activated</div>
                                            <div className="px-3 py-1 rounded-md bg-neon-blue/10 border border-neon-blue/20 text-neon-blue text-[10px] font-bold uppercase tracking-widest">Memory assetized</div>
                                        </div>
                                    )}
                                </div>

                                <div className="hidden md:block w-1/2" />
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="mt-24 text-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="p-12 glass rounded-[3rem] border border-white/5 inline-block max-w-2xl"
                    >
                        <p className="text-lg text-gray-300 italic leading-relaxed">
                            「勝利の後に成立したカードを眺める。そこには、あの歓声と震えるような興奮が『金の刻印』として残されている。それは、単なる取引ではない。私の野球人生の一部を所有するということなんだ。」
                        </p>
                        <div className="mt-6 text-sm font-bold text-neon-blue tracking-widest uppercase">— ある一人のDragons Fan</div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
