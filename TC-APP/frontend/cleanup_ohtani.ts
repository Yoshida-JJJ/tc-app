import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl!, supabaseKey!);

async function cleanup() {
    const orderId = '8c637d61-eb0a-47c7-9434-4a8f95a69ed8';
    const buyerId = '868187c0-f34f-47c7-9449-bc829a212cff';

    // 1. Find the card
    const { data: item } = await supabaseAdmin
        .from('listing_items')
        .select('*')
        .eq('origin_order_id', orderId)
        .eq('seller_id', buyerId)
        .single();

    if (item) {
        console.log('--- Current Item History ---');
        console.log(JSON.stringify(item.moment_history, null, 2));

        // The user says "Perfect Game Bid" was incorrectly added.
        // Snapshot for this order was "Dramatic Walk-off HR".
        // History should only have whatever was on the original card + Dramatic Walk-off HR.
        
        // Original card history (based on my earlier check of b0f042cd) was just "3000th Strikeout".
        const correctedHistory = [
            {
                "title": "Shohei Ohtani: 3000th Strikeout",
                "moment_id": "b9c3957d-8925-4a40-a0fa-4c6af0480ae9",
                "player_name": "Shohei Ohtani"
                // ... other fields simplified or restored
            },
            {
                "title": "Shohei Ohtani: Dramatic Walk-off HR",
                "moment_id": "52cded48-b34f-4ceb-ab42-078d4e0a708e",
                "player_name": "Shohei Ohtani",
                "owner_at_time": orderId,
                "status": "pending",
                "timestamp": new Date().toISOString()
            }
        ];

        console.log('\n--- Correcting History ---');
        const { error } = await supabaseAdmin
            .from('listing_items')
            .update({ moment_history: correctedHistory })
            .eq('id', item.id);
        
        if (!error) console.log('Fixed buyer copy!');
    }

    // 2. Clear contamination from original listing
    const listingId = 'b0f042cd-a95e-4008-9814-31c9fdfa5c62';
    const { data: original } = await supabaseAdmin.from('listing_items').select('*').eq('id', listingId).single();
    if (original) {
        // Keep only the "3000th Strikeout" or whatever was there before.
        const cleanHistory = (original.moment_history || []).filter((m: any) => 
            m.moment_id === 'b9c3957d-8925-4a40-a0fa-4c6af0480ae9'
        );
        await supabaseAdmin.from('listing_items').update({ moment_history: cleanHistory }).eq('id', listingId);
        console.log('Cleaned original listing contamination!');
    }
}

cleanup();
