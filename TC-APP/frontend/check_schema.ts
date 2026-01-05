import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl!, supabaseKey!);

async function debug() {
    // 1. Check orders table columns
    const { data: orderSample } = await supabaseAdmin.from('orders').select('*').limit(1).single();
    console.log('--- Orders Table Columns ---');
    console.log(Object.keys(orderSample || {}));

    // 2. Check listing_items table columns
    const { data: itemSample } = await supabaseAdmin.from('listing_items').select('*').limit(1).single();
    console.log('\n--- Listing Items Table Columns ---');
    console.log(Object.keys(itemSample || {}));
}

debug();
