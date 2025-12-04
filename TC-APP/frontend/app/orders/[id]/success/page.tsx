'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function OrderSuccessPage() {
    const params = useParams();
    const id = params.id as string;

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="glass-panel-premium py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 text-center border border-white/10">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-brand-blue/20 mb-6">
                        <svg className="h-8 w-8 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-heading font-bold text-white mb-2">Purchase Successful!</h2>
                    <p className="text-brand-platinum/60 mb-8">
                        Thank you for your order. Your transaction has been completed.
                    </p>

                    <div className="bg-brand-dark-light/50 rounded-xl p-4 mb-8 border border-brand-platinum/10">
                        <p className="text-sm text-brand-platinum mb-1">Order ID</p>
                        <p className="font-mono text-sm text-brand-blue-glow break-all">{id}</p>
                    </div>

                    <div className="mt-6">
                        <Link href="/" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-brand-blue hover:bg-brand-blue-glow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-all transform hover:scale-[1.02]">
                            Back to Market
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
