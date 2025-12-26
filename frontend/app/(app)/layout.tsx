'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const navItems = [
        { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
        { href: '/visits', icon: '🎙️', label: 'Store Visits' },
        { href: '/pos', icon: '📊', label: 'POS Analysis' },
        { href: '/training', icon: '📖', label: 'Training' },
        { href: '/integrations', icon: '🔗', label: 'Integrations' },
    ];

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="logo">BeautyOps AI</div>
                <nav className="nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                        >
                            <span>{item.icon}</span> {item.label}
                        </Link>
                    ))}
                    <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                        <Link
                            href="/pricing"
                            className="nav-item"
                            style={{
                                background: 'rgba(229, 185, 196, 0.05)',
                                color: 'var(--primary)',
                                opacity: 1,
                                border: '1px solid var(--glass-border)'
                            }}
                        >
                            <span>✨</span> Plans & Billing
                        </Link>
                    </div>
                </nav>
            </aside>
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
