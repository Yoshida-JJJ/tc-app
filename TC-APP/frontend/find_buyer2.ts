import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl!, supabaseKey!);

async function debug() {
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const buyer2 = users?.find(u => u.user_metadata?.full_name?.includes('Buyer 2') || u.email?.includes('buyer2'));
    if (buyer2) {
        console.log('Buyer 2 Found:', buyer2.id, buyer2.email);
    } else {
        console.log('Buyer 2 not found by Name/Email. Searching by my presumed ID...');
        const presumedId = '868187c0-f34f-47c7-9449-bc829a212cff';
        const target = users?.find(u => u.id === presumedId);
        if (target) {
            console.log('Found user with presumed ID:', target.id, target.email, target.user_metadata?.full_name);
        } else {
            console.log('No user found with presumed ID.');
        }
    }
}

debug();
