'use client';

import Link from 'next/link';

interface EmptyStateProps {
    icon?: string;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
}

export default function EmptyState({
    icon = '📭',
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
}: EmptyStateProps) {
    return (
        <div
            className="empty-state"
            style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '24px',
                border: '1px dashed var(--glass-border)',
            }}
        >
            <div
                style={{
                    fontSize: '4rem',
                    marginBottom: '1.5rem',
                    opacity: 0.5,
                }}
            >
                {icon}
            </div>
            <h3
                style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    marginBottom: '0.75rem',
                    color: 'var(--foreground)',
                }}
            >
                {title}
            </h3>
            <p
                style={{
                    opacity: 0.6,
                    fontSize: '1rem',
                    marginBottom: '2rem',
                    maxWidth: '400px',
                    margin: '0 auto 2rem',
                }}
            >
                {description}
            </p>
            {(actionLabel && (actionHref || onAction)) && (
                <>
                    {actionHref ? (
                        <Link
                            href={actionHref}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: 'var(--primary-gradient)',
                                color: '#000',
                                padding: '1rem 2rem',
                                borderRadius: '12px',
                                fontWeight: '700',
                                textDecoration: 'none',
                                transition: 'var(--transition)',
                            }}
                        >
                            {actionLabel} →
                        </Link>
                    ) : (
                        <button
                            onClick={onAction}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                            }}
                        >
                            {actionLabel}
                        </button>
                    )}
                </>
            )}
        </div>
    );
}

// Specific empty states for common scenarios
export function NoInvoicesState() {
    return (
        <EmptyState
            icon="🧾"
            title="No invoices yet"
            description="Your billing history will appear here once you subscribe to a plan."
            actionLabel="View Plans"
            actionHref="/pricing"
        />
    );
}

export function NoSubscriptionState() {
    return (
        <EmptyState
            icon="💳"
            title="No active subscription"
            description="Choose a plan to unlock all features and start your 14-day free trial."
            actionLabel="Browse Plans"
            actionHref="/pricing"
        />
    );
}

export function NoDataState({ type = 'data' }: { type?: string }) {
    return (
        <EmptyState
            icon="📊"
            title={`No ${type} yet`}
            description={`Start using BeautyOps AI to see your ${type} here.`}
        />
    );
}
