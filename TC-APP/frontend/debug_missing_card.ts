import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function debug() {
    // 1. Find buyer2
    const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, display_name, email')
        .eq('email', 'buyer2@test.com');
    
    console.log('--- Profiles found ---');
    console.log(profiles);

    if (!profiles || profiles.length === 0) {
        console.log('Buyer not found.');
        return;
    }

    const buyerId = profiles[0].id;

    // 2. Find relevant orders
    const { data: orders } = await supabaseAdmin
        .from('orders')
        .select('*, listing:listing_items!listing_id(*)')
        .eq('buyer_id', buyerId)
        .order('created_at', { ascending: false });

    console.log('\n--- Recent Orders for Buyer ---');
    orders?.forEach(o => {
        const listing = Array.isArray(o.listing) ? o.listing[0] : o.listing;
        console.log(`Order ID: ${o.id}, Status: ${o.status}, Price: ${listing?.price}, Player: ${listing?.player_name}`);
    });

    const specificOrder = orders?.find(o => {
      const listing = Array.isArray(o.listing) ? o.listing[0] : o.listing;
      return listing?.player_name?.includes('Ohtani') && listing?.price === 3444;
    });

    if (specificOrder) {
        console.log('\n--- Found Specific Order ---');
        console.log(specificOrder);

        // 3. Find Cloned Item
        const { data: items } = await supabaseAdmin
            .from('listing_items')
            .select('*')
            .eq('origin_order_id', specificOrder.id);
        
        console.log('\n--- Cloned Items for this Order ---');
        console.log(items);

        // 4. Find ANY items owned by this buyer with status Incoming or Draft
        const { data: allItems } = await supabaseAdmin
            .from('listing_items')
            .select('id, player_name, status, origin_order_id')
            .eq('seller_id', buyerId)
            .is('deleted_at', null);
        
        console.log('\n--- All Active Items for Buyer ---');
        console.log(allItems);
    } else {
        console.log('Specific Ohtani order not found.');
    }
}

debug();
