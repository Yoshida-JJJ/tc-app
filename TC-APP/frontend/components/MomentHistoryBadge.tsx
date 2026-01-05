import React from 'react';

interface MomentHistoryBadgeProps {
    history?: any[];
    liveCount?: number;
}

export default function MomentHistoryBadge({ history, liveCount = 0 }: MomentHistoryBadgeProps) {
    const historyCount = history?.length || 0;
    const total = historyCount + liveCount;

    if (total === 0) return null;

    return (
        <div className="bg-orange-500/90 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-orange-300 shadow-sm backdrop-blur-sm">
            <span className="text-[10px]">🏆</span>
            <span>{total} Moments</span>
        </div>
    );
}
