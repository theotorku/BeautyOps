import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { logout } from '@/app/auth/actions';

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

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
                            className="nav-item"
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

                {/* User Menu */}
                <div className="user-menu">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="user-email">{user?.email || 'User'}</span>
                    </div>
                    <form action={logout}>
                        <button type="submit" className="logout-btn">
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
