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
    const getStyle = () => {
        const baseStyle: React.CSSProperties = {
            background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: variant === 'circle' ? '50%' : '12px',
        };

        switch (variant) {
            case 'card':
                return { ...baseStyle, height: height || '200px', width: width || '100%' };
            case 'text':
                return { ...baseStyle, height: height || '1rem', width: width || '100%', marginBottom: '0.5rem' };
            case 'circle':
                return { ...baseStyle, height: height || '48px', width: width || '48px' };
            case 'button':
                return { ...baseStyle, height: height || '44px', width: width || '120px' };
            default:
                return baseStyle;
        }
    };

    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="loading-skeleton"
                    style={getStyle()}
                    aria-label="Loading..."
                    role="status"
                />
            ))}
            <style jsx>{`
                @keyframes shimmer {
                    0% {
                        background-position: -200% 0;
                    }
                    100% {
                        background-position: 200% 0;
                    }
                }
            `}</style>
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
                    <div style={{ marginTop: '1rem' }}>
                        <LoadingSkeleton variant="button" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Array.from({ length: rows }).map((_, index) => (
                <div
                    key={index}
                    style={{
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'center',
                        padding: '1rem',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '12px',
                    }}
                >
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
