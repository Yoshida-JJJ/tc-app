
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { randomUUID } from 'crypto';

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- CONFIG ---
const TEST_USERS = [
    {
        email: 'seller@test.com',
        password: 'password123',
        name: 'Test Seller',
        address: {
            postal_code: '100-0005', address_line1: 'Tokyo Chiyoda-ku', address_line2: 'Marunouchi 1-1', phone_number: '090-1111-1111',
            display_name: 'Seller-san',
            first_name: 'Taro',
            last_name: 'Yamada'
        }
    },
    {
        email: 'buyer1@test.com',
        password: 'password123',
        name: 'Test Buyer 1',
        address: {
            postal_code: '530-0001', address_line1: 'Osaka Kita-ku', address_line2: 'Umeda 1-1', phone_number: '080-2222-2222',
            display_name: 'Buyer-kun 1',
            first_name: 'Jiro',
            last_name: 'Suzuki'
        }
    },
    {
        email: 'buyer2@test.com',
        password: 'password123',
        name: 'Test Buyer 2',
        address: {
            postal_code: '460-0008', address_line1: 'Aichi Nagoya-shi Naka-ku', address_line2: 'Sakae 3-5-12', phone_number: '070-3333-3333',
            display_name: 'Buyer-chan 2',
            first_name: 'Hanako',
            last_name: 'Sato'
        }
    },
];

const PLAYERS = [
    { name: 'Roki Sasaki', team: 'Marines', number: 17 },
    { name: 'Shohei Ohtani', team: 'Dodgers', number: 17 },
    { name: 'Munetaka Murakami', team: 'Swallows', number: 55 },
];

async function seed() {
    console.log('🌱 Starting Seed...');

    // 1. Create Users
    console.log('--- Creating Users ---');
    const userMap: Record<string, string> = {}; // email -> id

    for (const u of TEST_USERS) {
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const existing = users.find(user => user.email === u.email);

        if (existing) {
            console.log(`User ${u.email} already exists: ${existing.id}`);
            userMap[u.email] = existing.id;
        } else {
            console.log(`Creating user ${u.email}...`);
            const { data, error } = await supabase.auth.admin.createUser({
                email: u.email,
                password: u.password,
                email_confirm: true,
                user_metadata: { full_name: u.name }
            });
            if (error) {
                console.error(`Failed to create ${u.email}:`, error.message);
            } else if (data.user) {
                userMap[u.email] = data.user.id;
            }
        }

        // Update Profile with Address
        if (userMap[u.email]) {
            const { error: pError } = await supabase
                .from('profiles')
                .update(u.address)
                .eq('id', userMap[u.email]);

            if (pError) console.error(`Failed to update profile for ${u.email}:`, pError.message);
            else console.log(`Updated profile address for ${u.email}`);
        }
    }

    const sellerId = userMap['seller@test.com'];
    const buyer1Id = userMap['buyer1@test.com'];
    const buyer2Id = userMap['buyer2@test.com'];

    if (!sellerId || !buyer1Id) {
        console.error('Failed to setup users');
        return;
    }

    // 3. Create Live Moments
    console.log('--- Creating Live Moments ---');
    const momentIds: string[] = [];
    const momentTemplates = [
        { title: '165km/h Fastball Info', desc: 'Japanese Record Speed!', intensity: 5, status: 'finalized', type: 'RECORD_BREAK' },
        { title: 'Dramatic Walk-off HR', desc: 'Bottom of the 9th, 2 outs.', intensity: 5, status: 'finalized', type: 'HOMERUN' },
        { title: 'Spectacular Diving Catch', desc: 'Saved the game!', intensity: 4, status: 'finalized', type: 'BIG_PLAY' },
        { title: '3000th Strikeout', desc: 'Legendary achievement.', intensity: 5, status: 'live', type: 'BIG_PLAY' }, // Active
        { title: 'Perfect Game Bid', desc: '8th inning completed.', intensity: 5, status: 'live', type: 'BIG_PLAY' }
    ];

    for (const t of momentTemplates) {
        const player = PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
        const { data: moment, error } = await supabase.from('live_moments').insert({
            title: `${player.name}: ${t.title}`,
            description: t.desc,
            player_name: player.name,
            intensity: t.intensity,
            is_finalized: t.status === 'finalized',
            match_result: t.status === 'finalized' ? 'WIN 3-2' : undefined,
            type: t.type
        }).select().single();

        if (error) console.error('Moment error:', error.message);
        else if (moment) {
            momentIds.push(moment.id);
            console.log(`Created moment: ${moment.id} (${t.title})`);
        }
    }

    // 4. Create Listings (Active)
    console.log('--- Creating Active Listings ---');
    const listingIds: string[] = [];

    for (let i = 0; i < 10; i++) {
        const player = PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
        const price = (Math.floor(Math.random() * 50) + 1) * 1000; // 1000 - 50000

        const { data: item, error } = await supabase.from('listing_items').insert({
            seller_id: sellerId,
            player_name: player.name,
            team: player.team,
            series_name: '2025 Legend Series',
            card_number: `LS-${String(i).padStart(3, '0')}`,
            price: price,
            status: 'Active',
            images: [`https://placehold.co/400x600/202020/FFF?text=${encodeURIComponent(player.name)}`],
            description: `Seeded Item #${i}. Mint condition.`,
            condition_grading: 'Gem Mint 10',
            condition_rating: 10,
            year: 2025,
            manufacturer: 'Stadium Card',
            is_live_moment: Math.random() > 0.5,
            moment_history: [] // Initially empty
        }).select().single();

        if (error) console.error('Listing error:', error.message);
        else if (item) listingIds.push(item.id);
    }

    // 5. Create Sold Listings & Orders (History)
    console.log('--- Creating Sold History ---');
    for (let i = 0; i < 3; i++) {
        const player = PLAYERS[Math.floor(Math.random() * PLAYERS.length)];

        // Original Listing (Sold)
        const { data: original, error: lError } = await supabase.from('listing_items').insert({
            seller_id: sellerId,
            player_name: player.name,
            price: 5000,
            status: 'Completed', // Sold
            images: [`https://placehold.co/400x600/333/FFF?text=SOLD-${i}`],
            description: `Sold Item #${i}`,
            moment_history: []
        }).select().single();

        if (original) {
            // Buyer Item (Clone)
            const { data: item, error: cError } = await supabase.from('listing_items').insert({
                seller_id: buyer1Id,
                player_name: player.name,
                price: 0,
                status: 'Draft',
                moment_history: [
                    // Add a seeded memory
                    {
                        moment_id: momentIds[0] || 'seed-moment',
                        title: 'Seeded Memory',
                        timestamp: new Date().toISOString(),
                        memories: [
                            {
                                id: randomUUID(),
                                author_id: sellerId,
                                author_name: 'Test Seller',
                                text: 'Thank you for buying!',
                                created_at: new Date(Date.now() - 86400000).toISOString(),
                                is_hidden: false
                            },
                            {
                                id: randomUUID(),
                                author_id: buyer1Id,
                                author_name: 'Test Buyer 1',
                                text: 'Testing memory timeline array!',
                                created_at: new Date().toISOString(),
                                is_hidden: false
                            }
                        ]
                    }
                ]
            }).select().single();

            // Order Record
            if (item) {
                await supabase.from('orders').insert({
                    buyer_id: buyer1Id,
                    listing_id: original.id,
                    status: 'completed',
                    total_amount: 5000,
                    stripe_payment_intent_id: `pi_seed_${i}`,
                    shipping_address: { postal_code: "000-0000", line1: "Test City" }
                });
                console.log(`Created sold history for ${original.id}`);
            }
        }
    }

    console.log('✅ Seed Complete!');
}

seed().catch(e => console.error(e));
