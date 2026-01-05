import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl!, supabaseKey!);

async function debug() {
    const listingId = 'b0f042cd-a95e-4008-9814-31c9fdfa5c62';
    const buyerId = '868187c0-f34f-47c7-9449-bc829a212cff';

    const { data: listing } = await supabaseAdmin.from('listing_items').select('*').eq('id', listingId).single();
    console.log('--- Original Listing ---');
    console.log(JSON.stringify(listing?.moment_history, null, 2));

    const { data: clones } = await supabaseAdmin.from('listing_items').select('*').eq('origin_order_id', '8c637d61-eb0a-47c7-9434-4a8f95a69ed8');
    console.log('\n--- Direct Clones ---');
    console.log(JSON.stringify(clones?.map(c => ({ id: c.id, history: c.moment_history })), null, 2));

    const { data: allBuyerOhtani } = await supabaseAdmin.from('listing_items').select('*').eq('seller_id', buyerId).ilike('player_name', '%Ohtani%');
    console.log('\n--- All Buyer Ohtani Cards ---');
    console.log(JSON.stringify(allBuyerOhtani?.map(c => ({ id: c.id, price: c.price, history: c.moment_history })), null, 2));
}

debug();
