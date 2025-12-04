'use client';

import Footer from '../../components/Footer';

export default function CommunityPage() {
    return (
        <div className="min-h-screen bg-brand-dark flex flex-col">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 relative z-20 flex-1 w-full text-center">
                <div className="glass-panel-premium p-12 rounded-2xl shadow-2xl inline-block max-w-2xl">
                    <div className="w-20 h-20 bg-brand-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-heading font-bold text-white mb-4">Community Hub</h1>
                    <p className="text-brand-platinum/60 text-lg mb-8">
                        Connect with other collectors, discuss trends, and show off your showcase.
                    </p>
                    <button className="px-8 py-3 bg-brand-blue hover:bg-brand-blue-glow text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-blue/20">
                        Join Discord
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
}
