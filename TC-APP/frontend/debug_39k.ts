import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl!, supabaseKey!);

async function debug() {
    const buyerId = '868187c0-f34f-47c7-9449-bc829a212cff'; // buyer2

    // 1. Find the order
    const { data: orders } = await supabaseAdmin
        .from('orders')
        .select('*, listing:listing_items!listing_id(*)')
        .eq('buyer_id', buyerId)
        .order('created_at', { ascending: false });

    console.log('--- Orders for Buyer2 ---');
    orders?.forEach(o => {
        const listing = Array.isArray(o.listing) ? o.listing[0] : o.listing;
        console.log(`ID: ${o.id}, Status: ${o.status}, Price: ${listing?.price}, Player: ${listing?.player_name}`);
    });

    const specificOrder = orders?.find(o => {
        const listing = Array.isArray(o.listing) ? o.listing[0] : o.listing;
        return listing?.price === 39000 && listing?.player_name?.includes('Roki');
    });

    if (specificOrder) {
        console.log('\n--- Found 39k Order ---');
        console.log(specificOrder);

        // 2. Check for clones
        const { data: items } = await supabaseAdmin
            .from('listing_items')
            .select('*')
            .eq('origin_order_id', specificOrder.id);
        
        console.log('\n--- Cloned Items ---');
        console.log(items);

        // 3. Try to RUN getBuyerItemByOrder via script to see error
        console.log('\n--- Triggering getBuyerItemByOrder ---');
        // I'll import it dynamically or just use direct logic to see what happens
        const { getBuyerItemByOrder } = await import('./app/actions/item');
        try {
            const result = await getBuyerItemByOrder(specificOrder.id);
            console.log('Recovery Result:', result);
        } catch (e) {
            console.error('Recovery Error:', e);
        }
    } else {
        console.log('Order not found.');
    }
}

debug();
