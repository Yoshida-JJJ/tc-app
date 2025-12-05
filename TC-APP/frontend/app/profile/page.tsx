'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Footer from '../../components/Footer';

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
        if (session?.user) {
            setEditName(session.user.name || '');
            setEditEmail(session.user.email || '');
        }
    }, [status, router, session]);

    const handleSave = async () => {
        if (!session?.user?.id) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/proxy/auth/users/${session.user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: editName,
                    email: editEmail,
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to update profile');
            }

            const updatedUser = await res.json();
            // In a real app, we should update the session here.
            // For now, we'll just toggle off editing and maybe show a success message.
            setIsEditing(false);
            alert('Profile updated successfully! Please sign out and sign in again to see changes in the header.');

        } catch (error) {
            console.error(error);
            alert('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-brand-dark flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="min-h-screen bg-brand-dark flex flex-col">
            <div className="flex-1 container mx-auto px-4 py-24 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto space-y-8">
                    {/* Header Section */}
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-heading font-bold text-white tracking-tight">
                            My Profile
                        </h1>
                        <p className="text-brand-platinum/60">
                            Manage your account settings and view your activity.
                        </p>
                    </div>

                    {/* Profile Card */}
                    <div className="glass-panel p-8 rounded-3xl shadow-2xl border border-brand-platinum/10 relative overflow-hidden group">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:bg-brand-blue/20 transition-all duration-700"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-brand-blue to-brand-blue-glow p-[2px] shadow-lg shadow-brand-blue/20">
                                    <div className="w-full h-full rounded-full bg-brand-dark-light overflow-hidden">
                                        <img
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user?.email || 'Guest'}`}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-brand-dark-light flex items-center justify-center" title="Active">
                                    <div className="w-full h-full rounded-full animate-pulse bg-green-400/50"></div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center md:text-left space-y-4 w-full">
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-brand-platinum/60 mb-1">Name</label>
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="w-full bg-brand-dark-light/50 border border-brand-platinum/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-blue"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-brand-platinum/60 mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={editEmail}
                                                onChange={(e) => setEditEmail(e.target.value)}
                                                className="w-full bg-brand-dark-light/50 border border-brand-platinum/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-blue"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-1">
                                            {editName || session.user?.name || 'Trading Card Collector'}
                                        </h2>
                                        <p className="text-brand-platinum/60 font-mono text-sm">
                                            {editEmail || session.user?.email}
                                        </p>
                                    </div>
                                )}

                                {!isEditing && (
                                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                        <span className="px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold border border-brand-blue/20">
                                            MEMBER
                                        </span>
                                        <span className="px-3 py-1 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-bold border border-brand-gold/20">
                                            EARLY ADOPTER
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3 w-full md:w-auto">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="px-6 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-glow text-white font-bold text-sm shadow-lg shadow-brand-blue/20 transition-all text-center disabled:opacity-50"
                                        >
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            disabled={saving}
                                            className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/10 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/10 transition-all"
                                        >
                                            Edit Profile
                                        </button>
                                        <Link href="/collection" className="px-6 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-glow text-white font-bold text-sm shadow-lg shadow-brand-blue/20 transition-all text-center">
                                            My Collection
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { label: 'Total Listings', value: '0', icon: '📋' },
                            { label: 'Sales', value: '¥0', icon: '💰' },
                            { label: 'Purchases', value: '0', icon: '🛍️' },
                        ].map((stat, i) => (
                            <div key={i} className="glass-panel p-6 rounded-2xl border border-brand-platinum/5 hover:border-brand-platinum/20 transition-all group">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-brand-platinum/60 text-sm font-bold">{stat.label}</span>
                                    <span className="text-xl group-hover:scale-110 transition-transform">{stat.icon}</span>
                                </div>
                                <div className="text-2xl font-heading font-bold text-white group-hover:text-brand-blue-glow transition-colors">
                                    {stat.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
