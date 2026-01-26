'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: '#0f0f13',
                    color: '#f8fafc',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '16px',
                    fontSize: '0.95rem',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                },
                success: {
                    iconTheme: {
                        primary: '#4ade80',
                        secondary: '#0f0f13',
                    },
                    style: {
                        borderLeft: '4px solid #4ade80',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#f87171',
                        secondary: '#0f0f13',
                    },
                    style: {
                        borderLeft: '4px solid #f87171',
                    },
                },
                loading: {
                    iconTheme: {
                        primary: '#e5b9c4',
                        secondary: '#0f0f13',
                    },
                    style: {
                        borderLeft: '4px solid #e5b9c4',
                    },
                },
            }}
        />
    );
}
