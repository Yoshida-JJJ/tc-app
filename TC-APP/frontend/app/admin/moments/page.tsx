import { createClient } from '@supabase/supabase-js';
import { createLiveMoment, finalizeMoment } from '@/app/actions/admin';

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
                        {/* matchResult replacement: Structured Inputs */}
                        <div className="bg-black/30 p-3 rounded border border-white/10 space-y-3">
                            <label className="block text-sm text-gray-400 -mb-2">Match Status</label>

                            {/* Visitor */}
                            <div className="flex gap-2">
                                <select name="teamVisitor" required className="flex-1 bg-black/50 border border-white/20 rounded px-2 py-1 text-white text-sm focus:border-[#FFD700]">
                                    <option value="">Visitor Team</option>
                                    <optgroup label="MLB">
                                        <option value="LAD">LAD (Dodgers)</option>
                                        <option value="NYY">NYY (Yankees)</option>
                                        <option value="SD">SD (Padres)</option>
                                        <option value="HOU">HOU (Astros)</option>
                                        <option value="ATL">ATL (Braves)</option>
                                        <option value="PHI">PHI (Phillies)</option>
                                        <option value="NYM">NYM (Mets)</option>
                                        <option value="BOS">BOS (Red Sox)</option>
                                        <option value="LAA">LAA (Angels)</option>
                                        <option value="CHC">CHC (Cubs)</option>
                                        <option value="TOR">TOR (Blue Jays)</option>
                                    </optgroup>
                                    <optgroup label="NPB Central">
                                        <option value="YG">Giants (Kyojin)</option>
                                        <option value="T">Tigers (Hanshin)</option>
                                        <option value="DB">BayStars (DeNA)</option>
                                        <option value="C">Carp (Hiroshima)</option>
                                        <option value="D">Dragons (Chunichi)</option>
                                        <option value="S">Swallows (Yakult)</option>
                                    </optgroup>
                                    <optgroup label="NPB Pacific">
                                        <option value="H">Hawks (SoftBank)</option>
                                        <option value="F">Fighters (Nippon-Ham)</option>
                                        <option value="M">Marines (Lotte)</option>
                                        <option value="B">Buffaloes (Orix)</option>
                                        <option value="E">Eagles (Rakuten)</option>
                                        <option value="L">Lions (Seibu)</option>
                                    </optgroup>
                                    <optgroup label="National">
                                        <option value="JPN">Samurai Japan</option>
                                        <option value="USA">Team USA</option>
                                        <option value="DOM">Dominican Rep</option>
                                        <option value="VEN">Venezuela</option>
                                        <option value="PUR">Puerto Rico</option>
                                        <option value="MEX">Mexico</option>
                                        <option value="CUB">Cuba</option>
                                        <option value="CAN">Canada</option>
                                        <option value="KOR">Korea</option>
                                        <option value="TPE">Chinese Taipei</option>
                                        <option value="NLD">Netherlands</option>
                                        <option value="ITA">Italy</option>
                                        <option value="AUS">Australia</option>
                                        <option value="PAN">Panama</option>
                                        <option value="COL">Colombia</option>
                                        <option value="GBR">Great Britain</option>
                                        <option value="CZE">Czech Republic</option>
                                        <option value="ISR">Israel</option>
                                        <option value="CHN">China</option>
                                        <option value="Other">Other</option>
                                    </optgroup>
                                </select>
                                <input name="scoreVisitor" type="number" min="0" placeholder="0" className="w-16 bg-black/50 border border-white/20 rounded px-2 py-1 text-white text-center focus:border-[#FFD700]" />
                            </div>

                            {/* Home */}
                            <div className="flex gap-2">
                                <select name="teamHome" required className="flex-1 bg-black/50 border border-white/20 rounded px-2 py-1 text-white text-sm focus:border-[#FFD700]">
                                    <option value="">Home Team</option>
                                    <optgroup label="MLB">
                                        <option value="LAD">LAD (Dodgers)</option>
                                        <option value="NYY">NYY (Yankees)</option>
                                        <option value="SD">SD (Padres)</option>
                                        <option value="HOU">HOU (Astros)</option>
                                        <option value="ATL">ATL (Braves)</option>
                                        <option value="PHI">PHI (Phillies)</option>
                                        <option value="NYM">NYM (Mets)</option>
                                        <option value="BOS">BOS (Red Sox)</option>
                                        <option value="LAA">LAA (Angels)</option>
                                        <option value="CHC">CHC (Cubs)</option>
                                        <option value="TOR">TOR (Blue Jays)</option>
                                    </optgroup>
                                    <optgroup label="NPB Central">
                                        <option value="YG">Giants (Kyojin)</option>
                                        <option value="T">Tigers (Hanshin)</option>
                                        <option value="DB">BayStars (DeNA)</option>
                                        <option value="C">Carp (Hiroshima)</option>
                                        <option value="D">Dragons (Chunichi)</option>
                                        <option value="S">Swallows (Yakult)</option>
                                    </optgroup>
                                    <optgroup label="NPB Pacific">
                                        <option value="H">Hawks (SoftBank)</option>
                                        <option value="F">Fighters (Nippon-Ham)</option>
                                        <option value="M">Marines (Lotte)</option>
                                        <option value="B">Buffaloes (Orix)</option>
                                        <option value="E">Eagles (Rakuten)</option>
                                        <option value="L">Lions (Seibu)</option>
                                    </optgroup>
                                    <optgroup label="National">
                                        <option value="JPN">Samurai Japan</option>
                                        <option value="USA">Team USA</option>
                                        <option value="DOM">Dominican Rep</option>
                                        <option value="VEN">Venezuela</option>
                                        <option value="PUR">Puerto Rico</option>
                                        <option value="MEX">Mexico</option>
                                        <option value="CUB">Cuba</option>
                                        <option value="CAN">Canada</option>
                                        <option value="KOR">Korea</option>
                                        <option value="TPE">Chinese Taipei</option>
                                        <option value="NLD">Netherlands</option>
                                        <option value="ITA">Italy</option>
                                        <option value="AUS">Australia</option>
                                        <option value="PAN">Panama</option>
                                        <option value="COL">Colombia</option>
                                        <option value="GBR">Great Britain</option>
                                        <option value="CZE">Czech Republic</option>
                                        <option value="ISR">Israel</option>
                                        <option value="CHN">China</option>
                                        <option value="Other">Other</option>
                                    </optgroup>
                                </select>
                                <input name="scoreHome" type="number" min="0" placeholder="0" className="w-16 bg-black/50 border border-white/20 rounded px-2 py-1 text-white text-center focus:border-[#FFD700]" />
                            </div>

                            {/* Progress */}
                            <div>
                                <select name="progress" className="w-full bg-black/50 border border-white/20 rounded px-2 py-1 text-white text-sm focus:border-[#FFD700]">
                                    <option value="Top 1st">Top 1st (1回表)</option>
                                    <option value="Bot 1st">Bot 1st (1回裏)</option>
                                    <option value="Top 2nd">Top 2nd (2回表)</option>
                                    <option value="Bot 2nd">Bot 2nd (2回裏)</option>
                                    <option value="Top 3rd">Top 3rd (3回表)</option>
                                    <option value="Bot 3rd">Bot 3rd (3回裏)</option>
                                    <option value="Top 4th">Top 4th (4回表)</option>
                                    <option value="Bot 4th">Bot 4th (4回裏)</option>
                                    <option value="Top 5th">Top 5th (5回表)</option>
                                    <option value="Bot 5th">Bot 5th (5回裏)</option>
                                    <option value="Top 6th">Top 6th (6回表)</option>
                                    <option value="Bot 6th">Bot 6th (6回裏)</option>
                                    <option value="Top 7th">Top 7th (7回表)</option>
                                    <option value="Bot 7th">Bot 7th (7回裏)</option>
                                    <option value="Top 8th">Top 8th (8回表)</option>
                                    <option value="Bot 8th">Bot 8th (8回裏)</option>
                                    <option value="Top 9th">Top 9th (9回表)</option>
                                    <option value="Bot 9th">Bot 9th (9回裏)</option>
                                    <option value="Final">Final (試合終了)</option>
                                </select>
                            </div>
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
                            <textarea name="description" rows={5} className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-white focus:border-[#FFD700] outline-none" placeholder="Context details..." />
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
                                    {m.match_result && (
                                        <div className="text-xs text-gray-400 mt-0.5">
                                            {m.match_result}
                                            {m.is_finalized && <span className="ml-2 text-green-400 font-bold">✓ FINAL</span>}
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-500 mt-1">{new Date(m.created_at).toLocaleString()}</div>

                                    {/* Finalize Form for Pending Moments */}
                                    {!m.is_finalized && (
                                        <form action={finalizeMoment.bind(null, m.id)} className="mt-3 flex items-center gap-2">
                                            <input
                                                name="finalScore"
                                                required
                                                placeholder="Final Score (e.g. 5-3)"
                                                defaultValue={m.match_result || ''}
                                                className="bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white w-32 focus:border-[#FFD700] outline-none"
                                            />
                                            <button type="submit" className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-3 py-1 rounded transition-colors">
                                                Finalize
                                            </button>
                                        </form>
                                    )}
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
