
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function debugOrder() {
    const orderId = '7575e260-6772-487b-83ea-e140e09c680a';
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
        // 2. Check for Pinpoint Item (origin_order_id)
        const { data: pinItems, error: pinError } = await supabase
            .from('listing_items')
            .select('id, origin_order_id, status, seller_id')
            .eq('origin_order_id', orderId);

        if (pinError) console.error('❌ Pinpoint Query Error:', pinError);
        console.log('Pinpoint Items found:', pinItems);

        // 3. Check for Fuzzy/Recent items for this buyer
        const { data: fuzzyItems } = await supabase
            .from('listing_items')
            .select('id, player_name, created_at, origin_order_id')
            .eq('seller_id', order.buyer_id)
            .order('created_at', { ascending: false })
            .limit(3);

        console.log('Recent Items for Buyer:', fuzzyItems);
    }
}

debugOrder();
