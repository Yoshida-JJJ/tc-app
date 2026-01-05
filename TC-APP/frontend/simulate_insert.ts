import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl!, supabaseKey!);

async function simulate() {
    const orderId = '54ad7353-f758-4c9e-b115-773e59efe203';
    const buyerId = '868187c0-f34f-47c7-9449-bc829a212cff';
    const listingId = '642e6fda-9b31-4024-a97b-e2bb85cd0336';

    const { data: listing } = await supabaseAdmin.from('listing_items').select('*').eq('id', listingId).single();
    if (!listing) return;

    console.log('Inserting clone for 15k Sasaki...');
    const { data, error } = await supabaseAdmin
        .from('listing_items')
        .insert({
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
            status: 'Incoming',
            price: 0,
            origin_order_id: orderId,
            moment_history: listing.moment_history || []
        })
        .select('id')
        .single();
    
    if (error) {
        console.error('SIMULATED INSERT FAILED:', error);
    } else {
        console.log('SIMULATED INSERT SUCCESS:', data);
    }
}

simulate();
