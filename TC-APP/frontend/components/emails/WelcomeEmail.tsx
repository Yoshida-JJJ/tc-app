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

interface WelcomeEmailProps {
    userFirstname?: string;
    baseUrl?: string;
}

export const WelcomeEmail = ({
    userFirstname = "Member",
    baseUrl = "http://localhost:3000",
}: WelcomeEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Welcome to the Stadium Card Exclusive Club.</Preview>
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
                            <Text className="text-[#FFD700] text-3xl font-bold text-center tracking-widest p-0 my-0">
                                STADIUM CARD
                            </Text>
                        </Section>
                        <Section className="mt-[32px]">
                            <Text className="text-[#E5E4E2] text-[20px] font-normal text-center p-0 my-0 mx-0">
                                Welcome to the Elite, {userFirstname}
                            </Text>
                            <Text className="text-[#9CA3AF] text-[14px] leading-[24px] text-center mt-6">
                                You have successfully joined the premier marketplace for high-end baseball cards.
                                Prepare to collect moments that define history.
                            </Text>
                        </Section>
                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Button
                                className="bg-[#FFD700] rounded text-black px-8 py-4 font-bold text-[14px] no-underline tracking-wide"
                                href={`${baseUrl}/market`}
                            >
                                EXPLORE THE COLLECTION
                            </Button>
                        </Section>
                        <Section>
                            <Text className="text-[#6B7280] text-[12px] leading-[20px] text-center">
                                © 2024 Stadium Card Team. All rights reserved.<br />
                                This is a system generated message.
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default WelcomeEmail;
