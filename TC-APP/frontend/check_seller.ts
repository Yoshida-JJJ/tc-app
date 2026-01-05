import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl!, supabaseKey!);

async function debug() {
    const sellerId = '1380fba9-8aff-41c7-9a90-0e5752a63526';
    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(sellerId);
    console.log('Seller:', user?.email, user?.user_metadata?.full_name);
}

debug();
