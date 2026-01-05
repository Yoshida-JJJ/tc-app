import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl!, supabaseKey!);

async function debug() {
    const { data: orders } = await supabaseAdmin
        .from('orders')
        .select('*, listing:listing_items!listing_id(price, player_name)')
        .eq('buyer_id', '868187c0-f34f-47c7-9449-bc829a212cff');

    console.log('--- Orders for Buyer 2 ---');
    orders?.forEach(o => {
        const listing = Array.isArray(o.listing) ? o.listing[0] : o.listing;
        console.log(`Order: ${o.id} | Status: ${o.status} | Price: ${listing?.price} | Player: ${listing?.player_name}`);
    });
}

debug();
