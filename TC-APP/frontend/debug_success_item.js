const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugSuccessItem() {
    console.log("--- Scanning Recent Orders (Large) ---");
    const { data: orders, error: orderErr } = await supabase
        .from('orders')
        .select('id, listing_id, buyer_id, created_at, status')
        .order('created_at', { ascending: false })
        .limit(20);

    if (orderErr) {
        console.error("Order Fetch Error:", orderErr);
        return;
    }

    for (const order of orders) {
        // Fetch original listing
        const { data: original } = await supabase
            .from('listing_items')
            .select('id, player_name, series_name, seller_id')
            .eq('id', order.listing_id)
            .single();

        if (!original) continue;
        if (!original.player_name.includes("山本")) continue; // Focus on Yamamoto for now

        console.log(`\nOrder: ${order.id}`);
        console.log(`Status: ${order.status} | Buyer: ${order.buyer_id} | Created: ${order.created_at}`);
        console.log(`Original Card: ${original.player_name} (${original.series_name}) | Seller: ${original.seller_id}`);

        // Look for current buyer's items
        const { data: buyerItems } = await supabase
            .from('listing_items')
            .select('id, seller_id, player_name, series_name, created_at')
            .eq('seller_id', order.buyer_id)
            .order('created_at', { ascending: false })
            .limit(20);

        console.log(`Buyer Items Found: ${buyerItems?.length || 0}`);
        if (buyerItems) {
            buyerItems.forEach(item => {
                const match = item.player_name?.trim() === original.player_name?.trim() &&
                    item.series_name?.trim() === original.series_name?.trim();
                console.log(` - [${match ? 'MATCH' : ' '} ] ${item.id} | ${item.player_name} | ${item.created_at}`);
            });
        }
    }
}

debugSuccessItem();
