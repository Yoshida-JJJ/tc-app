import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl!, supabaseKey!);

async function debug() {
    const orderId = 'd7bf11cc-54a4-4888-a8e8-dcddbf8d81d4';
    const { data: items } = await supabaseAdmin
        .from('listing_items')
        .select('*')
        .eq('origin_order_id', orderId);

    console.log(`--- Items for Order ${orderId} ---`);
    if (items && items.length > 0) {
        items.forEach(item => {
            console.log(`ID: ${item.id}, Status: ${item.status}, SellerID: ${item.seller_id}`);
        });
    } else {
        console.log('None found.');
    }
}

debug();
