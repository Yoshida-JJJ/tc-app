import {
    Html,
    Head,
    Body,
    Container,
    Section,
    Text,
    Button,
    Preview,
    Tailwind,
} from '@react-email/components';
import * as React from 'react';

interface PayoutRequestEmailProps {
    userName?: string;
    amount?: number;
    payoutId?: string;
    adminUrl?: string;
}

export const PayoutRequestEmail = ({
    userName = "User",
    amount = 0,
    payoutId = "",
    adminUrl = "http://localhost:3000/admin/payouts",
}: PayoutRequestEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>New Payout Request: ¥{amount.toLocaleString()}</Preview>
            <Tailwind
                config={{
                    theme: {
                        extend: {
                            colors: {
                                brand: {
                                    dark: '#0a0a0a',
                                    gold: '#FFD700',
                                    platinum: '#E5E4E2',
                                },
                            },
                        },
                    },
                }}
            >
                <Body className="bg-black my-auto mx-auto font-sans">
                    <Container className="border border-[#FFD700] rounded mx-auto p-8 max-w-[465px] bg-[#111111] my-[40px]">
                        <Section className="mt-[20px]">
                            <Text className="text-[#FFD700] text-2xl font-bold text-center tracking-widest p-0 my-0">
                                ADMIN NOTIFICATION
                            </Text>
                        </Section>
                        <Section className="mt-[32px]">
                            <Text className="text-[#E5E4E2] text-[18px] font-normal text-center p-0 my-0 mx-0">
                                New Payout Request
                            </Text>
                            <Text className="text-[#9CA3AF] text-[14px] leading-[24px] text-center mt-6">
                                User <strong>{userName}</strong> has requested a payout.
                            </Text>
                            <Text className="text-[#FFD700] font-mono text-[24px] font-bold text-center mt-4">
                                ¥{amount.toLocaleString()}
                            </Text>

                            <Text className="text-[#6B7280] text-[12px] text-center mt-2">
                                ID: {payoutId}
                            </Text>
                        </Section>
                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Button
                                className="bg-[#FFD700] rounded text-black px-8 py-4 font-bold text-[14px] no-underline tracking-wide"
                                href={adminUrl}
                            >
                                REVIEW PAYOUTS
                            </Button>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default PayoutRequestEmail;
