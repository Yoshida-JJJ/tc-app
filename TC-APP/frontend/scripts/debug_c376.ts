
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function debugOrder() {
    const orderId = 'c376ca76-cd87-47af-93ed-2ab0f7dd7a86';
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
        // Log Listing Details
        const listing = Array.isArray(order.listing) ? order.listing[0] : order.listing;
        if (listing) {
            console.log(`Original Listing: ${listing.id}, Status: ${listing.status}`);
        } else {
            console.log('❌ Original Listing MISSING or null');
        }

        // 2. Check for Pinpoint Item
        const { data: pinItems, error } = await supabase
            .from('listing_items')
            .select('id, origin_order_id, seller_id, status, deleted_at')
            .eq('origin_order_id', orderId);

        if (error) console.error("Query Error:", error);

        console.log(`Pinpoint Items found: ${pinItems?.length}`);
        if (pinItems && pinItems.length > 0) {
            pinItems.forEach(i => {
                console.log(`Item: ${i.id}, Seller: ${i.seller_id}, Origin: ${i.origin_order_id}, Status: ${i.status}`);
                console.log(`Match? Seller=${order.buyer_id === i.seller_id}, Origin=${orderId === i.origin_order_id}`);
            });
        }
    }
}

debugOrder();
