'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItemProps {
    href: string;
    icon: string;
    label: string;
}

export default function NavItem({ href, icon, label }: NavItemProps) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={`nav-item ${isActive ? 'active' : ''}`}
        >
            <span>{icon}</span> {label}
        </Link>
    );
}
