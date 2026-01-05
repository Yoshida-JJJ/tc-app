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

    console.log('--- Item 8e8eb573 Details ---');
    console.log(`Player: ${item.player_name}`);
    console.log(`Description: ${item.description}`);
    console.log(`Price: ${item.price}`);
    console.log(`OriginOrder: ${item.origin_order_id}`);
}

debug();
