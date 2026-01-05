
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MOMENT_TEMPLATES = [
    { title: '165km/h Fastball', desc: 'Japanese Record Speed!', intensity: 5, type: 'RECORD_BREAK' },
    { title: 'Dramatic Walk-off HR', desc: 'Bottom of the 9th, 2 outs.', intensity: 5, type: 'HOMERUN' },
    { title: 'Spectacular Diving Catch', desc: 'Saved the game!', intensity: 4, type: 'BIG_PLAY' },
    { title: '3000th Strikeout', desc: 'Legendary achievement.', intensity: 5, type: 'BIG_PLAY' },
    { title: 'Perfect Game Bid', desc: '8th inning completed.', intensity: 5, type: 'BIG_PLAY' }
];

const PLAYERS = ['Roki Sasaki', 'Shohei Ohtani', 'Munetaka Murakami'];

export async function POST() {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
    }

    try {
        const template = MOMENT_TEMPLATES[Math.floor(Math.random() * MOMENT_TEMPLATES.length)];
        const playerName = PLAYERS[Math.floor(Math.random() * PLAYERS.length)];

        const { data, error } = await supabase
            .from('live_moments')
            .insert({
                title: `${playerName}: ${template.title}`,
                description: template.desc,
                player_name: playerName,
                intensity: template.intensity,
                type: template.type,
                is_finalized: false
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, moment: data });
    } catch (error: any) {
        console.error('Failed to create dev moment:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
