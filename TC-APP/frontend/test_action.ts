import { getBuyerItemByOrder } from './app/actions/item';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

// Emulate user context if possible, but the action uses createServerClient which might fail in script.
// I will instead create a script that emulates the logic inside the action with admin rights.

import { createClient } from '@supabase/supabase-js';
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function debug() {
    const orderId = 'd7bf11cc-54a4-4888-a8e8-dcddbf8d81d4'; // 30k Sasaki
    const userId = '868187c0-f34f-47c7-9449-bc829a212cff'; // buyer2

    // Logic from getBuyerItemByOrder
    const { data: order } = await supabaseAdmin
        .from('orders')
        .select('*, listing:listing_items!listing_id(*)')
        .eq('id', orderId)
        .single();

    if (!order) return console.log('Order not found');

    const listing = Array.isArray(order.listing) ? order.listing[0] : order.listing;
    
    // 3. Search for the buyer's copy using PINPOINT match
    const { data: pinpoint } = await supabaseAdmin
        .from('listing_items')
        .select('*')
        .eq('origin_order_id', orderId)
        .eq('seller_id', userId)
        .maybeSingle();

    console.log('Pinpoint Match:', pinpoint?.id);

    // 4. Fallback search (Fuzzy matching)
    if (!pinpoint) {
        const orderAt = new Date(order.created_at);
        const bufferTime = new Date(orderAt.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString();

        const { data: results } = await supabaseAdmin
            .from('listing_items')
            .select('*')
            .eq('seller_id', userId)
            .is('deleted_at', null)
            .not('status', 'in', '("Completed","Sold","Delivered")')
            .is('origin_order_id', null) // MY NEW FIX
            .gte('created_at', bufferTime);

        console.log('Fuzzy Match Results (with origin_order_id: null):', results?.length);

        // Try WITHOUT my fix to see what it would have done
        const { data: resultsOld } = await supabaseAdmin
            .from('listing_items')
            .select('*')
            .eq('seller_id', userId)
            .is('deleted_at', null)
            .not('status', 'in', '("Completed","Sold","Delivered")')
            .gte('created_at', bufferTime);
        
        console.log('Fuzzy Match Results (WITHOUT fix):', resultsOld?.length);
        resultsOld?.forEach(r => {
            if (r.images?.[0] === listing.images?.[0]) {
                console.log(`FOUND OLD MATCH: ${r.id} | OriginOrder: ${r.origin_order_id}`);
            }
        });
    }
}

debug();
