import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Double check (Middleware should catch this, but safe to have)
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
    if (!user || !user.email || !adminEmails.includes(user.email)) {
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-neutral-900 text-white flex">
            {/* Admin Sidebar */}
            <aside className="w-64 bg-black border-r border-white/10 flex-shrink-0">
                <div className="p-6 border-b border-white/10">
                    <h1 className="text-xl font-bold tracking-wider text-[#FFD700]">ADMIN PANEL</h1>
                </div>
                <nav className="p-4 space-y-2">
                    <Link href="/admin" className="block px-4 py-3 rounded hover:bg-white/5 text-gray-300 hover:text-white transition-colors">
                        Dashboard
                    </Link>
                    <Link href="/admin/moments" className="block px-4 py-3 rounded hover:bg-white/5 text-gray-300 hover:text-white transition-colors">
                        Live Moments
                    </Link>
                    <Link href="/admin/payouts" className="block px-4 py-3 rounded hover:bg-white/5 text-gray-300 hover:text-white transition-colors">
                        Payouts
                    </Link>
                </nav>
                <div className="absolute bottom-0 w-64 p-4 border-t border-white/10">
                    <div className="text-xs text-gray-500">
                        Logged in as:<br />
                        <span className="text-gray-300 truncate block">{user.email}</span>
                    </div>
                    <Link href="/" className="mt-4 block text-center py-2 px-4 border border-white/20 rounded text-sm hover:bg-white/10 transition-colors">
                        Back to Site
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
