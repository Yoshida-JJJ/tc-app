'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

// Types (Duplicate from page.tsx for now)
type Manufacturer = "BBM" | "Calbee" | "Epoch" | "Topps_Japan";
type Team = "Giants" | "Tigers" | "Dragons" | "Swallows" | "Carp" | "BayStars" | "Hawks" | "Fighters" | "Marines" | "Buffaloes" | "Eagles" | "Lions";
type Rarity = "Common" | "Rare" | "Super Rare" | "Parallel" | "Autograph" | "Patch";

interface CardCatalog {
    id: string;
    manufacturer: Manufacturer;
    year: number;
    series_name?: string;
    player_name: string;
    team: Team;
    card_number?: string;
    rarity?: Rarity;
    is_rookie: boolean;
}

interface ConditionGrading {
    is_graded: boolean;
    service: string;
    score?: number;
    certification_number?: string;
}

interface ListingItem {
    id: string;
    catalog_id: string;
    price: number;
    images: string[];
    condition_grading: ConditionGrading;
    seller_id: string;
    status: string;
    catalog: CardCatalog;
}

export default function CheckoutPage() {
    const { data: session } = useSession();
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [listing, setListing] = useState<ListingItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchListing = async () => {
            if (!id) return;

            try {
                const response = await fetch(`/api/proxy/market/listings/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch listing');
                }
                const data = await response.json();
                setListing(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
    }, [id]);

    const handlePlaceOrder = async () => {
        if (!listing) return;
        setProcessing(true);
        setError(null);

        try {
            // 1. Create Order
            const orderRes = await fetch('/api/proxy/market/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    listing_id: listing.id,
                    payment_method_id: 'pm_card_visa', // Mock payment method
                    buyer_id: session?.user?.id // Send authenticated user ID
                }),
            });

            if (!orderRes.ok) {
                const errorData = await orderRes.json();
                throw new Error(errorData.detail || 'Failed to create order');
            }

            const orderData = await orderRes.json();

            // 2. Capture Payment (Simulate immediate capture)
            const captureResponse = await fetch(`/api/proxy/market/orders/${orderData.id}/capture`, {
                method: 'POST',
            });

            if (!captureResponse.ok) {
                const errorData = await captureResponse.json();
                throw new Error(errorData.detail || 'Failed to capture payment');
            }

            // 3. Redirect to Success Page
            router.push(`/orders/${orderData.id}/success`);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Transaction failed');
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error && !listing) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="text-red-500 text-xl font-semibold mb-4">Error: {error}</div>
                <Link href="/" className="text-blue-600 hover:underline">
                    Back to Market
                </Link>
            </div>
        );
    }

    if (!listing) return null;

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-heading font-bold text-white mb-8">Checkout</h1>

                <div className="glass-panel-premium shadow-2xl overflow-hidden rounded-2xl mb-6">
                    <div className="px-6 py-5 border-b border-brand-platinum/10">
                        <h3 className="text-lg leading-6 font-medium text-white">Order Summary</h3>
                    </div>
                    <div className="border-t border-brand-platinum/10">
                        <dl>
                            <div className="bg-brand-dark-light/30 px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-sm font-medium text-brand-platinum">Item</dt>
                                <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">
                                    {listing.catalog.player_name} ({listing.catalog.year} {listing.catalog.manufacturer})
                                </dd>
                            </div>
                            <div className="bg-transparent px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-sm font-medium text-brand-platinum">Condition</dt>
                                <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">
                                    {listing.condition_grading.is_graded ? `Graded: ${listing.condition_grading.service} ${listing.condition_grading.score}` : 'Ungraded'}
                                </dd>
                            </div>
                            <div className="bg-brand-dark-light/30 px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-sm font-medium text-brand-platinum">Total Amount</dt>
                                <dd className="mt-1 text-xl font-bold text-brand-blue-glow sm:mt-0 sm:col-span-2">
                                    ¥{listing.price.toLocaleString()}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 mb-6 rounded-xl">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end space-x-4">
                    <Link href={`/listings/${listing.id}`} className="px-6 py-3 border border-brand-platinum/20 rounded-xl text-sm font-medium text-brand-platinum hover:bg-brand-platinum/10 hover:text-white transition-all">
                        Cancel
                    </Link>
                    <button
                        onClick={handlePlaceOrder}
                        disabled={processing}
                        className={`inline-flex justify-center px-6 py-3 border border-transparent shadow-lg text-sm font-medium rounded-xl text-white bg-brand-blue hover:bg-brand-blue-glow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-all transform hover:scale-[1.02] ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {processing ? 'Processing...' : 'Confirm Purchase'}
                    </button>
                </div>
            </div>
        </div>
    );
}
