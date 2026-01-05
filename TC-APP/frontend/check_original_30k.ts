import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl!, supabaseKey!);

async function debug() {
    const listingId = '2dc382b1-881d-4c95-b228-8687c39d1548';
    const { data: listing } = await supabaseAdmin
        .from('listing_items')
        .select('*')
        .eq('id', listingId)
        .single();

    console.log('--- Original 30k Listing ---');
    console.log(JSON.stringify(listing, null, 2));

    // Try to SIMULATE CLONING
    const orderId = 'd7bf11cc-54a4-4888-a8e8-dcddbf8d81d4';
    const buyerId = '868187c0-f34f-47c7-9449-bc829a212cff';

    const clonePayload = {
            player_name: listing.player_name,
            team: listing.team,
            year: listing.year,
            manufacturer: listing.manufacturer,
            series_name: listing.series_name,
            card_number: listing.card_number,
            images: listing.images,
            condition_grading: listing.condition_grading,
            condition_rating: listing.condition_rating,
            variation: listing.variation,
            serial_number: listing.serial_number,
            is_rookie: listing.is_rookie,
            is_autograph: listing.is_autograph,
            description: listing.description,
            is_live_moment: listing.is_live_moment,
            seller_id: buyerId,
            status: 'AwaitingShipment', // My new fallback
            price: 0,
            origin_order_id: orderId,
            moment_history: listing.moment_history || []
    };

    console.log('\n--- Simulating Insert ---');
    const { data: cloned, error: cloneError } = await supabaseAdmin
        .from('listing_items')
        .insert(clonePayload)
        .select('id')
        .single();

    if (cloneError) {
        console.error('INSERT FAILED:', cloneError.message, cloneError.code);
    } else {
        console.log('INSERT SUCCESS:', cloned.id);
    }
}

debug();
