
'use client';

import { createClient } from '../utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const TEST_ACCOUNTS = [
    { email: 'seller@test.com', password: 'password123', label: 'Seller' },
    { email: 'buyer1@test.com', password: 'password123', label: 'Buyer 1' },
    { email: 'buyer2@test.com', password: 'password123', label: 'Buyer 2' },
];

export default function DevTools() {
    // Only show in dev environment (or via feature flag)
    // In Next.js, process.env.NODE_ENV is reliable.
    // However, sometimes it is 'production' even on staging effectively.
    // We can double check if we are on localhost window side or just assume dev.
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState('');
    const supabase = createClient();
    const router = useRouter();

    if (process.env.NODE_ENV === 'production') return null;

    const handleLogin = async (email: string, pass: string) => {
        setStatus(`Logging in as ${email}...`);
        await supabase.auth.signOut();
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password: pass
        });

        if (error) {
            setStatus('Login Failed: ' + error.message);
        } else {
            setStatus('Logged In! Refresing...');
            router.refresh();
            // Force reload to update server components properly
            window.location.href = '/collection';
        }
    };

    const handleCreateLiveMoment = async () => {
        setStatus('Creating Live Moment...');
        try {
            const res = await fetch('/api/dev/moment', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setStatus(`Moment Created: ${data.moment.title}`);
                router.refresh();
            } else {
                setStatus('Failed: ' + (data.error || 'Unknown error'));
            }
        } catch (e: any) {
            setStatus('Error: ' + e.message);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-[9999] font-sans">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-purple-600/80 hover:bg-purple-600 text-white p-2 rounded-full shadow-lg border border-white/20 backdrop-blur-md text-xs font-bold"
                >
                    🛠️ DEV
                </button>
            ) : (
                <div className="bg-black/90 text-white p-4 rounded-lg shadow-2xl border border-purple-500/50 w-64 backdrop-blur-xl">
                    <div className="flex justify-between items-center mb-3 border-b border-gray-700 pb-2">
                        <span className="font-bold text-purple-400 text-xs tracking-widest">DEV TOOLS</span>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">✕</button>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Quick Login</p>
                        <div className="grid grid-cols-2 gap-2">
                            {TEST_ACCOUNTS.map((acc) => (
                                <button
                                    key={acc.email}
                                    onClick={() => handleLogin(acc.email, acc.password)}
                                    className="px-2 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs border border-gray-700 hover:border-purple-500/50 transition-all text-left truncate"
                                    title={acc.email}
                                >
                                    {acc.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-800 space-y-2">
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Actions</p>
                        <button
                            onClick={handleCreateLiveMoment}
                            className="w-full py-1.5 bg-blue-900/40 hover:bg-blue-900/60 rounded text-xs border border-blue-500/30 text-blue-200"
                        >
                            + Live Moment (Use Script)
                        </button>
                    </div>

                    {status && (
                        <div className="mt-3 text-[10px] text-yellow-400 bg-yellow-900/20 p-2 rounded border border-yellow-500/20">
                            {status}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
