import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ICard {
    id: string;
    // catalog_id, catalog removed
    player_name?: string | null;
    year?: number | null;
    manufacturer?: string | null;
    team?: string | null;
    images?: string[];
    is_rookie?: boolean;
    is_autograph?: boolean;
    price?: number | null;
    status?: string | null;
    variation?: string | null;
    series_name?: string | null;
    card_number?: string | null;
    moment_history?: any[];
    moment_created_at?: string | null;
}

import MomentHistoryBadge from './MomentHistoryBadge';
interface ShowcaseItemProps {
    item: ICard;
    type?: 'listed' | 'purchased'; // To distinguish in aggregated view
    variant?: 'default' | 'live-moment';
    is_live_moment?: boolean; // Added flag
    live_moments?: any[]; // Array for multiple moments
    onDelete?: (id: string) => void;
    onCancel?: (id: string) => void;
    onToggleDisplay?: (id: string, currentStatus: string) => void;
    onClone?: (id: string) => void;
    onRestore?: (id: string) => void;
    isArchived?: boolean;
    moment_created_at?: string | null;
}

export default function ShowcaseCard({ item, type, variant = 'default', is_live_moment, live_moments = [], onDelete, onCancel, onToggleDisplay, onClone, onRestore, isArchived, moment_created_at }: ShowcaseItemProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const hasBackImage = item.images && item.images.length > 1;
    // Use prop if provided, otherwise fallback to variant (for backward compatibility or explicit override)
    const isLiveMoment = is_live_moment || variant === 'live-moment' || live_moments.length > 0;

    // Countdown logic for multiple moments
    const [momentsWithTime, setMomentsWithTime] = useState<any[]>([]);
    const [isLiveActive, setIsLiveActive] = useState(isLiveMoment);

    useEffect(() => {
        if (isLiveMoment) {
            // Normalize moments: use live_moments array or fallback to single moment_created_at
            let sourceMoments = [...live_moments];
            if (sourceMoments.length === 0 && (is_live_moment || variant === 'live-moment')) {
                sourceMoments.push({
                    id: 'temp-' + item.id,
                    created_at: moment_created_at || new Date().toISOString(),
                    title: 'Live Moment'
                });
            }

            const updateTimers = () => {
                const now = new Date().getTime();
                const updated = sourceMoments.map(m => {
                    const startTime = new Date(m.created_at).getTime();
                    const endTime = startTime + 60 * 60 * 1000;
                    const distance = endTime - now;

                    if (distance > 0) {
                        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                        return {
                            ...m,
                            timeLeft: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
                            isExpired: false
                        };
                    }
                    return { ...m, timeLeft: '00:00', isExpired: true };
                });

                setMomentsWithTime(updated);
                setIsLiveActive(updated.some(m => !m.isExpired));
            };

            updateTimers();
            const timerId = setInterval(updateTimers, 1000);
            return () => clearInterval(timerId);
        } else {
            setMomentsWithTime([]);
            setIsLiveActive(false);
        }
    }, [isLiveMoment, live_moments, is_live_moment, variant, moment_created_at, item.id]);

    const handleFlip = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsFlipped(!isFlipped);
    };

    return (
        <motion.div
            className={`group relative flex flex-col rounded-xl overflow-hidden border transition-all duration-500 bg-brand-dark-light/50`}
            animate={isLiveActive ? {
                boxShadow: [
                    "0 0 15px rgba(255, 215, 0, 0.2)",
                    "0 0 30px rgba(255, 215, 0, 0.5)",
                    "0 0 15px rgba(255, 215, 0, 0.2)"
                ],
                borderColor: [
                    "rgba(255, 215, 0, 0.4)",
                    "rgba(255, 215, 0, 1)",
                    "rgba(255, 215, 0, 0.4)"
                ]
            } : {}}
            transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            whileHover={{ scale: 1.02 }}
            style={{
                borderColor: isLiveActive ? '#FFD700' : 'rgba(255, 255, 255, 0.1)'
            }}
        >

            {/* Main Clickable Link Overlay */}
            <Link href={`/listings/${item.id}`} className="absolute inset-0 z-10" />

            {/* Live Moment Badge */}
            {isLiveActive && (
                <div className="absolute top-0 left-0 z-30 w-full overflow-hidden h-full pointer-events-none p-3 space-y-2">
                    {momentsWithTime.filter(m => !m.isExpired).map((m, idx) => (
                        <div key={m.id || idx} className="relative px-2 py-0.5 bg-brand-gold text-brand-dark text-[10px] font-bold tracking-wider rounded shadow-lg shadow-brand-gold/20 border border-white/20 flex items-center gap-1.5 z-50 animate-pulse w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                            LIVE
                            <span className="ml-1 pl-1 border-l border-brand-dark/20 font-mono">{m.timeLeft}</span>
                        </div>
                    ))}
                    {/* Corner Glow Effect */}
                    <div className="absolute -top-10 -left-10 w-20 h-20 bg-brand-gold/30 blur-2xl rounded-full"></div>
                    <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-brand-gold/30 blur-2xl rounded-full"></div>
                </div>
            )}
            {/* Card Image Area */}
            <div className="relative aspect-[3/4] w-full perspective-[1000px]">
                <div className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped && (hasBackImage || isLiveActive || (item.moment_history && item.moment_history.length > 0)) ? '[transform:rotateY(180deg)]' : ''}`}>
                    {/* Front Image */}
                    <div className="absolute inset-0 w-full h-full [backface-visibility:hidden]">
                        {item.images && item.images[0] ? (
                            <Image
                                src={item.images[0]}
                                alt={item.player_name || 'Card Image'}
                                fill
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-brand-platinum/20">No Image</div>
                        )}
                        {/* Live Moment Inner Glow */}
                        {isLiveActive && (
                            <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(255,215,0,0.3)] mix-blend-overlay pointer-events-none" />
                        )}
                    </div>

                    {/* Back Image */}
                    {hasBackImage && (
                        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-brand-dark-light relative">
                            <Image
                                src={(item.images && item.images[1]) || ''}
                                alt={`${item.player_name || ''} Back`}
                                fill
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                                className="object-cover"
                            />

                            {/* Live Moment Stats Overlay / Latest Stamped Moment */}
                            {(isLiveActive || (item.moment_history && item.moment_history.length > 0)) && (
                                <div className="absolute inset-0 bg-black/70 flex flex-col justify-center items-center p-4 text-center">
                                    <div className="border-2 border-brand-gold/50 p-3 rounded-lg bg-black/40 backdrop-blur-md w-full">
                                        <h4 className="text-brand-gold font-heading font-bold text-sm mb-2 tracking-widest border-b border-brand-gold/30 pb-1">
                                            {isLiveActive ? 'LIVE MOMENT DATA' : 'STAMPED MOMENT'}
                                        </h4>
                                        {(() => {
                                            const activeMoment = momentsWithTime.find(m => !m.isExpired);
                                            // Prioritize moments with memories, or fallback to the absolute latest
                                            const history = item.moment_history || [];
                                            const memoryMoment = history.slice().reverse().find((m: any) => m.memories && m.memories.length > 0);

                                            const latestMoment = memoryMoment || (history.length > 0 ? history[history.length - 1] : activeMoment);

                                            if (!latestMoment) return null;

                                            return (
                                                <div className="space-y-2 text-[10px] font-mono">
                                                    <div className="flex justify-between">
                                                        <span className="text-brand-platinum/60 uppercase">TITLE</span>
                                                        <span className="text-white font-bold truncate max-w-[100px]" title={latestMoment.title || 'ACTIVE'}>
                                                            {latestMoment.title || 'ACTIVE NOW'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-brand-platinum/60 uppercase">PLAYER</span>
                                                        <span className="text-white font-bold">{latestMoment.player_name || item.player_name || '---'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-brand-platinum/60 uppercase">TIME</span>
                                                        <span className="text-white font-bold">
                                                            {latestMoment.timestamp ? new Date(latestMoment.timestamp).toLocaleDateString() : (latestMoment.created_at ? new Date(latestMoment.created_at).toLocaleDateString() : new Date().toLocaleDateString())}
                                                        </span>
                                                    </div>
                                                    <div className="pt-2 border-t border-brand-platinum/10">
                                                        <div className="text-brand-gold font-bold mb-1 uppercase text-[9px]">
                                                            {latestMoment.description?.substring(0, 30) || 'CAPTURING LIVE EVENT...'}
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 text-[9px]">
                                                            <div className="bg-brand-platinum/10 rounded p-1">
                                                                <div className="text-brand-platinum/50 uppercase">INTENSITY</div>
                                                                <div className="text-white font-bold">{latestMoment.intensity || '--'}</div>
                                                            </div>
                                                            <div className="bg-brand-platinum/10 rounded p-1">
                                                                <div className="text-brand-platinum/50 uppercase">RESULT</div>
                                                                <div className="text-white font-bold truncate">{latestMoment.match_result || '---'}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Flip Button */}
                {(hasBackImage || isLiveActive || (item.moment_history && item.moment_history.length > 0)) && (
                    <button
                        onClick={handleFlip}
                        className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-black/60 text-white hover:bg-brand-blue hover:text-white transition-colors backdrop-blur-sm border border-white/10"
                        title="Flip Card"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Footer Area: Info & Actions */}
            <div className="p-3 bg-brand-dark-light border-t border-brand-platinum/5 flex flex-col gap-2">
                {/* Info */}
                <div className="flex justify-between items-start">
                    <div className="overflow-hidden">
                        <p className="text-white font-bold text-sm truncate" title={item.player_name || 'Unknown'}>{item.player_name || 'Unknown'}</p>
                        <p className="text-brand-platinum/70 text-xs truncate">{item.year || ''} {item.manufacturer || ''}</p>
                    </div>
                    {/* Moment History Badge */}
                    <MomentHistoryBadge
                        history={item.moment_history}
                        liveCount={0} // Disabled per user request (Step 7712)
                    />
                </div>

                {/* Status & Price */}
                <div className="flex justify-between items-center min-h-[20px]">
                    {type === 'purchased' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full border bg-green-500/10 border-green-500/30 text-green-400 font-medium tracking-wide">
                            PURCHASED
                        </span>
                    ) : (
                        <>
                            {item.status === 'Active' ? (
                                <div className="flex items-center gap-1.5">
                                    <div className="w-4 h-4 rounded-full bg-brand-gold flex items-center justify-center shadow-[0_0_8px_rgba(234,179,8,0.4)]">
                                        <span className="text-[9px] text-brand-dark font-bold">¥</span>
                                    </div>
                                    <span className="font-heading font-bold text-white text-base tracking-tight">
                                        {item.price?.toLocaleString() ?? '---'}
                                    </span>
                                </div>
                            ) : (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium tracking-wide ${item.status === 'Sold' || item.status === 'Completed' || item.status === 'Delivered' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                                    item.status === 'Display' ? 'bg-brand-blue/10 border-brand-blue/30 text-brand-blue-glow' :
                                        'bg-brand-platinum/10 border-brand-platinum/20 text-brand-platinum/60'
                                    } `}>
                                    {item.status === 'Sold' || item.status === 'Completed' || item.status === 'Delivered' ? 'SOLD' :
                                        item.status === 'Display' ? 'DISPLAY' :
                                            (item.status || '').toUpperCase()}
                                </span>
                            )}
                        </>
                    )}
                </div>

                {/* Action Buttons Row */}
                <div className="relative z-20 flex items-center justify-end gap-2 pt-3 mt-1 border-t border-brand-platinum/10">
                    {/* Toggle Display Status Button */}
                    {!isArchived && (((item.status === 'Draft' || item.status === 'Display' || item.status === 'Active') && onToggleDisplay) || (type === 'purchased' && onClone)) ? (
                        <div className="group/tooltip relative">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (type === 'purchased' && onClone) {
                                        onClone(item.id);
                                    } else if (onToggleDisplay) {
                                        onToggleDisplay(item.id, item.status || '');
                                    }
                                }}
                                className={`p-2 rounded-lg border transition-all duration-300 ${item.status === 'Display'
                                    ? 'bg-brand-blue/10 border-brand-blue/40 text-brand-blue hover:bg-brand-blue/20 hover:border-brand-blue'
                                    : 'bg-brand-platinum/5 border-brand-platinum/10 text-brand-platinum/40 hover:bg-brand-platinum/10 hover:text-brand-platinum hover:border-brand-platinum/30'
                                    } `}
                            >
                                {item.status === 'Display' ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                )}
                            </button>
                            <div className="absolute center-x bottom-full mb-2 px-2 py-1 bg-brand-dark border border-brand-platinum/20 text-white text-[10px] rounded shadow-xl opacity-0 group-hover/tooltip:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-200 z-50">
                                {item.status === 'Display' ? "非公開にする" :
                                    (item.status === 'Active' ? "Displayに変更" :
                                        (type === 'purchased' ? "Displayに追加 (Clone)" : "公開する"))}
                            </div>
                        </div>
                    ) : null}

                    {/* List Button (For Draft/Display OR Purchased) */}
                    {(item.status === 'Draft' || item.status === 'Display' || type === 'purchased') && (
                        <Link
                            href={`/sell?source=collection&id=${item.id}`}
                            className="group/tooltip relative p-2 bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold rounded-lg border border-brand-gold/30 hover:border-brand-gold/50 transition-all duration-300"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <div className="absolute right-0 bottom-full mb-2 px-2 py-1 bg-brand-dark border border-brand-platinum/20 text-white text-[10px] rounded shadow-xl opacity-0 group-hover/tooltip:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-200 z-50">
                                出品する
                            </div>
                        </Link>
                    )}

                    {/* Cancel Listing Button (for Active items) */}
                    {!isArchived && item.status === 'Active' && onCancel && (
                        <div className="group/tooltip relative">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onCancel(item.id);
                                }}
                                className="p-2 bg-brand-platinum/5 hover:bg-red-500/20 text-brand-platinum/60 hover:text-red-400 rounded-lg border border-brand-platinum/10 hover:border-red-500/30 transition-all duration-300"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <div className="absolute right-0 bottom-full mb-2 px-2 py-1 bg-brand-dark border border-brand-platinum/20 text-white text-[10px] rounded shadow-xl opacity-0 group-hover/tooltip:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-200 z-50">
                                出品取り消し
                            </div>
                        </div>
                    )}

                    {/* Restore Button (Archive only) */}
                    {isArchived && onRestore && (
                        <div className="group/tooltip relative">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onRestore(item.id);
                                }}
                                className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg border border-green-500/30 hover:border-green-500/50 transition-all duration-300"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            </button>
                            <div className="absolute right-0 bottom-full mb-2 px-2 py-1 bg-brand-dark border border-brand-platinum/20 text-white text-[10px] rounded shadow-xl opacity-0 group-hover/tooltip:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-200 z-50">
                                コレクションに戻す
                            </div>
                        </div>
                    )}

                    {/* Delete Button (Normal view only, or Archive if physical delete allowed) */}
                    {!isArchived && onDelete && (item.status === 'Draft' || item.status === 'Display') && (
                        <div className="group/tooltip relative">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onDelete(item.id);
                                }}
                                className="p-2 bg-brand-platinum/5 hover:bg-red-500/20 text-brand-platinum/40 hover:text-red-400 rounded-lg border border-brand-platinum/10 hover:border-red-500/30 transition-all duration-300"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                            <div className="absolute right-0 bottom-full mb-2 px-2 py-1 bg-brand-dark border border-brand-platinum/20 text-white text-[10px] rounded shadow-xl opacity-0 group-hover/tooltip:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-200 z-50">
                                削除 (アーカイブ)
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
