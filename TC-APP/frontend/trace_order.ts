import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl!, supabaseKey!);

async function debug() {
    const orderId = '1e449fd3-d389-4481-aa47-01e64b7d66a8';
    const { data: order } = await supabaseAdmin.from('orders').select('*, listing:listing_items!listing_id(*)').eq('id', orderId).single();
    console.log('--- Traced Order ---');
    console.log(JSON.stringify(order, null, 2));

    const { data: profiles } = await supabaseAdmin.from('profiles').select('*').eq('id', order?.buyer_id);
    console.log('\n--- Order Buyer ---');
    console.log(profiles);
}

debug();
