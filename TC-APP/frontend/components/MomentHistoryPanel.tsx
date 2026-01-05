import { addMomentMemory, editMomentMemory, deleteMomentMemory, toggleHideMoment, toggleHideMomentMemory } from '../app/actions/item';
import { createClient } from '../utils/supabase/client';
import { useEffect, useState } from 'react';

interface MomentHistoryPanelProps {
    history?: any[];
    itemId?: string;
    isOwner?: boolean;
    onSuccess?: () => void;
}

export default function MomentHistoryPanel({ history, itemId, isOwner, onSuccess }: MomentHistoryPanelProps) {
    // State for managing the modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [targetMomentIndex, setTargetMomentIndex] = useState<number | null>(null);
    const [targetMomentId, setTargetMomentId] = useState<string | undefined>(undefined);

    // If editing an existing memory
    const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);

    const [noteContent, setNoteContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [expandedMemoryIds, setExpandedMemoryIds] = useState<string[]>([]);

    const togglePeek = (memoryId: string) => {
        setExpandedMemoryIds(prev =>
            prev.includes(memoryId)
                ? prev.filter(id => id !== memoryId)
                : [...prev, memoryId]
        );
    };

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
        };
        fetchUser();
    }, []);

    if (!history || !Array.isArray(history) || history.length === 0) return null;

    // --- Actions ---

    const openAddModal = (index: number, moment: any) => {
        if (!itemId) {
            alert('購入者情報を同期中です。1分ほどお待ちください。 (Possession syncing...)');
            return;
        }
        setTargetMomentIndex(index);
        setTargetMomentId(moment.moment_id);
        setEditingMemoryId(null); // Adding new
        setNoteContent('');
        setIsModalOpen(true);
    };

    const openEditModal = (index: number, moment: any, memory: any) => {
        if (!itemId) return;
        setTargetMomentIndex(index);
        setTargetMomentId(moment.moment_id);
        setEditingMemoryId(memory.id);
        setNoteContent(memory.text || '');
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!itemId || targetMomentIndex === null) return;

        setIsSubmitting(true);
        try {
            // Note: history is displayed reversed, so we need original index if using array index
            // But we prefer momentId if available. Let's pass array index as fallback.
            // Re-calculate original index from the displayed index (which comes from the mapped reversed slice?)
            // Wait, the map below uses `history.slice().reverse().map(...)`.
            // So `index` passed here is the Display Index.
            // Original Index = (Length - 1) - Display Index.
            const originalIndex = history.length - 1 - targetMomentIndex;

            if (editingMemoryId) {
                await editMomentMemory(itemId, originalIndex, editingMemoryId, noteContent, targetMomentId);
            } else {
                await addMomentMemory(itemId, originalIndex, noteContent, targetMomentId);
            }

            setIsModalOpen(false);
            if (onSuccess) onSuccess();
        } catch (error: any) {
            alert(error.message || 'Failed to save note');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (displayIndex: number, moment: any, memoryId: string) => {
        if (!itemId) return;

        const originalIndex = history.length - 1 - displayIndex;
        const memory = moment.memories?.find((m: any) => m.id === memoryId);
        if (!memory) return;

        if (!confirm("このメッセージを完全に消去しますか？ この操作は取り消せません。")) return;

        try {
            await deleteMomentMemory(itemId, originalIndex, memoryId, moment.moment_id);
            if (onSuccess) onSuccess();
        } catch (err: any) { alert(err.message); }
    };

    const handleToggleHide = async (displayIndex: number, moment: any, memoryId: string) => {
        if (!itemId) return;
        const originalIndex = history.length - 1 - displayIndex;
        try {
            await toggleHideMomentMemory(itemId, originalIndex, memoryId, moment.moment_id);
            if (onSuccess) onSuccess();
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="border-t border-brand-platinum/10 py-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-white to-brand-gold animate-shimmer bg-[length:200%_100%] uppercase tracking-widest flex items-center gap-3">
                    <span className="text-2xl">⚡</span>
                    Legendary History / 伝説の記録
                </h3>
                <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(234,88,12,0.4)] border border-white/20">
                    <span>🏆</span>
                    {history.length} Moments
                </div>
            </div>

            <div className="space-y-6">
                {history.slice().reverse().map((moment: any, index: number) => (
                    <div
                        key={index}
                        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 via-black to-gray-800 border border-amber-400/30 p-1 group hover:border-amber-400/60 transition-all duration-500 hover:shadow-[0_0_20px_rgba(251,191,36,0.15)]"
                    >
                        {/* Background Effects */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] group-hover:bg-amber-500/20 transition-colors duration-500"></div>

                        <div className="relative bg-black/40 backdrop-blur-sm rounded-lg p-5 md:p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">

                            {/* Icon / Intensity Badge */}
                            <div className="flex-shrink-0">
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg border border-white/20 transform group-hover:scale-105 transition-transform duration-300">
                                    <div className="text-3xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                                        {moment.intensity >= 90 ? '🔥' : '⚾'}
                                    </div>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 w-full">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                    <span className="text-xs font-mono text-amber-500/80 tracking-widest uppercase flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                                        {new Date(moment.timestamp).toLocaleDateString()}
                                    </span>

                                    <div className="flex items-center gap-2">
                                        {/* Status Badge */}
                                        {(() => {
                                            const now = new Date().getTime();
                                            const momentTime = new Date(moment.timestamp).getTime();
                                            const isRecent = now - momentTime < 60 * 60 * 1000;
                                            const isFinalized = moment.status === 'finalized';

                                            if (isFinalized) {
                                                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 uppercase">Match End</span>;
                                            } else if (isRecent) {
                                                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-500 border border-red-500/30 animate-pulse uppercase flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>Live</span>;
                                            } else {
                                                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase">Live End</span>;
                                            }
                                        })()}
                                    </div>
                                </div>

                                <h4 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors duration-300">
                                    {moment.title}
                                </h4>

                                <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                                    {moment.description}
                                </p>

                                {/* ---------------- Memories Section ---------------- */}
                                <div className="mt-6 space-y-4">

                                    {/* Legacy Note Support */}
                                    {moment.user_note && (
                                        <div className="p-3 rounded-lg bg-white/5 border border-white/10 relative group/note">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-[10px] text-brand-gold uppercase tracking-wider font-bold">Previous Note</span>
                                                <span className="text-[10px] text-gray-500">{new Date(moment.note_updated_at || moment.timestamp).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-gray-300 italic font-serif leading-relaxed">"{moment.user_note}"</p>
                                        </div>
                                    )}

                                    {/* New Memories Array */}
                                    {moment.memories && Array.isArray(moment.memories) && moment.memories.map((memory: any) => {
                                        const isAuthor = currentUser?.id === memory.author_id;
                                        const canManage = isAuthor || isOwner;

                                        // New Visibility Logic:
                                        // 1. If visible -> Show to everyone
                                        // 2. If hidden -> Show placeholder to everyone, show content ONLY to Owner, Author, OR if the user is "peeking"
                                        const isPeeking = expandedMemoryIds.includes(memory.id);
                                        const showContent = !memory.is_hidden || canManage || isPeeking;

                                        return (
                                            <div key={memory.id} className={`rounded-xl border relative group/mem transition-all duration-300 ${memory.is_hidden ? 'p-2 bg-black/40 border-white/5 opacity-50' : 'p-4 bg-brand-gold/5 border-brand-gold/20'}`}>
                                                {/* Header / Info Line */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-700 to-black border border-white/20 flex items-center justify-center text-[10px] font-bold text-white">
                                                            {memory.author_name ? memory.author_name[0] : 'U'}
                                                        </div>
                                                        <span className="text-xs text-brand-platinum font-bold">{memory.author_name}</span>
                                                        {memory.is_hidden && (
                                                            <span className="text-[10px] text-gray-500 font-mono italic">
                                                                (Private History - Hidden)
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] text-brand-platinum/40 font-mono">
                                                            {new Date(memory.created_at).toLocaleDateString()}
                                                        </span>
                                                        {/* Inline Actions for Hidden state (Unhide - Owner/Author only) */}
                                                        {memory.is_hidden && canManage && (
                                                            <button
                                                                onClick={() => handleToggleHide(index, moment, memory.id)}
                                                                className="text-[10px] uppercase font-bold text-brand-gold hover:underline"
                                                            >
                                                                Unhide
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Body */}
                                                <div className="mt-2 animate-fade-in text-left">
                                                    {(showContent && !memory.is_hidden) || (isPeeking) ? (
                                                        <>
                                                            <p className={`text-sm italic font-serif leading-relaxed pl-2 border-l-2 ${memory.is_hidden ? 'text-gray-500 border-gray-700 font-sans' : 'text-brand-gold/90 border-brand-gold/30'}`}>
                                                                {memory.text}
                                                            </p>
                                                            {/* Actions for visible/owner/author context */}
                                                            <div className="flex gap-2 justify-end mt-2 opacity-0 group-hover/mem:opacity-100 transition-opacity">
                                                                {isAuthor && (
                                                                    <button
                                                                        onClick={() => openEditModal(index, moment, memory)}
                                                                        className="text-[10px] uppercase font-bold text-brand-gold hover:underline"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                )}
                                                                {canManage && (
                                                                    <button
                                                                        onClick={() => handleToggleHide(index, moment, memory.id)}
                                                                        className="text-[10px] uppercase font-bold text-brand-platinum/60 hover:text-white hover:underline"
                                                                    >
                                                                        {memory.is_hidden ? 'Unhide' : 'Hide'}
                                                                    </button>
                                                                )}
                                                                {isAuthor && (
                                                                    <button
                                                                        onClick={() => handleDelete(index, moment, memory.id)}
                                                                        className="text-[10px] uppercase font-bold text-red-500/60 hover:text-red-400 hover:underline"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                )}
                                                                {/* Close Peek button */}
                                                                {isPeeking && (
                                                                    <button
                                                                        onClick={() => togglePeek(memory.id)}
                                                                        className="text-[10px] uppercase font-bold text-gray-500 hover:underline"
                                                                    >
                                                                        Close
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center justify-between pl-2 border-l border-white/10">
                                                            <p className="text-[10px] text-brand-platinum/20 italic">
                                                                想い出の内容は非表示に設定されています。
                                                            </p>
                                                            <div className="flex gap-3">
                                                                {canManage && (
                                                                    <button
                                                                        onClick={() => handleToggleHide(index, moment, memory.id)}
                                                                        className="text-[10px] text-brand-gold/60 hover:text-brand-gold font-bold uppercase tracking-wider"
                                                                    >
                                                                        Unhide
                                                                    </button>
                                                                )}
                                                                {isAuthor && (
                                                                    <button
                                                                        onClick={() => handleDelete(index, moment, memory.id)}
                                                                        className="text-[10px] text-red-500/40 hover:text-red-500 font-bold uppercase tracking-wider"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => togglePeek(memory.id)}
                                                                    className="text-[10px] text-brand-gold/60 hover:text-brand-gold font-bold uppercase tracking-wider"
                                                                >
                                                                    内容を確認する (Peek)
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Add Button */}
                                    {isOwner && !moment.is_virtual && (
                                        <button
                                            onClick={() => openAddModal(index, moment)}
                                            className="w-full py-2 rounded-lg border border-dashed border-white/20 text-white/40 text-xs hover:bg-white/5 hover:text-brand-gold hover:border-brand-gold/30 transition-all flex items-center justify-center gap-2"
                                        >
                                            <span>✍️</span> 想い出を記録する
                                        </button>
                                    )}
                                    {isOwner && moment.is_virtual && (
                                        <div className="w-full py-2 rounded-lg border border-dashed border-white/10 text-brand-platinum/20 text-[10px] text-center italic select-none">
                                            ※所有者に関連付けられていないため記録できません
                                        </div>
                                    )}
                                </div>

                                {/* Match Result */}
                                {moment.match_result && (
                                    <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-2 mt-4">
                                        <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Result</span>
                                        <span className="text-sm font-mono font-bold text-amber-300 tracking-wide">
                                            {moment.match_result}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
                    <div className="glass-panel-premium border border-brand-gold/30 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-gold/20 rounded-full blur-[60px]"></div>
                        <h2 className="text-xl font-heading font-bold text-white mb-2 flex items-center gap-2">
                            <span className="text-brand-gold">✍️</span> {editingMemoryId ? 'Edit Memory' : 'New Memory'}
                        </h2>
                        <p className="text-xs text-brand-platinum/50 mb-6 uppercase tracking-widest">この瞬間の想い出をカードに刻む</p>

                        <div className="relative">
                            <textarea
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value.substring(0, 140))}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold/50 transition-all min-h-[120px] placeholder:text-white/20 font-serif italic"
                                placeholder="例: 現地で観戦していました！一生の宝物にします。"
                            />
                            <div className="absolute bottom-3 right-3 text-[10px] font-mono text-white/30">
                                {noteContent.length}/140
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-colors"
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSubmitting}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-gold to-orange-500 text-brand-dark font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-brand-gold/20 disabled:opacity-50"
                            >
                                {isSubmitting ? 'SAVING...' : 'SAVE MEMORY'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-4 text-center">
                <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] font-light">
                    Verified by Stadium Card Chain
                </p>
            </div>
        </div>
    );
}
