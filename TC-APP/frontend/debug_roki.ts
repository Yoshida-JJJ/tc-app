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

    // Check specific 15,000 order
    const missingOrder = orders?.find(o => {
      const listing = Array.isArray(o.listing) ? o.listing[0] : o.listing;
      return listing?.player_name?.includes('Roki') && listing?.price === 15000;
    });

    // Check successful 2,000 order
    const okOrder = orders?.find(o => {
      const listing = Array.isArray(o.listing) ? o.listing[0] : o.listing;
      return listing?.player_name?.includes('Roki') && listing?.price === 2000;
    });

    if (missingOrder) {
        console.log('\n--- Found Missing Order (15k) ---');
        console.log(missingOrder);
        const { data: items } = await supabaseAdmin.from('listing_items').select('*').eq('origin_order_id', missingOrder.id);
        console.log('Clones for 15k:', items);
    }

    if (okOrder) {
        console.log('\n--- Found OK Order (2k) ---');
        console.log(okOrder);
        const { data: items } = await supabaseAdmin.from('listing_items').select('*').eq('origin_order_id', okOrder.id);
        console.log('Clones for 2k:', items);
    }
}

debug();
