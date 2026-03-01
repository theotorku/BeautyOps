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
        <div className="empty-state">
            <div className="empty-state-icon">
                {icon}
            </div>
            <h3 className="empty-state-title">
                {title}
            </h3>
            <p className="empty-state-description">
                {description}
            </p>
            {(actionLabel && (actionHref || onAction)) && (
                <>
                    {actionHref ? (
                        <Link href={actionHref} className="empty-state-action">
                            {actionLabel} →
                        </Link>
                    ) : (
                        <button onClick={onAction}>
                            {actionLabel}
                        </button>
                    )}
                </>
            )}
        </div>
    );
}

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
