import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl!, supabaseKey!);

async function test() {
    console.log('Testing "Incoming" status...');
    const { data, error } = await supabaseAdmin
        .from('listing_items')
        .insert({
            player_name: 'Enum Test',
            status: 'Incoming',
            seller_id: '868187c0-f34f-47c7-9449-bc829a212cff',
            price: 0,
            images: [],
            condition_grading: {}
        })
        .select('id')
        .single();
    
    if (error) {
        console.error('FAILED:', error.message);
    } else {
        console.log('SUCCESS! id:', data.id);
        // Clean up
        await supabaseAdmin.from('listing_items').delete().eq('id', data.id);
    }
}

test();
