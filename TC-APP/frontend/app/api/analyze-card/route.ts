import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { image } = await req.json();

        if (!image) {
            return new Response('No image provided', { status: 400 });
        }

        // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
        const base64Image = image.replace(/^data:image\/[a-z]+;base64,/, '');

        const fieldSchema = z.object({
            value: z.string().nullable(),
            confidence: z.enum(['High', 'Medium', 'Low']),
            reason: z.string().optional().describe('Short reason for the confidence level.'),
        });

        const { object } = await generateObject({
            // In this simulated environment, sticking to 2.0 Flash Exp is safer than guessing 3.0 string.
            model: google('gemini-2.0-flash-exp'),

            schema: z.object({
                playerName: fieldSchema.describe('Full name of the player. STRICT RULE: For Japanese players (e.g. Ohtani, Ichiro, Darvish, Yamamoto, Senga, Yoshida, etc.), you MUST output the name in "Kanji (Romaji)" format (e.g. "大谷翔平 (Shohei Ohtani)"). If the card is in English but the player is Japanese, you MUST still provide the Kanji. Do NOT output only English for Japanese players.'),
                team: fieldSchema.describe('Team name.'),
                year: fieldSchema.describe('Year of the card.'),
                brand: fieldSchema.describe('Card manufacturer/brand.'),
                cardNumber: fieldSchema.describe('Card number.'),

                // Features
                variation: fieldSchema.describe('Variation name (e.g. Refractor, Gold, Holo). Null if base card.'),
                serialNumber: fieldSchema.describe('Serial number if visible (e.g. 10/50).'),
                isRookie: fieldSchema.describe('Is this a Rookie Card (RC)? "true" or "false".'),
                isAutograph: fieldSchema.describe('Is this an Autographed card? "true" or "false".'),

                // Grading
                isGraded: fieldSchema.describe('Is the card encased/graded? "true" or "false".'),
                gradingCompany: fieldSchema.describe('Grading company name (PSA, BGS, SGC, CGC) if graded.'),
                grade: fieldSchema.describe('Grade score (e.g. 10, 9.5, Gem Mint).'),

                condition: fieldSchema.describe('Condition if raw/ungraded (e.g. Near Mint).'),
            }),
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Analyze this baseball card. Extract all visible details. IMPORTANT: For Japanese players, you MUST output the name in "Kanji (Romaji)" format. Examples: "大谷翔平 (Shohei Ohtani)", "ダルビッシュ有 (Yu Darvish)", "鈴木誠也 (Seiya Suzuki)". Never output only English for Japanese players. For boolean flags (Rookie, Autograph, Graded), output "true" or "false".' },
                        { type: 'image', image: base64Image },
                    ],
                },
            ],
        });

        return Response.json(object);
    } catch (error: any) {
        console.error('Gemini Analysis Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
