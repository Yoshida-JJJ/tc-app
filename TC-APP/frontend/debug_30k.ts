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
        return listing?.price === 30000 && listing?.player_name?.includes('Sasaki');
    });

    if (specificOrder) {
        console.log('\n--- Found 30k Order ---');
        console.log('Order Status:', specificOrder.status);

        // 2. Check for clones
        const { data: items } = await supabaseAdmin
            .from('listing_items')
            .select('*')
            .eq('origin_order_id', specificOrder.id);
        
        console.log('\n--- Cloned Items ---');
        items?.forEach(item => {
            console.log(`Item ID: ${item.id}, Status: ${item.status}, CreatedAt: ${item.created_at}`);
        });
    } else {
        console.log('\n30k Sasaki order not found.');
    }
}

debug();
