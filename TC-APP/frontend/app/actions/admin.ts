'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Admin Client (Bypass RLS)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function createLiveMoment(formData: FormData) {
    const playerName = formData.get('playerName') as string;
    const title = formData.get('title') as string;
    const type = formData.get('type') as string;
    const intensity = parseInt(formData.get('intensity') as string);
    const description = formData.get('description') as string;

    if (!playerName || !title || !type) {
        throw new Error('Missing required fields');
    }

    const { error } = await supabaseAdmin
        .from('live_moments')
        .insert({
            player_name: playerName,
            title,
            type,
            intensity,
            description
        });

    if (error) throw new Error(error.message);

    revalidatePath('/admin/moments');
}

export async function approvePayout(payoutId: string) {
    // 1. Mark Payout as Paid
    const { error } = await supabaseAdmin
        .from('payouts')
        .update({
            status: 'paid',
            processed_at: new Date().toISOString()
        })
        .eq('id', payoutId);

    if (error) throw new Error(error.message);

    revalidatePath('/admin/payouts');
    revalidatePath('/admin'); // KPI update
}
