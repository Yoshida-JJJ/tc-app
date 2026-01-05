import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl!, supabaseKey!);

async function debug() {
    // Query to get enum name and values for a column
    const query = `
        SELECT 
            t.typname AS enum_name,  
            e.enumlabel AS enum_value
        FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid  
        JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
        WHERE t.typname = 'listing_status_enum';
    `;

    const { data, error } = await supabaseAdmin.rpc('run_sql_query', { query_text: query });
    if (error) {
        console.error('Error:', error);
        // If RPC not available, try to find in table columns
        const { data: cols } = await supabaseAdmin.from('information_schema.columns').select('udt_name').eq('table_name', 'listing_items').eq('column_name', 'status');
        console.log('Columns metadata:', cols);
    } else {
        console.log('Enum Details:', data);
    }
}

debug();
