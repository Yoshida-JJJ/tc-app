import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl!, supabaseKey!);

async function debug() {
    const { data, error } = await supabaseAdmin.rpc('get_table_constraints', { t_name: 'listing_items' });
    if (error) {
        // Fallback: try querying information_schema
        const { data: constraints, error: cError } = await supabaseAdmin.from('information_schema.table_constraints').select('*').eq('table_name', 'listing_items');
        console.log('Constraints:', constraints);
    } else {
        console.log('Constraints:', data);
    }
}

// Since RLS might block information_schema, I will try a direct SQL query via a temporary function if needed, 
// but first let's see if I can just find it in migrations.
debug();
