import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl!, supabaseKey!);

async function debug() {
    const { data: enumValues, error } = await supabaseAdmin.rpc('get_enum_values', { enum_name: 'listing_status_enum' });
    if (error) {
         // Fallback SQL
         console.error('Error fetching enum:', error);
    } else {
        console.log('Enum values:', enumValues);
    }
}

debug();
