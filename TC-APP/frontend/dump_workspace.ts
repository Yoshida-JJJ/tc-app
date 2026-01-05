import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl!, supabaseKey!);

async function debug() {
    const userId = '868187c0-f34f-47c7-9449-bc829a212cff'; // buyer2

    // Emulate app/collection/page.tsx:fetchData
    const { data: listingsData } = await supabaseAdmin
        .from('listing_items')
        .select('*, orders!listing_id(*), origin_order:orders!origin_order_id(status, id)')
        .eq('seller_id', userId)
        .is('deleted_at', null);

    console.log('--- Raw Items for Buyer 2 ---');
    listingsData?.forEach(item => {
        const originOrder = Array.isArray(item.origin_order) ? item.origin_order[0] : item.origin_order;
        console.log(`ID: ${item.id} | Status: ${item.status} | Player: ${item.player_name} | OriginOrder: ${item.origin_order_id} | OrderStatus: ${originOrder?.status}`);
    });

    console.log('\n--- Workspace Filter Results ---');
    const workspaceListings = listingsData?.filter(item => {
        const isCorrectStatus = ['Active', 'Display', 'Draft'].includes(item.status);
        const originOrder = Array.isArray(item.origin_order) ? item.origin_order[0] : item.origin_order;
        const isTransactionComplete = !item.origin_order_id || (originOrder?.status === 'completed');
        return isCorrectStatus && isTransactionComplete;
    });

    workspaceListings?.forEach(item => {
        console.log(`VISIBLE: ID: ${item.id} | Player: ${item.player_name}`);
    });
}

debug();
