import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl!, supabaseKey!);

async function debug() {
    const { data: moments } = await supabaseAdmin
        .from('live_moments')
        .select('*')
        .ilike('player_name', '%Roki%');
    
    console.log('--- Roki Moments ---');
    console.log(moments);
}

debug();
