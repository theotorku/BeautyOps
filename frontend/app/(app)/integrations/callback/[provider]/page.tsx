'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { API_URL } from '@/lib/config';
import { authenticatedFetch } from '@/lib/api';

export default function CalendarCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Connecting your calendar...');

    useEffect(() => {
        handleCallback();
    }, []);

    const handleCallback = async () => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const provider = params.provider as string;

        // Check for OAuth error
        if (error) {
            setStatus('error');
            setMessage(`Authorization failed: ${error}`);
            setTimeout(() => router.push('/integrations'), 3000);
            return;
        }

        // Check for missing code or state
        if (!code || !state) {
            setStatus('error');
            setMessage('Missing authorization code or state parameter');
            setTimeout(() => router.push('/integrations'), 3000);
            return;
        }

        try {
            // Exchange code for tokens via backend
            const response = await authenticatedFetch(
                `/api/calendar/callback/${provider}?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
                { method: 'POST' }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to connect calendar');
            }

            const data = await response.json();

            setStatus('success');
            setMessage(`${data.message || 'Calendar connected successfully!'}`);

            // Redirect back to integrations page after 2 seconds
            setTimeout(() => router.push('/integrations'), 2000);

        } catch (error: any) {
            console.error('OAuth callback error:', error);
            setStatus('error');
            setMessage(error.message || 'Failed to connect calendar. Please try again.');
            setTimeout(() => router.push('/integrations'), 3000);
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            animation: 'fadeIn 0.5s ease-out'
        }}>
            <div className="card" style={{
                maxWidth: '500px',
                textAlign: 'center',
                padding: '3rem'
            }}>
                {status === 'loading' && (
                    <>
                        <div style={{
                            fontSize: '4rem',
                            marginBottom: '1.5rem',
                            animation: 'pulse 1.5s ease-in-out infinite'
                        }}>
                            📅
                        </div>
                        <h2 style={{ marginBottom: '1rem' }}>Connecting Calendar...</h2>
                        <p style={{ opacity: 0.6 }}>Securely exchanging OAuth tokens</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div style={{
                            fontSize: '4rem',
                            marginBottom: '1.5rem',
                            animation: 'scaleIn 0.5s ease-out'
                        }}>
                            ✅
                        </div>
                        <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Success!</h2>
                        <p style={{ opacity: 0.8 }}>{message}</p>
                        <p style={{ opacity: 0.5, fontSize: '0.9rem', marginTop: '1rem' }}>
                            Redirecting you back to integrations...
                        </p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div style={{
                            fontSize: '4rem',
                            marginBottom: '1.5rem'
                        }}>
                            ❌
                        </div>
                        <h2 style={{ marginBottom: '1rem', color: '#ff6b6b' }}>Connection Failed</h2>
                        <p style={{ opacity: 0.8 }}>{message}</p>
                        <p style={{ opacity: 0.5, fontSize: '0.9rem', marginTop: '1rem' }}>
                            Redirecting you back to try again...
                        </p>
                    </>
                )}
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(1.1);
                        opacity: 0.8;
                    }
                }

                @keyframes scaleIn {
                    0% {
                        transform: scale(0.5);
                        opacity: 0;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
}
