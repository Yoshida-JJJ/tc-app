import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function recover() {
    const orderId = '747bf8d6-0889-47f5-90ef-c890542ce115';
    const buyerId = '868187c0-f34f-47c7-9449-bc829a212cff';
    const listingId = 'b0f042cd-a95e-4008-9814-31c9fdfa5c62';

    console.log('--- Starting Manual Recovery ---');

    // 1. Get original listing
    const { data: listing, error: lError } = await supabaseAdmin
        .from('listing_items')
        .select('*')
        .eq('id', listingId)
        .single();
    
    if (lError || !listing) {
        console.error('Error fetching listing:', lError);
        return;
    }

    // 2. Insert clone
    const { data: recovered, error: rError } = await supabaseAdmin
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
            status: 'Draft', // Order is completed
            price: 0,
            origin_order_id: orderId,
            moment_history: listing.moment_history || []
        })
        .select('*')
        .single();
    
    if (rError) {
        console.error('Error inserting clone:', rError);
    } else {
        console.log('--- Successfully Recovered Item ---');
        console.log(recovered);
    }
}

recover();
