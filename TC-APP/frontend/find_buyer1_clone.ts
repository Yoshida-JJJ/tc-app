import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl!, supabaseKey!);

async function debug() {
    const orderId = '1e449fd3-d389-4481-aa47-01e64b7d66a8';
    const { data: item } = await supabaseAdmin.from('listing_items').select('*').eq('origin_order_id', orderId).single();
    if (item) {
        console.log('--- Buyer 1 Clone ---');
        console.log(JSON.stringify(item, null, 2));
    } else {
        console.log('Buyer 1 clone not found.');
    }
}

debug();
