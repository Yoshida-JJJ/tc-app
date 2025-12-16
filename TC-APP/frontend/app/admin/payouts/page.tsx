import { createClient } from '@supabase/supabase-js';
import { approvePayout } from '@/app/actions/admin';
import PayoutRow from './PayoutRow';

// Admin Client
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminPayoutsPage() {
    // Join logic is tricky with Supabase JS client basic syntax.
    // We fetch payouts and then manually join profiles/bank accounts or use foreign key query syntax.
    // 'payouts' has 'user_id'. 
    // We need bank acocunt info. 'bank_accounts' is 1:1 with user usually.

    // Fetch payouts
    const { data: payoutsRaw, error } = await supabaseAdmin
        .from('payouts')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Payout Fetch Error:", error);
    }

    // Manual Join to avoid Relation constraints with auth.users
    const payouts = payoutsRaw || [];
    const userIds = Array.from(new Set(payouts.map((p: any) => p.user_id)));

    let profilesMap: Record<string, any> = {};
    let banksMap: Record<string, any> = {};

    if (userIds.length > 0) {
        const { data: profiles } = await supabaseAdmin
            .from('profiles')
            .select('id, email, name')
            .in('id', userIds);

        const { data: banks } = await supabaseAdmin
            .from('bank_accounts')
            .select('*')
            .in('user_id', userIds);

        profiles?.forEach((p: any) => profilesMap[p.id] = p);
        banks?.forEach((b: any) => banksMap[b.user_id] = b);
    }


    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Payout Manager</h2>

            <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-gray-400 uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Bank Details</th>
                            <th className="px-6 py-4 text-right">Amount (Yen)</th>
                            <th className="px-6 py-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 bg-black/20">
                        {payouts.map((p: any) => {
                            // Determine fee logic (Display only, assume DB amount is net or gross? p.amount usually is requested amount)
                            // We should probably display it clearly.
                            // For simplicity, just listing raw data.

                            // Bank account might be an array if using foreign key linking with 'user_id' which is not FK on bank_accounts directly?
                            // Wait, bank_accounts.user_id references auth.users. Payouts.user_id references auth.users.
                            // Supabase Query: `bank_accounts:user_id` might return array because it thinks it's 1:N unless unique constraint is clear.
                            // The schema says `bank_accounts_user_id_key UNIQUE`, so it should be single object or array of 1.

                            const bank = banksMap[p.user_id];
                            const profile = profilesMap[p.user_id];

                            return (
                                <PayoutRow key={p.id} payout={p} profile={profile} bank={bank} />
                            );
                        })}
                        {payouts?.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    No pending payouts.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
