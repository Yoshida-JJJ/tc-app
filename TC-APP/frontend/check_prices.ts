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
        .select('*')
        .eq('seller_id', buyerId);

    console.log('--- Items for Buyer2 ---');
    items?.forEach(item => {
        console.log(`ID: ${item.id}, Status: ${item.status}, Player: ${item.player_name}, Price: ${item.price}, OriginOrder: ${item.origin_order_id}`);
    });
}

debug();
