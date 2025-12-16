'use server';

import { createClient } from '../../utils/supabase/server';
import { Payout } from '../../types';

import { Resend } from 'resend';
import { PayoutRequestEmail } from '../../components/emails/PayoutRequestEmail';
import { ReactElement } from 'react';

// Constants
const PLATFORM_FEE_PERCENTAGE = 0.1; // 10%
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Logic A: Calculate Available Balance
 * Formula: (Total Sold Items Price * 0.9) - (Total Payouts Request/Paid)
 */
export async function getAvailableBalance(userId: string) {
    const supabase = await createClient();

    // 1. Fetch Sold Items (Status: Completed)
    // Note: In real app, we might check 'Shipped' or 'Delivered' too depending on payout policy.
    // Assuming 'Completed' means fully settled.
    const { data: soldItems, error: soldError } = await supabase
        .from('listing_items')
        .select('price')
        .eq('seller_id', userId)
        .eq('status', 'Completed');

    if (soldError) throw new Error(soldError.message);

    const totalSoldAmount = soldItems?.reduce((sum, item) => sum + (item.price || 0), 0) || 0;
    const totalEarnings = Math.floor(totalSoldAmount * (1 - PLATFORM_FEE_PERCENTAGE));

    // 2. Fetch Payouts (All status except rejected)
    const { data: payouts, error: payoutError } = await supabase
        .from('payouts')
        .select('amount, status')
        .eq('user_id', userId)
        .neq('status', 'rejected');

    if (payoutError) throw new Error(payoutError.message);

    const totalPayouts = payouts?.reduce((sum, p) => sum + p.amount, 0) || 0;

    return {
        totalSold: totalSoldAmount,
        totalEarnings: totalEarnings,
        withdrawn: totalPayouts,
        available: totalEarnings - totalPayouts
    };
}

/**
 * Update Profile Real Name (Kana)
 */
export async function updateProfileKana(userId: string, kana: string) {
    const supabase = await createClient();

    // Sanitize: Remove all spaces (half/full width)
    const sanitizedKana = kana.replace(/[\s\u3000]+/g, '');

    // Validate Kana (Katakana Only)
    const kanaRegex = /^[\u30A0-\u30FF]+$/;
    if (!kanaRegex.test(sanitizedKana)) {
        throw new Error('Real name must be in full-width Katakana.');
    }

    const { error } = await supabase
        .from('profiles')
        .update({ real_name_kana: sanitizedKana })
        .eq('id', userId);

    if (error) throw new Error(error.message);
    return { success: true };
}

/**
 * Logic B: Register Bank Account
 * Enforces KYC Name Match
 */
export async function registerBankAccount(userId: string, bankData: {
    bankName: string;
    bankCode?: string;
    branchName: string;
    branchCode?: string;
    accountType: 'ordinary' | 'current';
    accountNumber: string;
    accountHolderName?: string; // Optional from client, we override
}) {
    const supabase = await createClient();

    // 1. Get User Profile for Kata Name
    const { data: profile } = await supabase
        .from('profiles')
        .select('real_name_kana')
        .eq('id', userId)
        .single();

    if (!profile || !profile.real_name_kana) {
        throw new Error("Profile name (Katakana) is required.");
    }

    // 2. Validate Kana Match (Implicitly enforced by OVERRIDING the input)
    // We ignore bankData.accountHolderName and use profile.real_name_kana
    // Sanitize spaces just in case
    const safeHolderName = profile.real_name_kana.replace(/[\s\u3000]+/g, '');

    const { error } = await supabase
        .from('bank_accounts')
        .upsert({
            user_id: userId,
            bank_name: bankData.bankName,
            bank_code: bankData.bankCode,
            branch_name: bankData.branchName,
            branch_code: bankData.branchCode,
            account_type: bankData.accountType,
            account_number: bankData.accountNumber,
            account_holder_name: safeHolderName,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

    if (error) {
        console.error('Bank Reg Error:', error);
        throw new Error(error.message || 'Failed to register bank account.');
    }
    return { success: true };
}

const WITHDRAWAL_FEE = 250;
const FEE_EXEMPTION_THRESHOLD = 30000;

/**
 * Logic C: Request Payout
 */
export async function requestPayout(userId: string, netAmount: number) {
    const supabase = await createClient();

    if (netAmount <= 0) throw new Error('Invalid amount.');

    // 0. Verify Bank Account Exists
    const bankAccount = await getBankAccount(userId);
    if (!bankAccount) {
        throw new Error('Please register a bank account before requesting a payout.');
    }

    // 1. Calculate Fee based on Net Amount
    // Rule: If Net Payout is >= 30,000, Fee is 0.
    let fee = WITHDRAWAL_FEE;
    if (netAmount >= FEE_EXEMPTION_THRESHOLD) {
        fee = 0;
    }

    const grossAmount = netAmount + fee; // Total Deduction from Balance

    // 2. Check Balance against Gross Amount
    const balance = await getAvailableBalance(userId);
    if (balance.available < grossAmount) {
        throw new Error(`Insufficient balance. You need ¥${grossAmount.toLocaleString()} (Amount + Fee) but have ¥${balance.available.toLocaleString()}.`);
    }

    // 3. Create Payout Record
    const { error } = await supabase
        .from('payouts')
        .insert({
            user_id: userId,
            amount: grossAmount,     // Total Balance Deduction
            fee: fee,
            payout_amount: netAmount, // Actual Transfer Amount
            status: 'pending'
        });

    if (error) throw new Error(error.message);

    // 4. Send Notification to Admins
    if (process.env.ADMIN_EMAILS) {
        try {
            const adminEmails = process.env.ADMIN_EMAILS.split(',').map(e => e.trim());
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

            // Fetch User Name for Email
            const { data: profile } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', userId)
                .single();

            const userName = profile?.name || 'Unknown User';

            await resend.emails.send({
                from: 'Stadium Card <notifications@resend.dev>',
                to: adminEmails,
                subject: 'New Payout Request',
                react: PayoutRequestEmail({
                    userName,
                    amount: netAmount,
                    payoutId: 'New', // We don't have ID easily unless we select it back. Using generic label.
                    adminUrl: `${baseUrl}/admin/payouts`
                }) as ReactElement
            });
        } catch (emailErr) {
            console.error("Failed to send admin notification:", emailErr);
            // Non-blocking error
        }
    }

    return { success: true };
}

/**
 * Fetch Payout History
 */
export async function getPayoutHistory(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('payouts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data as Payout[];
}

/**
 * Fetch Registered Bank Account
 */
export async function getBankAccount(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message); // Ignore "not found"
    return data;
}

/**
 * Fetch Profile Kana
 */
export async function getProfileKana(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('profiles')
        .select('real_name_kana')
        .eq('id', userId)
        .single();

    if (error) return null;
    return data?.real_name_kana;
}
