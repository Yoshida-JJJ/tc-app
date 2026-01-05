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
        .select('*')
        .ilike('player_name', '%Sasaki%')
        .eq('price', 30000);

    console.log('--- 30k Sasaki Cards found in DB ---');
    items?.forEach(item => {
        console.log(`ID: ${item.id}, Status: ${item.status}, SellerID: ${item.seller_id}, Deletion: ${item.deleted_at}`);
    });

}

debug();
