'use client';

interface LoadingSkeletonProps {
    variant?: 'card' | 'text' | 'circle' | 'button';
    count?: number;
    height?: string;
    width?: string;
}

export default function LoadingSkeleton({
    variant = 'card',
    count = 1,
    height,
    width,
}: LoadingSkeletonProps) {
    const getClassName = () => {
        switch (variant) {
            case 'card': return 'loading-skeleton loading-skeleton--card';
            case 'text': return 'loading-skeleton loading-skeleton--text';
            case 'circle': return 'loading-skeleton loading-skeleton--circle';
            case 'button': return 'loading-skeleton loading-skeleton--button';
            default: return 'loading-skeleton';
        }
    };

    const getOverrideStyle = () => {
        const style: React.CSSProperties = {};
        if (height) style.height = height;
        if (width) style.width = width;
        return style;
    };

    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className={getClassName()}
                    style={getOverrideStyle()}
                    aria-label="Loading..."
                    role="status"
                />
            ))}
        </>
    );
}

export function CardSkeleton({ count = 1 }: { count?: number }) {
    return (
        <div className="grid">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="card">
                    <LoadingSkeleton variant="text" height="24px" width="60%" />
                    <LoadingSkeleton variant="text" height="16px" width="100%" count={3} />
                    <div className="skeleton-card-footer">
                        <LoadingSkeleton variant="button" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="skeleton-table-body">
            {Array.from({ length: rows }).map((_, index) => (
                <div key={index} className="skeleton-table-row">
                    <LoadingSkeleton variant="circle" height="40px" width="40px" />
                    <div style={{ flex: 1 }}>
                        <LoadingSkeleton variant="text" height="16px" width="80%" />
                        <LoadingSkeleton variant="text" height="12px" width="60%" />
                    </div>
                    <LoadingSkeleton variant="button" width="100px" />
                </div>
            ))}
        </div>
    );
}
