import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl!, supabaseKey!);

async function fix() {
    const buyerId = '868187c0-f34f-47c7-9449-bc829a212cff';
    const { data: items } = await supabaseAdmin.from('listing_items').select('*').eq('seller_id', buyerId);
    
    for (const item of (items || [])) {
        if (item.player_name === 'Shohei Ohtani' && item.moment_history?.length > 1) {
            console.log(`Found Ohtani item ${item.id} with ${item.moment_history.length} moments.`);
            console.log('History:', JSON.stringify(item.moment_history, null, 2));

            // Remove "Perfect Game Bid" if it matches buyer1's order ID or is just extra
            const corrected = item.moment_history.filter((m: any) => 
                m.title !== 'Shohei Ohtani: Perfect Game Bid'
            );

            if (corrected.length !== item.moment_history.length) {
                console.log(`Correcting item ${item.id}...`);
                await supabaseAdmin.from('listing_items').update({ moment_history: corrected }).eq('id', item.id);
                console.log('DONE.');
            }
        }
    }
}

fix();
