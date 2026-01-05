
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function simulateAction() {
    const orderId = 'c376ca76-cd87-47af-93ed-2ab0f7dd7a86';
    console.log(`--- Simulating getBuyerItemByOrder for ${orderId} ---`);

    // 1. Get Order & Buyer
    const { data: order, error: oErr } = await supabaseAdmin
        .from('orders')
        .select('listing_id, buyer_id, created_at, status, listing:listing_items!listing_id(*)')
        .eq('id', orderId)
        .single();

    if (oErr || !order) {
        console.error("Step 1 Failed: Order not found or ambiguous.", oErr);
        return;
    }
    console.log(`Step 1 Success: Order found. Buyer ID: ${order.buyer_id}`);

    const listing = Array.isArray(order.listing) ? order.listing[0] : order.listing;

    // Simulate Auto-Recovery Insert
    console.log("\n--- Testing Auto-Recovery Insert ---");
    const payload = {
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
        seller_id: order.buyer_id, // Current User is Buyer
        status: 'Draft',
        price: 0,
        origin_order_id: orderId,
        moment_history: listing.moment_history || []
    };

    const { data: recoveredItem, error: recoveryError } = await supabaseAdmin
        .from('listing_items')
        .insert(payload)
        .select('id')
        .single();

    if (recoveryError) {
        console.error("❌ Insert Failed:", recoveryError);
        console.log("Payload:", payload);
    } else {
        console.log("✅ Insert Success:", recoveredItem.id);
    }
}

simulateAction();
