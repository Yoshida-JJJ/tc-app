
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
    console.log('--- FETCHING LATEST ORDERS for Roki Sasaki ---');
    const { data: orders } = await supabase
        .from('orders')
        .select('*, listing:listing_items!listing_id(*)')
        .order('created_at', { ascending: false })
        .limit(5);

    for (const order of (orders || [])) {
        const listing = Array.isArray(order.listing) ? order.listing[0] : order.listing;
        if (!listing || !listing.player_name.includes('Roki')) continue;

        console.log(`\nOrder ID: ${order.id}`);
        console.log(`Order Moment Snapshot: ${order.moment_snapshot?.title} (ID: ${order.moment_snapshot?.id})`);

        if (listing) {
            console.log(`Original Listing: ${listing.id}`);
            console.log('Original History:');
            listing.moment_history?.forEach((h: any, idx: number) => {
                console.log(`  [${idx}] ${h.title} (MomentID: ${h.moment_id})`);
            });
        }

        // Check Buyer Clone
        const { data: buyerItem } = await supabase
            .from('listing_items')
            .select('id, moment_history, seller_id')
            .eq('origin_order_id', order.id)
            .single();

        if (buyerItem) {
            console.log(`Buyer Clone Found: ${buyerItem.id}`);
            console.log('Moment History:');
            buyerItem.moment_history?.forEach((h: any, idx: number) => {
                console.log(`  [${idx}] ${h.title} (MomentID: ${h.moment_id}) - Author: ${h.owner_at_time}`);
            });
        } else {
            console.log('Buyer Clone MISSING');
        }
    }
}
check();
