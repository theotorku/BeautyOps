'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { authenticatedFetch } from '@/lib/api';
import toast from 'react-hot-toast';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import { NoInvoicesState } from '@/components/EmptyState';

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
            const subRes = await authenticatedFetch(`/api/billing/subscription/${user.id}`);
            const subData = await subRes.json();
            setSubscription(subData.subscription);

            const usageRes = await authenticatedFetch(`/api/usage/stats?user_id=${user.id}`);
            const usageData = await usageRes.json();
            setUsage(usageData);

            const invoicesRes = await authenticatedFetch(`/api/billing/invoices/${user.id}`);
            const invoicesData = await invoicesRes.json();
            setInvoices(invoicesData.invoices || []);
        } catch (error) {
            toast.error('Failed to load billing data. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (priceId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setActionLoading(true);
        const loadingToast = toast.loading('Creating checkout session...');
        try {
            const res = await authenticatedFetch('/api/billing/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    price_id: priceId,
                    email: user.email
                })
            });
            const data = await res.json();
            toast.dismiss(loadingToast);
            toast.success('Redirecting to checkout...');
            window.location.href = data.url;
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error('Failed to create checkout session. Please try again.');
            setActionLoading(false);
        }
    };

    const handleManageSubscription = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setActionLoading(true);
        const loadingToast = toast.loading('Opening subscription portal...');
        try {
            const res = await authenticatedFetch('/api/billing/create-portal-session', {
                method: 'POST',
            });
            const data = await res.json();
            toast.dismiss(loadingToast);
            toast.success('Redirecting to subscription portal...');
            window.location.href = data.url;
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error('Failed to open subscription portal. Please try again.');
            setActionLoading(false);
        }
    };

    const tiers = {
        solo: {
            name: 'Solo AE',
            monthly: { price: 49, priceId: 'price_1SrOOH03NjWbp5DbcEqGXxbS' },
            yearly: { price: 470, priceId: 'price_1SrOSl03NjWbp5DbC9qZ931h' },
            features: [
                'Unlimited Store Visit Reports',
                'Basic Proactive Briefings',
                '10 AI POS Analysis Credits/mo',
                'Basic Calendar Sync'
            ],
            popular: false
        },
        pro: {
            name: 'Pro AE',
            monthly: { price: 149, priceId: 'price_1SrMWs03NjWbp5DbTjJcBfS1' },
            yearly: { price: 1430, priceId: 'price_1SrOTa03NjWbp5Db9workK1L' },
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
            <div className="page-fade-in">
                <h1>Billing & Subscription</h1>
                <p className="page-subtitle" style={{ marginBottom: '2rem' }}>
                    Loading your billing information...
                </p>
                <CardSkeleton count={2} />
            </div>
        );
    }

    return (
        <div className="page-fade-in">
            <h1>Billing & Subscription</h1>
            <p className="page-subtitle" style={{ marginBottom: '2rem' }}>
                Manage your subscription, usage, and payment methods.
            </p>

            {/* Tabs */}
            <div className="tab-bar">
                {(['subscription', 'usage', 'payment', 'history'] as Tab[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
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
                            <div className="subscription-header">
                                <div>
                                    <h2 className="subscription-plan-name">
                                        Current Plan: {subscription.subscription_tier.replace('_', ' ').toUpperCase()}
                                    </h2>
                                    <p className="subscription-detail">
                                        Status: <span className={subscription.status === 'active' ? 'status-active' : 'status-canceled'}>{subscription.status}</span>
                                    </p>
                                    <p className="subscription-detail">
                                        Billing: {subscription.billing_interval}
                                    </p>
                                    <p style={{ opacity: 0.5, fontSize: '0.9rem', marginTop: '0.75rem' }}>
                                        Next billing date: {new Date(subscription.current_period_end).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={handleManageSubscription}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? 'Loading...' : 'Manage Subscription'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Billing Period Toggle */}
                            <div className="billing-period-toggle">
                                <button
                                    onClick={() => setBillingPeriod('monthly')}
                                    className="billing-period-btn"
                                    style={{
                                        background: billingPeriod === 'monthly' ? 'var(--primary-gradient)' : 'transparent',
                                        color: billingPeriod === 'monthly' ? '#000' : 'var(--foreground)'
                                    }}
                                >
                                    Monthly
                                </button>
                                <button
                                    onClick={() => setBillingPeriod('yearly')}
                                    className="billing-period-btn"
                                    style={{
                                        background: billingPeriod === 'yearly' ? 'var(--primary-gradient)' : 'transparent',
                                        color: billingPeriod === 'yearly' ? '#000' : 'var(--foreground)'
                                    }}
                                >
                                    Yearly
                                    <span className="billing-save-badge">SAVE 20%</span>
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
                                            className={`card plan-card ${tier.popular ? 'plan-card--popular' : ''}`}
                                        >
                                            {tier.popular && (
                                                <span className="plan-recommended-badge">
                                                    RECOMMENDED
                                                </span>
                                            )}
                                            <h3 className="plan-name">{tier.name}</h3>
                                            <div className={`plan-price ${tier.popular ? 'plan-price--gradient' : ''}`}>
                                                ${monthlyPrice}
                                                <span className="plan-price-period">/mo</span>
                                            </div>
                                            {billingPeriod === 'yearly' && (
                                                <p className="plan-billing-note">
                                                    Billed ${price.price}/year
                                                </p>
                                            )}
                                            <ul className="plan-features-list">
                                                {tier.features.map((feature, i) => (
                                                    <li key={i} className="plan-feature-item">
                                                        <span className="plan-feature-check">✓</span>
                                                        <span style={{ fontSize: '0.95rem', opacity: 0.9 }}>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <button
                                                onClick={() => handleSubscribe(price.priceId)}
                                                disabled={actionLoading}
                                                className={`btn-subscribe ${tier.popular ? 'btn-subscribe--primary' : 'btn-subscribe--ghost'}`}
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
                    <h2 className="billing-section-heading">Current Usage</h2>

                    <div className="usage-meter-group">
                        <div className="usage-meter-header">
                            <span className="usage-meter-label">AI POS Analysis Credits</span>
                            <span className="usage-meter-value">
                                {usage.pos_credits_used} / {usage.pos_credits_limit === -1 ? '∞' : usage.pos_credits_limit}
                            </span>
                        </div>
                        <div className="usage-meter-bar">
                            <div
                                className="usage-meter-fill"
                                style={{
                                    width: usage.pos_credits_limit === -1 ? '100%' : `${Math.min((usage.pos_credits_used / usage.pos_credits_limit) * 100, 100)}%`
                                }}
                            ></div>
                        </div>
                    </div>

                    <div className="usage-meter-group">
                        <div className="usage-meter-header">
                            <span className="usage-meter-label">Proactive Briefings</span>
                            <span className="usage-meter-value">
                                {usage.briefings_used || 0} / {usage.briefings_limit === -1 ? '∞' : usage.briefings_limit || 0}
                            </span>
                        </div>
                        <div className="usage-meter-bar">
                            <div
                                className="usage-meter-fill"
                                style={{
                                    width: usage.briefings_limit === -1 ? '100%' : `${Math.min(((usage.briefings_used || 0) / (usage.briefings_limit || 1)) * 100, 100)}%`
                                }}
                            ></div>
                        </div>
                    </div>

                    <p className="usage-reset-note">
                        Usage resets on your billing cycle date
                    </p>
                </div>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'payment' && (
                <div className="card text-center" style={{ animation: 'slideUp 0.6s ease-out' }}>
                    <h2 className="billing-section-heading">Payment Methods</h2>
                    <p className="page-subtitle" style={{ marginBottom: '2rem' }}>
                        Manage your payment methods securely through the Stripe Customer Portal
                    </p>
                    <button
                        onClick={handleManageSubscription}
                        disabled={actionLoading || !subscription}
                        style={{ margin: '0 auto' }}
                    >
                        {actionLoading ? 'Loading...' : 'Manage Payment Methods'}
                    </button>
                    {!subscription && (
                        <p className="billing-helper-note">
                            Subscribe to a plan first to manage payment methods
                        </p>
                    )}
                </div>
            )}

            {/* Billing History Tab */}
            {activeTab === 'history' && (
                <div className="card" style={{ animation: 'slideUp 0.6s ease-out' }}>
                    <h2 className="billing-section-heading">Billing History</h2>

                    {invoices.length === 0 ? (
                        <NoInvoicesState />
                    ) : (
                        <div className="invoice-list">
                            {invoices.map((invoice) => (
                                <div key={invoice.id} className="invoice-item">
                                    <div>
                                        <p style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.05rem' }}>
                                            {new Date(invoice.period_start).toLocaleDateString()} - {new Date(invoice.period_end).toLocaleDateString()}
                                        </p>
                                        <p style={{ fontSize: '0.9rem', opacity: 0.6 }}>
                                            Status: <span className={invoice.status === 'paid' ? 'status-paid' : 'status-failed'}>{invoice.status}</span>
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p className="invoice-amount">
                                            ${(invoice.amount_paid / 100).toFixed(2)}
                                        </p>
                                        {invoice.invoice_pdf && (
                                            <a
                                                href={invoice.invoice_pdf}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ fontSize: '0.9rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}
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
