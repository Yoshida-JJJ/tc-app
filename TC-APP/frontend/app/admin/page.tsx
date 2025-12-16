import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Need admin client for global stats if RLS restricts (e.g. counting total users)
const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminDashboard() {
    // 1. Total Users
    const { count: userCount } = await supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    // 2. Active Listings
    const { count: listingCount } = await supabaseAdmin
        .from('listing_items')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Active');

    // 3. Pending Payouts
    const { count: payoutCount } = await supabaseAdmin
        .from('payouts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* KPI Card 1 */}
                <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                    <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Users</h3>
                    <p className="text-4xl font-mono font-bold text-white mt-2">{userCount ?? '-'}</p>
                </div>

                {/* KPI Card 2 */}
                <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                    <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Active Listings</h3>
                    <p className="text-4xl font-mono font-bold text-[#FFD700] mt-2">{listingCount ?? '-'}</p>
                </div>

                {/* KPI Card 3 */}
                <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                    <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Pending Payouts</h3>
                    <p className="text-4xl font-mono font-bold text-red-500 mt-2">{payoutCount ?? '-'}</p>
                </div>
            </div>
        </div>
    );
}
