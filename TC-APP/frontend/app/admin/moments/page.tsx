import { createClient } from '@supabase/supabase-js';
import { createLiveMoment } from '@/app/actions/admin';

// Admin Client for fetching list (could use standard client if Public Read policy exists)
// But using Admin ensures we see everything regardless of policy flux.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminMomentsPage() {
    const { data: moments } = await supabaseAdmin
        .from('live_moments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Live Moment Operator</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Section */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 h-fit">
                    <h3 className="text-lg font-bold mb-4 text-[#FFD700]">Create New Moment</h3>
                    <form action={createLiveMoment} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Player Name</label>
                            <input name="playerName" required className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-white focus:border-[#FFD700] outline-none" placeholder="e.g. Shohei Ohtani" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Title</label>
                            <input name="title" required className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-white focus:border-[#FFD700] outline-none" placeholder="e.g. Walk-off Home Run" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Type</label>
                            <select name="type" className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-white focus:border-[#FFD700] outline-none">
                                <option value="HOMERUN">Homerun</option>
                                <option value="VICTORY">Victory</option>
                                <option value="RECORD_BREAK">Record Breaker</option>
                                <option value="BIG_PLAY">Big Play (Highlight/Strikeout)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Intensity (1-5)</label>
                            <select name="intensity" className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-white focus:border-[#FFD700] outline-none">
                                <option value="5">5 - Legendary</option>
                                <option value="4">4 - High</option>
                                <option value="3">3 - Medium</option>
                                <option value="2">2 - Low</option>
                                <option value="1">1 - Minimal</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Description</label>
                            <textarea name="description" rows={3} className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-white focus:border-[#FFD700] outline-none" placeholder="Context details..." />
                        </div>
                        <button type="submit" className="w-full bg-[#FFD700] text-black font-bold py-3 rounded hover:bg-[#F0C000] transition-colors">
                            Broadcast Moment
                        </button>
                    </form>
                </div>

                {/* List Section */}
                <div>
                    <h3 className="text-lg font-bold mb-4 text-gray-300">History Log</h3>
                    <div className="space-y-3">
                        {moments?.map((m: any) => (
                            <div key={m.id} className="bg-white/5 border border-white/10 p-4 rounded flex justify-between items-start">
                                <div>
                                    <div className="font-bold text-[#FFD700]">{m.player_name}</div>
                                    <div className="text-sm text-white">{m.title}</div>
                                    <div className="text-xs text-gray-500 mt-1">{new Date(m.created_at).toLocaleString()}</div>
                                </div>
                                <div className="bg-white/10 px-2 py-1 rounded text-xs font-mono">
                                    Lvl {m.intensity}
                                </div>
                            </div>
                        ))}
                        {moments?.length === 0 && (
                            <div className="text-gray-500 text-sm">No moments recorded yet.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
