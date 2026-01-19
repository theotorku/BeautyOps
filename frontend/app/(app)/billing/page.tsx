'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/config';
import { createClient } from '@/lib/supabase/client';

type Tab = 'subscription' | 'usage' | 'payment' | 'history';

export default function BillingPage() {
    const [activeTab, setActiveTab] = useState<Tab>('subscription');
    const [subscription, setSubscription] = useState<any>(null);
    const [usage, setUsage] = useState<any>(null);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

    const supabase = createClient();

    useEffect(() => {
        fetchBillingData();
    }, []);

    const fetchBillingData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setLoading(true);
        try {
            // Fetch subscription
            const subRes = await fetch(`${API_URL}/api/billing/subscription/${user.id}`);
            const subData = await subRes.json();
            setSubscription(subData.subscription);

            // Fetch usage
            const usageRes = await fetch(`${API_URL}/api/usage/stats?user_id=${user.id}`);
            const usageData = await usageRes.json();
            setUsage(usageData);

            // Fetch invoices
            const invoicesRes = await fetch(`${API_URL}/api/billing/invoices/${user.id}`);
            const invoicesData = await invoicesRes.json();
            setInvoices(invoicesData.invoices || []);
        } catch (error) {
            console.error('Error fetching billing data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (priceId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setActionLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/billing/create-checkout-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    price_id: priceId,
                    user_id: user.id,
                    email: user.email
                })
            });
            const data = await res.json();
            window.location.href = data.url;
        } catch (error) {
            console.error('Error creating checkout session:', error);
            setActionLoading(false);
        }
    };

    const handleManageSubscription = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setActionLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/billing/create-portal-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id })
            });
            const data = await res.json();
            window.location.href = data.url;
        } catch (error) {
            console.error('Error creating portal session:', error);
            setActionLoading(false);
        }
    };

    const tiers = {
        solo: {
            name: 'Solo AE',
            monthly: { price: 49, priceId: 'price_1SrOcs00JoLiYcMMIsqjZ1J4' },
            yearly: { price: 470, priceId: 'price_1SrOc800JoLiYcMMnzQFRXXq' },
            features: [
                'Unlimited Store Visit Reports',
                'Basic Proactive Briefings',
                '10 AI POS Analysis Credits/mo',
                'Basic Calendar Sync'
            ]
        },
        pro: {
            name: 'Pro AE',
            monthly: { price: 149, priceId: 'price_1SrOdQ00JoLiYcMMzbeQJIUQ' },
            yearly: { price: 1430, priceId: 'price_1SrOeA00JoLiYcMMA200uwXC' },
            features: [
                'Everything in Solo',
                'Unlimited AI POS Analysis',
                'Advanced Proactive Briefing Engine',
                'Smart Calendar Time-Blocking',
                'Training & Content Generators',
                'Team Collaboration Hub'
            ],
            popular: true
        }
    };

    if (loading) {
        return (
            <div style={{ animation: 'fadeIn 0.8s ease-out' }}>
                <h1>Billing & Subscription</h1>
                <p style={{ opacity: 0.6 }}>Loading...</p>
            </div>
        );
    }

    return (
        <div style={{ animation: 'fadeIn 0.8s ease-out' }}>
            <h1>Billing & Subscription</h1>
            <p style={{ opacity: 0.6, marginBottom: '2rem' }}>
                Manage your subscription, usage, and payment methods.
            </p>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
                borderBottom: '1px solid var(--glass-border)',
                paddingBottom: '0.5rem'
            }}>
                {(['subscription', 'usage', 'payment', 'history'] as Tab[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            background: activeTab === tab ? 'var(--primary-gradient)' : 'transparent',
                            color: activeTab === tab ? '#000' : 'var(--foreground)',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            fontSize: '0.95rem',
                            textTransform: 'capitalize',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            transition: 'var(--transition)',
                            fontWeight: activeTab === tab ? '700' : '400'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
                <div>
                    {subscription ? (
                        <div className="card" style={{ marginBottom: '2rem', animation: 'slideUp 0.6s ease-out' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: '800' }}>
                                        Current Plan: {subscription.subscription_tier.replace('_', ' ').toUpperCase()}
                                    </h2>
                                    <p style={{ opacity: 0.6, fontSize: '1rem', marginBottom: '0.5rem' }}>
                                        Status: <span style={{ color: subscription.status === 'active' ? '#4ade80' : '#f87171', fontWeight: '600' }}>{subscription.status}</span>
                                    </p>
                                    <p style={{ opacity: 0.6, fontSize: '1rem' }}>
                                        Billing: {subscription.billing_interval}
                                    </p>
                                    <p style={{ opacity: 0.5, fontSize: '0.9rem', marginTop: '0.75rem' }}>
                                        Next billing date: {new Date(subscription.current_period_end).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={handleManageSubscription}
                                    disabled={actionLoading}
                                    style={{
                                        background: 'var(--primary-gradient)',
                                        padding: '1rem 2rem',
                                        fontSize: '1rem',
                                        fontWeight: '700'
                                    }}
                                >
                                    {actionLoading ? 'Loading...' : 'Manage Subscription'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Billing Period Toggle */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '0',
                                marginBottom: '3rem',
                                padding: '0.5rem',
                                background: 'var(--secondary)',
                                borderRadius: '12px',
                                width: 'fit-content',
                                margin: '0 auto 3rem',
                                border: '1px solid var(--glass-border)'
                            }}>
                                <button
                                    onClick={() => setBillingPeriod('monthly')}
                                    style={{
                                        background: billingPeriod === 'monthly' ? 'var(--primary-gradient)' : 'transparent',
                                        color: billingPeriod === 'monthly' ? '#000' : 'var(--foreground)',
                                        padding: '0.75rem 2rem',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        transition: 'var(--transition)'
                                    }}
                                >
                                    Monthly
                                </button>
                                <button
                                    onClick={() => setBillingPeriod('yearly')}
                                    style={{
                                        background: billingPeriod === 'yearly' ? 'var(--primary-gradient)' : 'transparent',
                                        color: billingPeriod === 'yearly' ? '#000' : 'var(--foreground)',
                                        padding: '0.75rem 2rem',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        transition: 'var(--transition)',
                                        position: 'relative'
                                    }}
                                >
                                    Yearly
                                    <span style={{
                                        fontSize: '0.7rem',
                                        position: 'absolute',
                                        top: '-10px',
                                        right: '-10px',
                                        background: '#4ade80',
                                        color: '#000',
                                        padding: '3px 8px',
                                        borderRadius: '6px',
                                        fontWeight: '900',
                                        letterSpacing: '0.5px'
                                    }}>SAVE 20%</span>
                                </button>
                            </div>

                            {/* Pricing Cards */}
                            <div className="grid">
                                {Object.entries(tiers).map(([key, tier]) => {
                                    const price = billingPeriod === 'monthly' ? tier.monthly : tier.yearly;
                                    const monthlyPrice = billingPeriod === 'yearly' ? (price.price / 12).toFixed(2) : price.price;

                                    return (
                                        <div
                                            key={key}
                                            className="card"
                                            style={{
                                                border: tier.popular ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                position: 'relative',
                                                background: tier.popular ? 'linear-gradient(180deg, rgba(229, 185, 196, 0.05) 0%, rgba(15, 15, 19, 1) 100%)' : 'var(--secondary)'
                                            }}
                                        >
                                            {tier.popular && (
                                                <span style={{
                                                    position: 'absolute',
                                                    top: '-14px',
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    background: 'var(--primary-gradient)',
                                                    color: '#000',
                                                    padding: '0.4rem 1.25rem',
                                                    borderRadius: '20px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '900',
                                                    boxShadow: '0 4px 12px rgba(229, 185, 196, 0.4)',
                                                    letterSpacing: '1px'
                                                }}>
                                                    RECOMMENDED
                                                </span>
                                            )}
                                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: '800' }}>{tier.name}</h3>
                                            <div style={{
                                                fontSize: '3rem',
                                                fontWeight: '900',
                                                marginBottom: '1rem',
                                                background: tier.popular ? 'var(--primary-gradient)' : 'none',
                                                WebkitBackgroundClip: tier.popular ? 'text' : 'none',
                                                WebkitTextFillColor: tier.popular ? 'transparent' : 'inherit'
                                            }}>
                                                ${monthlyPrice}
                                                <span style={{
                                                    fontSize: '1.1rem',
                                                    opacity: 0.4,
                                                    fontWeight: '400',
                                                    WebkitTextFillColor: 'var(--foreground)'
                                                }}>/mo</span>
                                            </div>
                                            {billingPeriod === 'yearly' && (
                                                <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '1.5rem' }}>
                                                    Billed ${price.price}/year
                                                </p>
                                            )}
                                            <ul style={{ listStyle: 'none', marginBottom: '1.5rem', flex: 1 }}>
                                                {tier.features.map((feature, i) => (
                                                    <li key={i} style={{ marginBottom: '0.85rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                                        <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>✓</span>
                                                        <span style={{ fontSize: '0.95rem', opacity: 0.9 }}>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <button
                                                onClick={() => handleSubscribe(price.priceId)}
                                                disabled={actionLoading}
                                                style={{
                                                    width: '100%',
                                                    background: tier.popular ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.05)',
                                                    border: tier.popular ? 'none' : '1px solid var(--glass-border)',
                                                    color: tier.popular ? '#000' : 'var(--foreground)',
                                                    padding: '1.1rem',
                                                    fontSize: '1rem',
                                                    fontWeight: '700',
                                                    boxShadow: tier.popular ? '0 8px 24px rgba(229, 185, 196, 0.3)' : 'none'
                                                }}
                                            >
                                                {actionLoading ? 'Loading...' : 'Subscribe'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Usage Tab */}
            {activeTab === 'usage' && usage && (
                <div className="card" style={{ animation: 'slideUp 0.6s ease-out' }}>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '2rem', fontWeight: '800' }}>Current Usage</h2>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.1rem' }}>AI POS Analysis Credits</span>
                            <span style={{ fontWeight: '700', fontSize: '1.2rem', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                {usage.pos_credits_used} / {usage.pos_credits_limit === -1 ? '∞' : usage.pos_credits_limit}
                            </span>
                        </div>
                        <div style={{
                            background: 'rgba(255,255,255,0.05)',
                            height: '14px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1px solid var(--glass-border)'
                        }}>
                            <div style={{
                                background: 'var(--primary-gradient)',
                                width: usage.pos_credits_limit === -1 ? '100%' : `${Math.min((usage.pos_credits_used / usage.pos_credits_limit) * 100, 100)}%`,
                                height: '100%',
                                transition: 'width 0.5s ease-out',
                                boxShadow: '0 0 12px rgba(229, 185, 196, 0.4)'
                            }}></div>
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.1rem' }}>Proactive Briefings</span>
                            <span style={{ fontWeight: '700', fontSize: '1.2rem', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                {usage.briefings_used || 0} / {usage.briefings_limit === -1 ? '∞' : usage.briefings_limit || 0}
                            </span>
                        </div>
                        <div style={{
                            background: 'rgba(255,255,255,0.05)',
                            height: '14px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1px solid var(--glass-border)'
                        }}>
                            <div style={{
                                background: 'var(--primary-gradient)',
                                width: usage.briefings_limit === -1 ? '100%' : `${Math.min(((usage.briefings_used || 0) / (usage.briefings_limit || 1)) * 100, 100)}%`,
                                height: '100%',
                                transition: 'width 0.5s ease-out',
                                boxShadow: '0 0 12px rgba(229, 185, 196, 0.4)'
                            }}></div>
                        </div>
                    </div>

                    <p style={{ fontSize: '0.9rem', opacity: 0.5, marginTop: '2rem', textAlign: 'center' }}>
                        Usage resets on your billing cycle date
                    </p>
                </div>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'payment' && (
                <div className="card" style={{ animation: 'slideUp 0.6s ease-out', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', fontWeight: '800' }}>Payment Methods</h2>
                    <p style={{ opacity: 0.6, marginBottom: '2rem', fontSize: '1.05rem' }}>
                        Manage your payment methods securely through the Stripe Customer Portal
                    </p>
                    <button
                        onClick={handleManageSubscription}
                        disabled={actionLoading || !subscription}
                        style={{
                            background: subscription ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.05)',
                            padding: '1.1rem 2.5rem',
                            fontSize: '1rem',
                            fontWeight: '700',
                            margin: '0 auto'
                        }}
                    >
                        {actionLoading ? 'Loading...' : 'Manage Payment Methods'}
                    </button>
                    {!subscription && (
                        <p style={{ fontSize: '0.9rem', opacity: 0.5, marginTop: '1.5rem' }}>
                            Subscribe to a plan first to manage payment methods
                        </p>
                    )}
                </div>
            )}

            {/* Billing History Tab */}
            {activeTab === 'history' && (
                <div className="card" style={{ animation: 'slideUp 0.6s ease-out' }}>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '2rem', fontWeight: '800' }}>Billing History</h2>

                    {invoices.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                            <p style={{ opacity: 0.6, fontSize: '1.1rem' }}>No invoices yet</p>
                            <p style={{ opacity: 0.4, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                Your billing history will appear here once you subscribe
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {invoices.map((invoice) => (
                                <div
                                    key={invoice.id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1.25rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--glass-border)',
                                        transition: 'var(--transition)',
                                        flexWrap: 'wrap',
                                        gap: '1rem'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--primary)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--glass-border)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <div>
                                        <p style={{ fontWeight: '700', marginBottom: '0.5rem', fontSize: '1.05rem' }}>
                                            {new Date(invoice.period_start).toLocaleDateString()} - {new Date(invoice.period_end).toLocaleDateString()}
                                        </p>
                                        <p style={{ fontSize: '0.9rem', opacity: 0.6 }}>
                                            Status: <span style={{ color: invoice.status === 'paid' ? '#4ade80' : '#f87171', fontWeight: '600' }}>{invoice.status}</span>
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                            ${(invoice.amount_paid / 100).toFixed(2)}
                                        </p>
                                        {invoice.invoice_pdf && (
                                            <a
                                                href={invoice.invoice_pdf}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ fontSize: '0.9rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}
                                            >
                                                Download PDF ↗
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
