
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function debugOrder() {
    const orderId = '14fb9a60-8492-4969-893b-2e8c1668b48c';
    console.log(`Debug Order: ${orderId}`);

    // 1. Fetch Order and check Relation
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*, listing:listing_items!listing_id(*)')
        .eq('id', orderId)
        .single();

    if (orderError) console.error('❌ Order Fetch Error:', orderError);
    else console.log(`✅ Order Found. Status: ${order.status}, Buyer: ${order.buyer_id}`);

    if (order) {
        console.log('Listing Data:', order.listing ? 'Found' : 'MISSING');
        if (order.listing) {
            const l = Array.isArray(order.listing) ? order.listing[0] : order.listing;
            console.log(`Listing ID: ${l.id}, Player: ${l.player_name}`);
        }

        // 2. Check for Pinpoint Item
        const { data: pinItems } = await supabase
            .from('listing_items')
            .select('*')
            .eq('origin_order_id', orderId);

        console.log(`Pinpoint Items found: ${pinItems?.length}`);
    }
}

debugOrder();
