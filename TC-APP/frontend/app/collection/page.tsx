'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Footer from '../../components/Footer';
import { createClient } from '../../utils/supabase/client';
import AddToShowcaseModal from '../../components/AddToShowcaseModal';
import ShowcaseCard from '../../components/ShowcaseCard';
import PurchaseAnimation from '../../components/PurchaseAnimation';
import SkeletonCard from '../../components/SkeletonCard';
import { deleteItem, restoreItem } from '../actions/item';

// Types
import { ListingItem } from '../../types';

interface OrderItem {
    id: string;
    listing_id: string;
    status: string;
    total_amount: number;
    tracking_number?: string;
    listing?: ListingItem;
    created_at: string;
    completed_at?: string;
}

function MyPageContent() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const isDebugLive = searchParams.get('live') === 'true'; // Debug Mode

    const [activeTab, setActiveTab] = useState<'showcase' | 'listings' | 'orders' | 'history' | 'archive'>('showcase');
    const [historyTab, setHistoryTab] = useState<'sold' | 'purchased'>('sold');
    const [filter, setFilter] = useState<'All' | 'Draft' | 'Active' | 'Display'>('All');
    const [showcaseItems, setShowcaseItems] = useState<any[]>([]);
    const [archivedItems, setArchivedItems] = useState<any[]>([]);
    const [myListings, setMyListings] = useState<ListingItem[]>([]);
    const [myOrders, setMyOrders] = useState<OrderItem[]>([]);
    const [historySold, setHistorySold] = useState<ListingItem[]>([]);
    const [historyPurchased, setHistoryPurchased] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showAnimation, setShowAnimation] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.log('[Collection] No user found, redirecting to login');
            router.push('/login');
            setLoading(false);
            return;
        }
        setUser(user);
        setCurrentUserId(user.id);

        try {
            // Fetch All My Items (Listings + Collection)
            const { data: listingsData } = await supabase
                .from('listing_items')
                .select('*, orders:orders!listing_id(*), origin_order:orders!origin_order_id(id, status, moment_snapshot)') // Left Join (Removed !)
                .eq('seller_id', user.id);

            const activeItemsRaw = listingsData?.filter(i => !i.deleted_at) || [];
            const archivedItemsRaw = listingsData?.filter(i => !!i.deleted_at) || [];

            // Fetch Active Live Moments to tag items
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
            const { data: recentMoments } = await supabase
                .from('live_moments')
                .select('*')
                .gt('created_at', oneHourAgo);

            const livePlayerNames = new Set(recentMoments?.map(m => (m.player_name || '').toLowerCase()) || []);

            const tagWithLive = (item: any) => {
                if (!item) return null;

                // Live Moments enabled for ALL items (as per user request to boost selling intent)
                // Originally restricted to Active, now globally enabled for "Opportunity" notification.

                const playerName = (item.player_name || '').toLowerCase();
                const matchedMoments = recentMoments?.filter(m => {
                    const mName = (m.player_name || '').toLowerCase();
                    return playerName.includes(mName) || mName.includes(playerName);
                }) || [];

                return {
                    ...item,
                    is_live_moment: matchedMoments.length > 0,
                    live_moments: matchedMoments, // Full array for multi-badge
                    moment_created_at: matchedMoments[0]?.created_at || null // For legacy single-badge if needed
                };
            };

            // Helper for merging moments from order snapshots into item history
            const mergeOrderMoments = (item: any, orderData: any) => {
                if (!item || !orderData || !orderData.moment_snapshot) return item;

                const snapshots = Array.isArray(orderData.moment_snapshot) ? orderData.moment_snapshot : [orderData.moment_snapshot];
                const history = Array.isArray(item.moment_history) ? item.moment_history : [];

                const missingSnapshots = snapshots.filter((sn: any) =>
                    !history.some((h: any) => (h.moment_id === sn.id) || (h.id === sn.id))
                );

                if (missingSnapshots.length > 0) {
                    item.moment_history = [
                        ...history,
                        ...missingSnapshots.map((sn: any) => ({
                            moment_id: sn.id,
                            timestamp: sn.created_at || new Date().toISOString(),
                            title: sn.title,
                            player_name: sn.player_name,
                            intensity: sn.intensity,
                            description: sn.description,
                            match_result: sn.match_result,
                            owner_at_time: orderData.id,
                            status: 'finalized'
                        }))
                    ];
                }
                return item;
            };

            // Selling Tab: Active Transactions (Persistent Model: Query from orders)
            const { data: pendingSalesData } = await supabase
                .from('orders')
                .select('*, listing:listing_items!listing_id(*)')
                .eq('seller_id', user.id)
                .is('completed_at', null);

            console.log('[Collection] Pending Sales:', pendingSalesData?.length || 0);

            const activeMyListings = (pendingSalesData || []).map(order => ({
                ...order.listing,
                orders: order // Pass order for Manage link
            })).map(tagWithLive).filter(item => item !== null);
            setMyListings(activeMyListings as any);

            // History: Sold Items (Persistent Model: Query from orders)
            const { data: soldOrdersData } = await supabase
                .from('orders')
                .select('*, listing:listing_items!listing_id(*)') // Get the listing details at time of fetch
                .eq('seller_id', user.id)
                .is('completed_at', null); // Initial check for pending sales? No, history usually means completed.

            // Actually, History > Sold should probably show Completed orders.
            const { data: completedSoldData } = await supabase
                .from('orders')
                .select('*, listing:listing_items!listing_id(*)') // Disambiguate join
                .eq('seller_id', user.id)
                .not('completed_at', 'is', null);

            const soldHistory = (completedSoldData || []).map(order => ({
                ...order.listing,
                orders: order, // For formatDate(item.orders.completed_at)
                type: 'sold'
            })).map(tagWithLive);
            setHistorySold(soldHistory as any);

            // Buying Tab: Active Transactions only
            const { data: ordersData } = await supabase
                .from('orders')
                .select('*, listing:listing_items!listing_id(*)') // Disambiguate join
                .eq('buyer_id', user.id);

            const activeMyOrders = (ordersData?.filter(order => {
                const orderStatus = (order.status || '').toLowerCase();
                // ONLY show orders that are actually in progress for THIS purchase
                return ['pending', 'paid', 'awaiting_shipping', 'shipped', 'delivered'].includes(orderStatus);
            }) || []).map(order => {
                const listing = order.listing ? mergeOrderMoments(order.listing, order) : null;
                return {
                    ...order,
                    listing: listing ? tagWithLive(listing) : null
                };
            }).filter(o => o.listing !== null); // safety
            setMyOrders(activeMyOrders as any || []);

            // History: Purchased Items
            const purchasedHistory = (ordersData?.filter(order =>
                (order.status || '').toLowerCase() === 'completed'
            ) || []).map(order => {
                const listing = order.listing ? mergeOrderMoments(order.listing, order) : null;
                return {
                    ...order,
                    listing: listing ? tagWithLive(listing) : null
                };
            });
            setHistoryPurchased(purchasedHistory as any);

            // Workspace Tab: Aggregated View
            const workspaceListings = (activeItemsRaw?.filter(item => {
                // Mandatory Filter: Must be Active, Display, or Draft (or Completed as fallback)
                const isCorrectStatus = ['Active', 'Display', 'Draft', 'Completed', 'completed'].includes(item.status);

                // Extra Protection: If it's a purchased clone (has origin_order_id), 
                // it MUST have a completed order to show up in Workspace.
                // If it's not a clone (origin_order_id is null), it's a seller's item, show normally.
                const originOrder = Array.isArray(item.origin_order) ? item.origin_order[0] : item.origin_order;
                const isTransactionComplete = !item.origin_order_id || (originOrder?.status === 'completed');

                return isCorrectStatus && isTransactionComplete;
            }) || []).map(item => {
                // Self-Healing: Merge moment_snapshot from origin_order into history if missing
                let originOrder = Array.isArray(item.origin_order) ? item.origin_order[0] : item.origin_order;

                // Fallback: If origin_order is missing link, look for my purchase order in related orders
                if (!originOrder && item.orders) {
                    const relatedOrders = Array.isArray(item.orders) ? item.orders : [item.orders];
                    const myPurchase = relatedOrders.find((o: any) =>
                        o.buyer_id === user.id &&
                        (o.status === 'completed' || o.status === 'shipped' || o.status === 'paid' || o.status === 'delivered')
                    );
                    if (myPurchase) {
                        originOrder = myPurchase;
                    }
                }

                return mergeOrderMoments(item, originOrder);
            }).map(tagWithLive);

            // Archive Tab
            const archiveListings = (archivedItemsRaw || []).map(tagWithLive);
            setArchivedItems(archiveListings);

            const aggregated = [
                ...workspaceListings.map(item => ({ type: 'listed', ...item }))
            ];
            setShowcaseItems(aggregated);

        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };


    const handleDeleteCollectionItem = async (id: string) => {
        if (!confirm('Are you sure you want to archive this item? It will be moved to your history tab.')) return;

        try {
            await deleteItem(id);
            fetchData();
        } catch (error) {
            console.error('Failed to archive item:', error);
            alert('Failed to archive item');
        }
    };

    const handleRestoreCollectionItem = async (id: string) => {
        if (!confirm('Restore this item to your collection?')) return;

        try {
            await restoreItem(id);
            fetchData();
        } catch (error) {
            console.error('Failed to restore item:', error);
            alert('Failed to restore item');
        }
    };

    const handleToggleDisplay = async (id: string, currentStatus: string) => {
        let newStatus = 'Draft';
        if (currentStatus === 'Draft') newStatus = 'Display';
        if (currentStatus === 'Active') newStatus = 'Display'; // Active -> Display
        if (currentStatus === 'Display') newStatus = 'Draft';

        const supabase = createClient();

        const { error } = await supabase
            .from('listing_items')
            .update({
                status: newStatus,
                deleted_at: null // Restoration safety
            })
            .eq('id', id);

        if (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update status');
        } else {
            fetchData();
        }
    };

    const handleCancelListing = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this listing? The item will be returned to your drafts.')) return;

        const supabase = createClient();

        try {
            // Mark listing as Draft (Soft Delete from Marketplace, but keeps in DB)
            const { error: updateError } = await supabase
                .from('listing_items')
                .update({
                    status: 'Draft',
                    deleted_at: null // Restoration safety 
                })
                .eq('id', id);

            if (updateError) throw updateError;

            fetchData();

        } catch (error) {
            console.error('Failed to cancel listing:', error);
            alert('Failed to cancel listing');
        }
    };

    const handleShipItem = async (listingId: string) => {
        if (!confirm('Are you ready to ship this item?')) return;

        const supabase = createClient();
        const { error } = await supabase
            .from('listing_items')
            .update({ status: 'Shipped' })
            .eq('id', listingId);

        if (error) {
            console.error('Failed to ship item:', error);
            alert('Failed to ship item');
        } else {
            fetchData();
        }
    };



    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter Logic for Workspace
    const filteredShowcaseItems = showcaseItems.filter(item => {
        if (filter === 'All') return true;
        if (filter === 'Draft') return item.status === 'Draft';
        if (filter === 'Active') return item.status === 'Active';
        if (filter === 'Display') return item.status === 'Display';
        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-brand-dark">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
                        {[...Array(10)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!user && !loading) return null;

    return (
        <div className="min-h-screen bg-brand-dark flex flex-col">
            <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-heading font-bold text-white">My Collection</h1>
                    <div className="flex gap-4">
                        <Link
                            href={`/profile/${user.id}`}
                            className="px-4 py-2 bg-brand-platinum/10 text-brand-platinum border border-brand-platinum/20 rounded-lg hover:bg-brand-platinum/20 transition-all font-bold text-sm flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            View Public Profile
                        </Link>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-4 py-2 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 rounded-lg hover:bg-brand-gold/20 transition-all font-bold text-sm flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Add Card
                        </button>
                    </div>
                </div>

                <div className="glass-panel-premium shadow-2xl rounded-2xl border border-white/10">
                    <div className="border-b border-brand-platinum/10">
                        <nav className="-mb-px flex" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('showcase')}
                                className={`${activeTab === 'showcase'
                                    ? 'border-brand-blue text-brand-blue-glow'
                                    : 'border-transparent text-brand-platinum/60 hover:text-brand-platinum hover:border-brand-platinum/30'
                                    } flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm transition-all`}
                            >
                                Workspace
                            </button>
                            <button
                                onClick={() => setActiveTab('listings')}
                                className={`${activeTab === 'listings'
                                    ? 'border-brand-blue text-brand-blue-glow'
                                    : 'border-transparent text-brand-platinum/60 hover:text-brand-platinum hover:border-brand-platinum/30'
                                    } flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm transition-all`}
                            >
                                Selling
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`${activeTab === 'orders'
                                    ? 'border-brand-blue text-brand-blue-glow'
                                    : 'border-transparent text-brand-platinum/60 hover:text-brand-platinum hover:border-brand-platinum/30'
                                    } flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm transition-all`}
                            >
                                Buying
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`${activeTab === 'history'
                                    ? 'border-brand-blue text-brand-blue-glow'
                                    : 'border-transparent text-brand-platinum/60 hover:text-brand-platinum hover:border-brand-platinum/30'
                                    } flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm transition-all`}
                            >
                                History
                            </button>
                            <button
                                onClick={() => setActiveTab('archive')}
                                className={`${activeTab === 'archive'
                                    ? 'border-brand-blue text-brand-blue-glow'
                                    : 'border-transparent text-brand-platinum/60 hover:text-brand-platinum hover:border-brand-platinum/30'
                                    } flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm transition-all`}
                            >
                                Archive
                            </button>
                        </nav>
                    </div>

                    <div className="p-6 min-h-[400px]">
                        {activeTab === 'showcase' && (
                            <>
                                {/* Filter Pills */}
                                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                                    {['All', 'Draft', 'Active', 'Display'].map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setFilter(f as any)}
                                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${filter === f
                                                ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20'
                                                : 'bg-brand-dark-light border border-brand-platinum/10 text-brand-platinum/60 hover:bg-brand-platinum/10 hover:text-white'
                                                }`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
                                    {filteredShowcaseItems.map((item, idx) => (
                                        <ShowcaseCard
                                            key={idx}
                                            item={item}
                                            type={item.type as any} // Pass type 'listed' or 'purchased'
                                            onDelete={handleDeleteCollectionItem}
                                            onCancel={handleCancelListing}
                                            onToggleDisplay={handleToggleDisplay}
                                            is_live_moment={item.is_live_moment || isDebugLive}
                                            live_moments={item.live_moments} // New prop
                                            moment_created_at={item.moment_created_at}
                                        />
                                    ))}
                                    {filteredShowcaseItems.length === 0 && (
                                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-brand-platinum/50">
                                            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                            <p>No items found in {filter}.</p>
                                            {filter === 'All' && (
                                                <button onClick={() => setIsModalOpen(true)} className="mt-4 text-brand-blue hover:text-brand-blue-glow">Add your first card</button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {activeTab === 'listings' && (
                            <div className="grid grid-cols-1 gap-4">
                                {myListings.length === 0 ? (
                                    <div className="text-center py-12 text-brand-platinum/50">
                                        <p>No active sales in progress.</p>
                                        <p className="text-sm mt-2">Items listed for sale are in your Workspace.</p>
                                    </div>
                                ) : (
                                    myListings.map(item => {
                                        // Handle Supabase relation (Array vs Object) and multiple orders
                                        // @ts-ignore
                                        const order = item.orders ? (
                                            Array.isArray(item.orders)
                                                ? (item.orders.find((o: any) => !['completed', 'cancelled'].includes((o.status || '').toLowerCase())) || item.orders[0])
                                                : item.orders
                                        ) : null;

                                        return (
                                            <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-brand-dark-light/30 border border-brand-platinum/5">
                                                <div className="w-20 h-20 rounded-lg overflow-hidden bg-brand-dark-light">
                                                    {item.images?.[0] ? (
                                                        <img src={item.images[0]} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-brand-platinum/20">
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="text-white font-bold">{item.player_name || 'Unknown Item'}</h3>
                                                            <p className="text-brand-platinum/60 text-sm">{item.status}</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {(item.status === 'AwaitingShipment' || item.status === 'TransactionPending' || item.status === 'Shipped') && (
                                                                order ? (
                                                                    <Link
                                                                        href={currentUserId === (item.seller_id || item.orders?.seller_id)
                                                                            ? `/orders/sell/${order.id}`
                                                                            : `/orders/buy/${order.id}`}
                                                                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors shadow-lg ${currentUserId === (item.seller_id || item.orders?.seller_id)
                                                                            ? "text-brand-dark bg-brand-blue hover:bg-brand-blue-light shadow-brand-blue/20"
                                                                            : "text-brand-dark bg-brand-gold hover:bg-brand-gold-light shadow-brand-gold/20"
                                                                            }`}
                                                                    >
                                                                        {currentUserId === (item.seller_id || item.orders?.seller_id) ? "Manage Order" : "View Order"}
                                                                    </Link>
                                                                ) : (
                                                                    <span className="text-xs text-brand-platinum/40 italic">Syncing Order...</span>
                                                                )
                                                            )}
                                                            {/* DEBUG INFO: Visible on Staging Only */}
                                                            <div className="absolute -top-6 right-0 bg-black/80 text-white p-1 text-[10px] whitespace-nowrap z-50">
                                                                Me:{currentUserId?.slice(0, 4)} Seller:{item.seller_id?.slice(0, 4)} OrdSell:{item.orders?.seller_id?.slice(0, 4)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="grid grid-cols-1 gap-4">
                                {myOrders.length === 0 ? (
                                    <div className="text-center py-12 text-brand-platinum/50">
                                        <p>No active purchases in progress.</p>
                                    </div>
                                ) : (
                                    myOrders.map(order => (
                                        <div key={order.id} className="flex gap-4 p-4 rounded-xl bg-brand-dark-light/30 border border-brand-platinum/5">
                                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-brand-dark-light">
                                                {order.listing?.images?.[0] ? (
                                                    <img src={order.listing.images[0]} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-brand-platinum/20">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-white font-bold">{order.listing?.player_name || 'Unknown Item'}</h3>
                                                        <p className="text-brand-platinum/60 text-sm">
                                                            {order.status === 'shipped' ? 'Shipped - On the way' :
                                                                order.status === 'completed' ? 'Delivered & Completed' :
                                                                    order.status === 'paid' || order.status === 'awaiting_shipping' ? 'Awaiting Shipment' :
                                                                        order.status === 'pending' ? 'Transaction Pending' :
                                                                            'Purchased'}
                                                        </p>
                                                    </div>
                                                    {['paid', 'awaiting_shipping', 'shipped', 'delivered'].includes(order.status?.toLowerCase()) ? (
                                                        <Link
                                                            href={`/orders/buy/${order.id}`}
                                                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors shadow-lg ${order.status === 'shipped'
                                                                ? 'text-brand-dark bg-brand-gold hover:bg-brand-gold-light shadow-brand-gold/20'
                                                                : 'text-brand-platinum/60 bg-brand-dark-light border border-brand-platinum/10'
                                                                }`}
                                                        >
                                                            {order.status === 'shipped' ? 'View & Receive' : 'View Order'}
                                                        </Link>
                                                    ) : (
                                                        <span
                                                            className="px-3 py-1 text-xs font-bold text-brand-platinum/40 bg-brand-dark-light border border-brand-platinum/10 rounded-lg cursor-not-allowed"
                                                        >
                                                            Processing
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div>
                                <div className="flex gap-4 mb-6 border-b border-brand-platinum/10 pb-4">
                                    <button
                                        onClick={() => setHistoryTab('sold')}
                                        className={`text-sm font-bold transition-colors ${historyTab === 'sold' ? 'text-brand-blue' : 'text-brand-platinum/60 hover:text-brand-platinum'
                                            }`}
                                    >
                                        Sold History
                                    </button>
                                    <button
                                        onClick={() => setHistoryTab('purchased')}
                                        className={`text-sm font-bold transition-colors ${historyTab === 'purchased' ? 'text-brand-blue' : 'text-brand-platinum/60 hover:text-brand-platinum'
                                            }`}
                                    >
                                        Purchase History
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {historyTab === 'sold' ? (
                                        historySold.length === 0 ? (
                                            <div className="text-center py-12 text-brand-platinum/50">
                                                <p>No sold items history.</p>
                                            </div>
                                        ) : (
                                            historySold.map(item => (
                                                <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-brand-dark-light/30 border border-brand-platinum/5 opacity-75">
                                                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-brand-dark-light grayscale">
                                                        {item.images?.[0] ? (
                                                            <img src={item.images[0]} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-brand-platinum/20">
                                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <h3 className="text-white font-bold">{item.player_name || 'Unknown Item'}</h3>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <p className="text-brand-platinum/60 text-xs italic">Sold - Completed</p>
                                                                    {/* @ts-ignore */}
                                                                    {item.orders && (
                                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-platinum/10 text-brand-platinum/40">
                                                                            {/* @ts-ignore */}
                                                                            {formatDate(Array.isArray(item.orders) ? item.orders[0]?.completed_at : item.orders?.completed_at)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="text-brand-gold font-bold">
                                                                {/* @ts-ignore */}
                                                                ¥{item.orders?.total_amount?.toLocaleString() || item.price?.toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )
                                    ) : (
                                        historyPurchased.length === 0 ? (
                                            <div className="text-center py-12 text-brand-platinum/50">
                                                <p>No purchase history.</p>
                                            </div>
                                        ) : (
                                            historyPurchased.map(order => (
                                                <div key={order.id} className="flex gap-4 p-4 rounded-xl bg-brand-dark-light/30 border border-brand-platinum/5 opacity-75">
                                                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-brand-dark-light grayscale">
                                                        <img src={order.listing?.images[0]} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <h3 className="text-white font-bold">{order.listing?.player_name || 'Unknown Item'}</h3>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <p className="text-brand-platinum/60 text-xs italic">Purchased - Completed</p>
                                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-platinum/10 text-brand-platinum/40">
                                                                        {(order as any).completed_at ? formatDate((order as any).completed_at) : formatDate(order.created_at)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="text-brand-gold font-bold">
                                                                ¥{order.total_amount?.toLocaleString() || order.listing?.price?.toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                        {activeTab === 'archive' && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
                                {archivedItems.map((item) => (
                                    <ShowcaseCard
                                        key={item.id}
                                        item={item}
                                        isArchived={true}
                                        onRestore={handleRestoreCollectionItem}
                                        onDelete={handleDeleteCollectionItem} // Optional: if physical delete ever needed
                                        is_live_moment={item.is_live_moment || isDebugLive}
                                        live_moments={item.live_moments} // New prop
                                        moment_created_at={item.moment_created_at}
                                    />
                                ))}
                                {archivedItems.length === 0 && (
                                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-brand-platinum/50">
                                        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                                        <p>Your archive is empty.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <Footer />
                <AddToShowcaseModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onAdded={fetchData}
                />

                {
                    showAnimation && (
                        <PurchaseAnimation
                            onComplete={() => {
                                setShowAnimation(false);
                                fetchData();
                            }}
                        />
                    )
                }
            </div>
        </div>
    );
}

export default function MyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-brand-dark flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div></div>}>
            <MyPageContent />
        </Suspense>
    );
}
