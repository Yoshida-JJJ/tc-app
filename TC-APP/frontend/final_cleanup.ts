import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl!, supabaseKey!);

async function cleanup() {
    const buyerId = '868187c0-f34f-47c7-9449-bc829a212cff'; // buyer2
    const orderId30k = 'd7bf11cc-54a4-4888-a8e8-dcddbf8d81d4';

    const { data: items } = await supabaseAdmin
        .from('listing_items')
        .select('*')
        .eq('seller_id', buyerId);

    for (const item of (items || [])) {
        if (!item.moment_history) continue;
        
        const originalCount = item.moment_history.length;
        const cleaned = item.moment_history.filter((m: any) => m.owner_at_time !== orderId30k);
        
        if (cleaned.length !== originalCount && item.id !== 'd670a908-a901-464d-bc3e-929bc04f3830') {
            console.log(`Cleaning item ${item.id} (${item.player_name})...`);
            await supabaseAdmin
                .from('listing_items')
                .update({ moment_history: cleaned })
                .eq('id', item.id);
        }
    }
}

cleanup();
