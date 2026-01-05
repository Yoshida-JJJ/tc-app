import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl!, supabaseKey!);

async function verify() {
    const buyerId = '868187c0-f34f-47c7-9449-bc829a212cff'; // buyer2

    const { data: items } = await supabaseAdmin
        .from('listing_items')
        .select('*, origin_order:orders!origin_order_id(status)')
        .eq('seller_id', buyerId);

    console.log('--- Buyer 2 Items ---');
    items?.forEach(item => {
        const order = Array.isArray(item.origin_order) ? item.origin_order[0] : item.origin_order;
        const willShowInWorkspace = ['Active', 'Display', 'Draft'].includes(item.status) && (!item.origin_order_id || order?.status === 'completed');
        
        console.log(`ID: ${item.id.substring(0,8)} | Player: ${item.player_name.padEnd(15)} | Status: ${item.status.padEnd(15)} | OrderStatus: ${(order?.status || 'N/A').padEnd(10)} | Visible: ${willShowInWorkspace}`);
    });
}

verify();
