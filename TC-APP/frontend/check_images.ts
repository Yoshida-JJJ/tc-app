import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl!, supabaseKey!);

async function debug() {
    const { data: items } = await supabaseAdmin
        .from('listing_items')
        .select('id, player_name, price, images, origin_order_id')
        .ilike('player_name', '%Sasaki%');

    console.log('--- Sasaki Item Images ---');
    items?.forEach(item => {
        console.log(`ID: ${item.id}, Price: ${item.price}, Order: ${item.origin_order_id}, Image: ${item.images?.[0]?.substring(0, 50)}...`);
    });
}

debug();
