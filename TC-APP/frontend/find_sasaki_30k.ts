import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl!, supabaseKey!);

async function debug() {
    const buyerId = '868187c0-f34f-47c7-9449-bc829a212cff'; // buyer2

    const { data: items } = await supabaseAdmin
        .from('listing_items')
        .select('*, orders:orders!origin_order_id(*)')
        .eq('seller_id', buyerId)
        .ilike('player_name', '%Sasaki%');

    console.log('--- Sasaki Items for Buyer2 ---');
    items?.forEach(item => {
        const order = Array.isArray(item.orders) ? item.orders[0] : item.orders;
        console.log(`ID: ${item.id}, Status: ${item.status}, Price: ${item.price}, OriginOrder: ${item.origin_order_id}, OrderStatus: ${order?.status}`);
    });
}

debug();
