import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl!, supabaseKey!);

async function debug() {
    const itemId = '8e8eb573-060b-44e6-8436-e8008c9db422';
    const { data: item } = await supabaseAdmin
        .from('listing_items')
        .select('*')
        .eq('id', itemId)
        .single();

    console.log('--- Item 8e8eb573 History ---');
    console.log(JSON.stringify(item.moment_history, null, 2));

    const orderId30k = 'd7bf11cc-54a4-4888-a8e8-dcddbf8d81d4';
    const has30k = item.moment_history?.some((m: any) => m.owner_at_time === orderId30k);
    console.log(`\nContains 30k Order ID: ${has30k}`);

    // Try to find the 30k order details
    const { data: order30k } = await supabaseAdmin
        .from('orders')
        .select('*, listing:listing_items!listing_id(*)')
        .eq('id', orderId30k)
        .single();
    
    console.log('\n--- 30k Order Details ---');
    console.log(`Status: ${order30k?.status}`);
    console.log(`ListingID: ${order30k?.listing_id}`);
}

debug();
