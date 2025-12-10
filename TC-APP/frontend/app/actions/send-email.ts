'use server';

import { resend } from '../../lib/resend';
import WelcomeEmail from '../../components/emails/WelcomeEmail';
import { ReactElement } from 'react';

/**
 * Sends a welcome email to the specified user.
 * @param email - Recipient email address
 * @param name - User's name (optional)
 */
export async function sendWelcomeEmail(email: string, name: string = 'Member') {
    try {
        console.log("--- DEBUG: sendWelcomeEmail ---");
        const envKey = process.env.RESEND_API_KEY;
        console.log("process.env.RESEND_API_KEY type:", typeof envKey);
        console.log("process.env.RESEND_API_KEY length:", envKey?.length);
        console.log("process.env.RESEND_API_KEY start:", envKey ? envKey.substring(0, 5) : 'undefined');
        console.log("Current NODE_ENV:", process.env.NODE_ENV);

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        // Re-initialize locally to be absolutely sure
        const { Resend } = await import('resend');
        const debugResend = new Resend(envKey);

        const { data, error } = await debugResend.emails.send({
            from: 'Stadium Card <onboarding@resend.dev>', // Update this to your verified domain in production
            to: [email],
            subject: 'Welcome to Stadium Card',
            react: WelcomeEmail({ userFirstname: name, baseUrl }) as ReactElement,
        });

        if (error) {
            console.error('Email sending failed:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (e) {
        console.error('Unexpected error sending email:', e);
        return { success: false, error: 'Internal Server Error' };
    }
}
