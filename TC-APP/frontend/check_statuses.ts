import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl!, supabaseKey!);

async function debug() {
    // Get unique statuses from the table
    const { data, error } = await supabaseAdmin
        .from('listing_items')
        .select('status');
    
    if (data) {
        const statuses = Array.from(new Set(data.map(d => d.status)));
        console.log('Unique statuses found in DB:', statuses);
    }
}

debug();
