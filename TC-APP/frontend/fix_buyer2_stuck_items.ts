import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl!, supabaseKey!);

async function fix() {
    const buyerId = '868187c0-f34f-47c7-9449-bc829a212cff'; // buyer2

    // 1. Find items owned by buyer2 that have an origin_order_id and are 'Draft'
    const { data: items } = await supabaseAdmin
        .from('listing_items')
        .select('*, orders!origin_order_id(status)')
        .eq('seller_id', buyerId)
        .eq('status', 'Draft')
        .not('origin_order_id', 'is', null);

    console.log(`Checking ${items?.length} potential stuck items...`);

    for (const item of (items || [])) {
        const order = Array.isArray(item.orders) ? item.orders[0] : item.orders;
        if (order && order.status !== 'completed') {
            console.log(`Item ${item.id} (${item.player_name}) is Draft but Order ${item.origin_order_id} is ${order.status}. Moving to AwaitingShipment...`);
            await supabaseAdmin
                .from('listing_items')
                .update({ status: 'AwaitingShipment' })
                .eq('id', item.id);
        }
    }
}

fix();
