import { Resend } from 'resend';

// Initialize Resend client
const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
    console.warn("⚠️  RESEND_API_KEY is not defined in process.env. Email sending will fail.");
    console.log("Current NODE_ENV:", process.env.NODE_ENV);
} else {
    console.log("✅ RESEND_API_KEY is loaded (starts with " + apiKey.substring(0, 3) + ")");
}

export const resend = new Resend(apiKey || 're_123_placeholder');
