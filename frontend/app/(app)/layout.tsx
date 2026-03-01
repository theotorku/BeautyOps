import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { logout } from '@/app/auth/actions';
import MobileMenu from '@/components/MobileMenu';
import NavItem from '@/components/NavItem';
import '../mobile.css';

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const navItems = [
        { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
        { href: '/briefing', icon: '🤖', label: 'AI Briefing' },
        { href: '/visits', icon: '🎙️', label: 'Store Visits' },
        { href: '/pos', icon: '📊', label: 'POS Analysis' },
        { href: '/training', icon: '📖', label: 'Training' },
        { href: '/integrations', icon: '🔗', label: 'Integrations' },
        { href: '/billing', icon: '💳', label: 'Billing' },
    ];

    return (
        <div className="dashboard-layout">
            <MobileMenu />
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="logo">BeautyOps AI</div>
                    <span className="sidebar-edition">Intelligence Platform</span>
                </div>
                <nav className="nav">
                    {navItems.map((item) => (
                        <NavItem
                            key={item.href}
                            href={item.href}
                            icon={item.icon}
                            label={item.label}
                        />
                    ))}
                    <div className="nav-divider">
                        <NavItem
                            href="/pricing"
                            icon="✨"
                            label="Pricing Plans"
                        />
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
            <main className="main-content" id="main-content">
                {children}
            </main>
        </div>
    );
}
