import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl!, supabaseKey!);

async function debug() {
    // We can't query enums directly via JS client usually, but we can try to trigger an error or use an RPC if available.
    // Alternatively, we can check the migrations or just try to insert a garbage value and read the error message which often lists valid values.
    const { error } = await supabaseAdmin
        .from('listing_items')
        .insert({ 
            player_name: 'TEST', 
            status: 'GARBAGE_VALUE_FOR_ERROR' 
        });
    
    if (error) {
        console.log('Error Message (should list valid values):', error.message);
    }
}

debug();
